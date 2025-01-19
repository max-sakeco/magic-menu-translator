'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Upload, Link } from 'lucide-react'

interface MenuItem {
  japanese: string;
  english: string;
}

interface MenuData {
  items: MenuItem[];
  photos: string[];
  restaurantName: string;
}

interface MenuInputProps {
  onMenuAnalyzed: (data: MenuData) => void
}

export default function MenuInput({ onMenuAnalyzed }: MenuInputProps) {
  const [input, setInput] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [url, setUrl] = useState('')
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
    setFile(null) // Clear file if URL is being entered
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setFile(files[0])
      setInput(files[0].name) // Display filename in input
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (file) {
        // Handle file upload
        const formData = new FormData()
        formData.append('image', file)

        const response = await fetch('/api/analyze-menu', {
          method: 'POST',
          body: formData,
        })

        const data = await response.json()
        console.log('API Response:', data)

        if (!response.ok) {
          throw new Error(data.details || data.error || 'Failed to analyze menu')
        }

        onMenuAnalyzed({
          items: data.items || [],
          photos: [URL.createObjectURL(file)],
          restaurantName: ''
        })
      } else if (url.trim()) {
        // Handle Google Maps URL
        const response = await fetch(`/api/fetch-menu-photos?url=${encodeURIComponent(url)}`)
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch menu photos')
        }
        
        const data = await response.json()
        console.log('Received photos data:', data)

        if (!data.photos || data.photos.length === 0) {
          throw new Error('No menu photos found for this restaurant')
        }

        // Process each photo through the menu analyzer
        const menuResults = await Promise.all(
          data.photos.map(async (photoUrl: string) => {
            try {
              // Fetch the image
              const imageResponse = await fetch(photoUrl)
              const blob = await imageResponse.blob()

              // Convert to proper image format
              const img = new Image()
              img.src = URL.createObjectURL(blob)
              await new Promise((resolve) => (img.onload = resolve))

              const canvas = document.createElement('canvas')
              canvas.width = img.width
              canvas.height = img.height
              const ctx = canvas.getContext('2d')
              ctx?.drawImage(img, 0, 0)

              // Convert to JPEG format
              const jpegBlob = await new Promise<Blob>((resolve) => {
                canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.95)
              })

              const file = new File([jpegBlob], 'menu.jpg', { type: 'image/jpeg' })
              const formData = new FormData()
              formData.append('image', file)

              const analysisResponse = await fetch('/api/analyze-menu', {
                method: 'POST',
                body: formData,
              })

              if (!analysisResponse.ok) {
                throw new Error('Failed to analyze menu photo')
              }

              return await analysisResponse.json()
            } catch (err) {
              console.error('Error processing photo:', err)
              return { items: [] }
            }
          })
        )

        // Combine all menu items from different photos
        const combinedMenuItems = menuResults.reduce((acc, result) => {
          if (result.items && Array.isArray(result.items)) {
            return [...acc, ...result.items]
          }
          return acc
        }, [])

        onMenuAnalyzed({
          items: combinedMenuItems,
          photos: data.photos,
          restaurantName: data.restaurantName
        })
      } else {
        throw new Error('Please either upload a photo or enter a Google Maps URL')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      console.error('Error details:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      setFile(files[0])
      setInput(files[0].name)
    }
  }

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoadingPhotos(true)
    setError(null)

    try {
      if (!url.trim()) {
        throw new Error('Please enter a Google Maps URL')
      }

      const response = await fetch(`/api/fetch-menu-photos?url=${encodeURIComponent(url)}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch menu photos')
      }
      
      const data = await response.json()
      console.log('Received photos data:', data) // Debug log

      if (!data.photos || data.photos.length === 0) {
        throw new Error('No menu photos found for this restaurant')
      }

      // Process each photo through the menu analyzer
      const menuResults = await Promise.all(
        data.photos.map(async (photoUrl: string) => {
          try {
            // Fetch the image
            const imageResponse = await fetch(photoUrl)
            const blob = await imageResponse.blob()

            // Convert to proper image format
            const img = new Image()
            img.src = URL.createObjectURL(blob)
            await new Promise((resolve) => (img.onload = resolve))

            const canvas = document.createElement('canvas')
            canvas.width = img.width
            canvas.height = img.height
            const ctx = canvas.getContext('2d')
            ctx?.drawImage(img, 0, 0)

            // Convert to JPEG format
            const jpegBlob = await new Promise<Blob>((resolve) => {
              canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.95)
            })

            const file = new File([jpegBlob], 'menu.jpg', { type: 'image/jpeg' })
            const formData = new FormData()
            formData.append('image', file)

            const analysisResponse = await fetch('/api/analyze-menu', {
              method: 'POST',
              body: formData,
            })

            if (!analysisResponse.ok) {
              throw new Error('Failed to analyze menu photo')
            }

            return await analysisResponse.json()
          } catch (err) {
            console.error('Error processing photo:', err)
            return { items: [] } // Return empty items for failed photos
          }
        })
      )

      // Combine all menu items from different photos
      const combinedMenuItems = menuResults.reduce((acc, result) => {
        if (result.items && Array.isArray(result.items)) {
          return [...acc, ...result.items]
        }
        return acc
      }, [])

      // Pass both menu items and photos to parent
      onMenuAnalyzed({ 
        items: combinedMenuItems,
        photos: data.photos, // Include the photos from the API response
        restaurantName: data.restaurantName
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch menu photos')
    } finally {
      setIsLoadingPhotos(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-white dark:bg-gray-800 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Add the url of the restaurant or upload a photo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div 
              className="relative"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <Input
                type="text"
                placeholder="Paste Google Maps URL or click icon to upload menu photo"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full pr-20"
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={() => fileInputRef.current?.click()}
              >
                {file ? <Upload className="w-4 h-4" /> : <Link className="w-4 h-4" />}
              </Button>
            </div>
            <Button 
              type="submit" 
              size="sm" 
              className="mt-2"
              disabled={isLoading || (!url.trim() && !file)}
            >
              {isLoading ? 'Processing...' : 'Create my Magic Menu'}
            </Button>
          </form>
          {error && (
            <p className="mt-2 text-sm text-red-500">
              {error}
            </p>
          )}
          {file && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Selected file: {file.name}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

