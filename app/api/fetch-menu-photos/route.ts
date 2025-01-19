import { NextRequest, NextResponse } from 'next/server'

async function expandShortenedUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
    })
    return response.url
  } catch (error) {
    console.error('Error expanding URL:', error)
    throw new Error('Failed to expand shortened URL')
  }
}

function extractPlaceId(url: string): string | null {
  console.log('Attempting to extract place ID from:', url)
  
  // Try to extract from URL parameters first
  try {
    const urlObj = new URL(url)
    const placeIdParam = urlObj.searchParams.get('place_id')
    if (placeIdParam) {
      console.log('Found place_id in URL parameters:', placeIdParam)
      return placeIdParam
    }
  } catch (e) {
    console.error('Error parsing URL:', e)
  }

  // Try to find the /g/ reference ID first (this is often the actual place ID)
  const gMatch = url.match(/!16s%2Fg%2F([^%?!]+)/) || url.match(/\/g\/([^/?!]+)/)
  if (gMatch && gMatch[1]) {
    const placeId = gMatch[1]
    console.log('Found /g/ reference ID:', placeId)
    return placeId
  }

  // Look for the hex ID in the URL as fallback
  const hexMatch = url.match(/!1s(0x[0-9a-f]+:0x[0-9a-f]+)/) || 
                  url.match(/!3m6!1s(0x[0-9a-f]+:0x[0-9a-f]+)/) ||
                  url.match(/!4m[0-9]+![0-9]m[0-9]+!1s(0x[0-9a-f]+:0x[0-9a-f]+)/)
  
  if (hexMatch && hexMatch[1]) {
    const fullHexId = hexMatch[1]
    console.log('Found hex ID:', fullHexId)
    return fullHexId
  }

  console.log('No valid place ID found in URL')
  return null
}

async function findPlaceId(restaurantName: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(restaurantName)}&inputtype=textquery&fields=place_id&key=${process.env.GOOGLE_MAPS_API_KEY}`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    )

    if (!response.ok) {
      console.error('Find Place API error:', await response.text())
      return null
    }

    const data = await response.json()
    if (data.status === 'OK' && data.candidates && data.candidates[0]) {
      const placeId = data.candidates[0].place_id
      console.log('Found place ID via Find Place API:', placeId)
      return placeId
    }
    return null
  } catch (error) {
    console.error('Error finding place ID:', error)
    return null
  }
}

// Remove dynamic and revalidate exports as they might be causing issues
// export const dynamic = 'force-dynamic'
// export const revalidate = 0

// Export the GET function directly
export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl.searchParams.get('url')
    let placeId = req.nextUrl.searchParams.get('placeId')

    console.log('API route hit with URL:', url)

    if (!url && !placeId) {
      return NextResponse.json(
        { error: 'URL or Place ID is required' },
        { status: 400 }
      )
    }

    if (url && !placeId) {
      if (url.includes('maps.app.goo.gl')) {
        try {
          const expandedUrl = await expandShortenedUrl(url)
          console.log('Expanded URL:', expandedUrl)
          
          // Extract restaurant name from URL
          const nameMatch = expandedUrl.match(/\/place\/([^/@]+)/)
          if (nameMatch && nameMatch[1]) {
            const restaurantName = decodeURIComponent(nameMatch[1])
            console.log('Extracted restaurant name:', restaurantName)
            placeId = await findPlaceId(restaurantName)
          }

          if (!placeId) {
            // Fallback to our previous extraction methods
            placeId = extractPlaceId(expandedUrl)
          }
        } catch (error) {
          console.error('Error processing URL:', error)
          return NextResponse.json(
            { error: 'Failed to process URL' },
            { status: 400 }
          )
        }
      } else {
        placeId = extractPlaceId(url)
      }

      if (!placeId) {
        return NextResponse.json(
          { error: 'Could not extract place ID from URL. Please use a direct Google Maps place URL.' },
          { status: 400 }
        )
      }
    }

    // Remove the hex ID conversion since we're now using the Find Place API
    console.log('Using place ID:', placeId)

    if (!process.env.GOOGLE_MAPS_API_KEY) {
      console.error('Google Maps API key not found')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Validate the place ID format - allow both ChIJ and direct IDs
    if (!placeId) {
      console.error('No valid place ID found')
      return NextResponse.json(
        { error: 'Invalid place ID format' },
        { status: 400 }
      )
    }

    // Use the Places API with place_id parameter and request all available photo fields
    console.log('Fetching details for place ID:', placeId)
    const detailsResponse = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?` +
      `place_id=${placeId}` +
      `&fields=photos(photo_reference,html_attributions,height,width),name` +
      `&key=${process.env.GOOGLE_MAPS_API_KEY}`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    )

    if (!detailsResponse.ok) {
      const errorText = await detailsResponse.text()
      console.error('Google Places API error:', errorText)
      return NextResponse.json(
        { error: 'Failed to fetch place details' },
        { status: 500 }
      )
    }

    const detailsData = await detailsResponse.json()
    console.log('Place details:', detailsData)

    if (detailsData.status === 'INVALID_REQUEST' || detailsData.status === 'NOT_FOUND') {
      return NextResponse.json(
        { error: 'Invalid place ID or place not found' },
        { status: 400 }
      )
    }

    if (!detailsData.result?.photos) {
      return NextResponse.json(
        { error: 'No photos found' },
        { status: 404 }
      )
    }

    // Log detailed photo information
    const photos = detailsData.result.photos;
    console.log('Photos metadata:', photos.map((p: any) => ({
      photo_reference: p.photo_reference,
      height: p.height,
      width: p.width,
      html_attributions: p.html_attributions
    })));

    const photoUrls = await Promise.all(
      photos
        .slice(0, 10)
        .map(async (photo: any) => {
          // Get photo with maximum resolution
          const photoResponse = await fetch(
            `https://maps.googleapis.com/maps/api/place/photo?` +
            `maxwidth=4800&` +  // Maximum supported width
            `maxheight=4800&` + // Maximum supported height
            `photo_reference=${photo.photo_reference}&` +
            `key=${process.env.GOOGLE_MAPS_API_KEY}`
          )
          return {
            url: photoResponse.url,
            height: photo.height,
            width: photo.width,
            html_attributions: photo.html_attributions
          }
        })
    )

    if (photoUrls.length === 0) {
      return NextResponse.json(
        { error: 'No photos found' },
        { status: 404 }
      )
    }

    console.log('Found photos:', {
      total: photos.length,
      returning: photoUrls.length,
      sample_metadata: photoUrls[0]
    });

    return NextResponse.json({
      photos: photoUrls,
      restaurantName: detailsData.result.name
    })
  } catch (error) {
    console.error('Failed to fetch menu photos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch menu photos' },
      { status: 500 }
    )
  }
} 