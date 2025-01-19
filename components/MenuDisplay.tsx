'use client'

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'

interface MenuItem {
  japanese: string;
  english: string;
}

interface MenuDisplayProps {
  items: MenuItem[];
}

export default function MenuDisplay({ items }: MenuDisplayProps) {
  const [viewMode, setViewMode] = useState<'traditional' | 'ingredient'>('traditional')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="bg-white dark:bg-gray-800 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Menu Display</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="view-mode"
              checked={viewMode === 'ingredient'}
              onCheckedChange={() =>
                setViewMode(viewMode === 'traditional' ? 'ingredient' : 'traditional')
              }
            />
            <Label htmlFor="view-mode" className="text-gray-700 dark:text-gray-300">
              {viewMode === 'traditional' ? 'Traditional Categories' : 'Ingredient-based Categories'}
            </Label>
          </div>
          
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
                <p className="text-lg font-medium">{item.japanese}</p>
                <p className="text-gray-600 dark:text-gray-300">{item.english}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

