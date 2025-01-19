'use client'

import { useState, useEffect } from 'react'
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'

interface Restaurant {
  id: string
  name: string
  address: string
  lat: number
  lng: number
}

const mapContainerStyle = {
  width: '100%',
  height: '400px'
}

const center = {
  lat: 35.6762, // Tokyo coordinates as default
  lng: 139.6503
}

export default function RestaurantsTab() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])

  useEffect(() => {
    // TODO: Fetch restaurants from the database
    // This is a mock data for demonstration
    setRestaurants([
      { id: '1', name: 'Sushi Place', address: '1-1 Chiyoda, Tokyo', lat: 35.6762, lng: 139.6503 },
      { id: '2', name: 'Ramen Shop', address: '2-2 Shibuya, Tokyo', lat: 35.6580, lng: 139.7016 },
    ])
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <Card className="bg-white dark:bg-gray-800 shadow-lg overflow-hidden">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-100">My Visited Restaurants</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={10}
              options={{ styles: [{ elementType: "labels", featureType: "poi", stylers: [{ visibility: "off" }] }] }}
            >
              {restaurants.map((restaurant) => (
                <Marker
                  key={restaurant.id}
                  position={{ lat: restaurant.lat, lng: restaurant.lng }}
                  title={restaurant.name}
                />
              ))}
            </GoogleMap>
          </LoadScript>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {restaurants.map((restaurant, index) => (
          <motion.div
            key={restaurant.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">{restaurant.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">{restaurant.address}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

