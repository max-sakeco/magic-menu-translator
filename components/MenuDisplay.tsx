'use client'

import { useState, useMemo } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'

interface MenuItem {
  japanese: string;
  english: string;
  category: 'meat' | 'fish' | 'vegetarian' | 'vegan';
  cookingMethod: 'fried' | 'stir-fried' | 'boiled' | 'grilled' | 'raw' | 'other';
  price?: number;
  nutrition: {
    protein: 'high' | 'medium' | 'low';
    carbs: 'high' | 'medium' | 'low';
    salt: 'high' | 'medium' | 'low';
    sugar: 'high' | 'medium' | 'low';
  };
}

interface MenuDisplayProps {
  items: MenuItem[];
  photos?: string[];
}

export default function MenuDisplay({ items, photos = [] }: MenuDisplayProps) {
  const [viewMode, setViewMode] = useState<'traditional' | 'ingredient'>('traditional')

  // Group items by category
  const categorizedItems = useMemo(() => {
    return items.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, MenuItem[]>);
  }, [items]);

  const getNutritionBarStyle = (level: 'high' | 'medium' | 'low') => {
    const width = {
      high: 'w-[200px]',
      medium: 'w-[125px]',
      low: 'w-[50px]'
    };
    
    return `h-2 rounded-full ${width[level]} bg-black dark:bg-white`;
  };

  const renderMenuItem = (item: MenuItem) => (
    <div className="border-b last:border-0 pb-4 last:pb-0">
      <div className="flex flex-col">
        <div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-lg font-medium">{item.japanese}</p>
              <p className="text-gray-600 dark:text-gray-300">{item.english}</p>
            </div>
            {item.price && (
              <p className="text-lg font-medium">¥{item.price.toLocaleString()}</p>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-500">{item.cookingMethod}</span>
            <span className="text-sm text-gray-500">•</span>
            <span className="text-sm text-gray-500">{item.category}</span>
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 w-14">Protein</span>
              <div className={getNutritionBarStyle(item.nutrition.protein)} />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 w-14">Carbs</span>
              <div className={getNutritionBarStyle(item.nutrition.carbs)} />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 w-14">Salt</span>
              <div className={getNutritionBarStyle(item.nutrition.salt)} />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 w-14">Sugar</span>
              <div className={getNutritionBarStyle(item.nutrition.sugar)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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
          {photos.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {photos.map((photo, index) => (
                <div key={index} className="relative aspect-[4/3] rounded-lg overflow-hidden">
                  <img
                    src={photo}
                    alt={`Menu photo ${index + 1}`}
                    className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Switch
              id="view-mode"
              checked={viewMode === 'ingredient'}
              onCheckedChange={() =>
                setViewMode(viewMode === 'traditional' ? 'ingredient' : 'traditional')
              }
            />
            <Label htmlFor="view-mode" className="text-gray-700 dark:text-gray-300">
              {viewMode === 'traditional' ? 'Traditional View' : 'Ingredient-based View'}
            </Label>
          </div>
          
          {viewMode === 'traditional' ? (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index}>
                  {renderMenuItem(item)}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(categorizedItems).map(([category, categoryItems]) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold mb-3 capitalize">{category}</h3>
                  <div className="space-y-4">
                    {categoryItems.map((item, index) => (
                      <div key={index}>
                        {renderMenuItem(item)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

