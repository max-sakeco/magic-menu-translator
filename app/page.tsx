'use client'

import { useState, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import MenuInput from '@/components/MenuInput'
import MenuDisplay from '@/components/MenuDisplay'
import RestaurantsTab from '@/components/RestaurantsTab'

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

export default function Home() {
  const [activeTab, setActiveTab] = useState('menu')
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [menuPhotos, setMenuPhotos] = useState<string[]>([])
  
  const handleMenuAnalyzed = useCallback((data: {
    items: MenuItem[];
    photos: string[];
    restaurantName: string;
  }) => {
    setMenuItems(data.items);
    setMenuPhotos(data.photos);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800 dark:text-gray-100">
          Magic Menu
        </h1>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="menu">Menu Translator</TabsTrigger>
            <TabsTrigger value="restaurants">My Restaurants</TabsTrigger>
          </TabsList>
          <TabsContent value="menu" className="space-y-8">
            <MenuInput onMenuAnalyzed={handleMenuAnalyzed} />
            <MenuDisplay items={menuItems} photos={menuPhotos} />
          </TabsContent>
          <TabsContent value="restaurants">
            <RestaurantsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

