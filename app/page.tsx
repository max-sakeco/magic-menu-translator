'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import MenuInput from '@/components/MenuInput'
import MenuDisplay from '@/components/MenuDisplay'
import RestaurantsTab from '@/components/RestaurantsTab'

interface MenuItem {
  japanese: string
  english: string
}

interface MenuData {
  items: MenuItem[]
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('menu')
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  
  const handleMenuAnalyzed = (data: MenuData) => {
    try {
      console.log('Received data:', data)
      setMenuItems(data.items || [])
    } catch (err) {
      console.error('Failed to process menu items:', err)
      setMenuItems([])
    }
  }

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
            <MenuDisplay items={menuItems} />
          </TabsContent>
          <TabsContent value="restaurants">
            <RestaurantsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

