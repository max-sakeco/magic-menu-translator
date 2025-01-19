import { NextResponse } from 'next/server'
import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not configured in environment variables')
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

console.log('API Key exists:', !!process.env.OPENAI_API_KEY)

interface OpenAIError {
  message: string;
}

export async function POST(request: Request) {
  try {
    console.log('1. Starting POST request')
    const formData = await request.formData()
    const image = formData.get('image') as File
    
    if (!image) {
      console.log('No image found in request')
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    console.log('2. Image received:', image.name, 'Size:', image.size)

    try {
      console.log('3. Converting image to base64')
      const bytes = await image.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64Image = buffer.toString('base64')

      console.log('4. Making OpenAI API request')
      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this Japanese menu image and return ONLY a JSON object in this exact format, with no additional text or markdown: { \"items\": [ { \"japanese\": \"item in japanese\", \"english\": \"translation\" } ] }"
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ],
          },
        ],
        max_tokens: 1000,
        response_format: { type: "json_object" }
      })

      // Parse the response
      try {
        const content = response.choices[0].message.content
        if (!content) {
          throw new Error('No content in response')
        }
        
        console.log('Raw response:', content)
        const parsedData = JSON.parse(content)
        return NextResponse.json(parsedData)
      } catch (parseError) {
        console.error('Failed to parse OpenAI response as JSON:', parseError)
        const content = response.choices[0].message.content || ''
        return NextResponse.json(
          { error: 'Invalid response format from OpenAI', raw: content },
          { status: 500 }
        )
      }
    } catch (error) {
      const openaiError = error as OpenAIError
      console.error('OpenAI API Error:', openaiError)
      console.error('Full error object:', JSON.stringify(error, null, 2))
      return NextResponse.json(
        { error: 'OpenAI API error', details: openaiError.message },
        { status: 500 }
      )
    }
  } catch (error) {
    const serverError = error as Error
    console.error('Server Error:', serverError)
    console.error('Full error stack:', serverError.stack)
    return NextResponse.json(
      { error: 'Failed to process image', details: serverError.message },
      { status: 500 }
    )
  }
} 