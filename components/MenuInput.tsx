'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Upload, Link, CheckCircle, Loader2 } from 'lucide-react'

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
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzeMenu = useCallback(async (imageFile: File) => {
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await fetch('/api/analyze-menu', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      onMenuAnalyzed({
        items: data.items || [],
        photos: [URL.createObjectURL(imageFile)],
        restaurantName: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze menu');
      console.error('Error analyzing menu:', err);
    } finally {
      setIsLoading(false);
    }
  }, [onMenuAnalyzed]);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile && droppedFile.type.startsWith('image/')) {
        setFile(droppedFile);
        analyzeMenu(droppedFile);
      }
    },
    [analyzeMenu]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        setFile(selectedFile);
        analyzeMenu(selectedFile);
      }
    },
    [analyzeMenu]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center">
            Upload Menu Photo
          </CardTitle>
          <CardDescription className="text-center">
            Drag and drop a menu photo or click to select
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center
              ${file ? 'border-green-500' : 'border-gray-300'}
              hover:border-gray-400 transition-colors duration-200
              cursor-pointer
            `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            {isLoading ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                <p className="text-sm text-gray-500">Analyzing menu...</p>
              </div>
            ) : file ? (
              <div className="flex flex-col items-center gap-2">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <p className="text-sm text-gray-500">{file.name}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-500">
                  Click or drag and drop to upload
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileSelect}
            />
          </div>
          {error && (
            <p className="mt-4 text-sm text-red-500 text-center">{error}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

