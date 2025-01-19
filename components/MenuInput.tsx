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
    if (!file) {
      return
    }

    setIsLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await fetch('/api/analyze-menu', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      console.log('API Response:', data) // Add debug log

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to analyze menu')
      }

      onMenuAnalyzed(data)
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
                value={input}
                onChange={handleInputChange}
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
              disabled={isLoading || (!file && !input.trim())}
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

