'use client'

import { useState } from 'react'
import { Upload } from 'lucide-react'

interface MenuInputProps {
  onMenuAnalyzed: (data: string) => void
}

export default function MenuInput({ onMenuAnalyzed }: MenuInputProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await fetch('/api/analyze-menu', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Failed to analyze menu')

      const data = await response.json()
      onMenuAnalyzed(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <label className="flex flex-col items-center gap-2 p-8 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
        <Upload className="w-8 h-8" />
        <span>Upload menu photo</span>
        <input
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileUpload}
          disabled={isLoading}
        />
      </label>
      {isLoading && <p>Analyzing menu...</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
} 