'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'

interface PhotoData {
  url: string
  height: number
  width: number
  html_attributions: string[]
}

export default function TestPhotos() {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [photos, setPhotos] = useState<PhotoData[]>([])
  const [restaurantName, setRestaurantName] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!url.trim()) {
        throw new Error('Please enter a Google Maps URL')
      }

      const response = await fetch(`/api/fetch-menu-photos?url=${encodeURIComponent(url)}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch photos')
      }
      
      const data = await response.json()
      console.log('Received photos data:', data)

      if (!data.photos || data.photos.length === 0) {
        throw new Error('No photos found for this restaurant')
      }

      setPhotos(data.photos)
      setRestaurantName(data.restaurantName || 'Unknown Restaurant')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch photos')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Google Places Photo Test
      </h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Enter Restaurant URL</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="Paste Google Maps URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full"
            />
            <Button 
              type="submit" 
              disabled={isLoading || !url.trim()}
            >
              {isLoading ? 'Fetching Photos...' : 'Get Photos'}
            </Button>
          </form>
          {error && (
            <p className="mt-2 text-sm text-red-500">{error}</p>
          )}
        </CardContent>
      </Card>

      {photos.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">{restaurantName}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.map((photo, index) => (
              <div key={index} className="relative aspect-[4/3] rounded-lg overflow-hidden">
                <Image
                  src={photo.url}
                  alt={`Restaurant photo ${index + 1}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                  unoptimized
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 