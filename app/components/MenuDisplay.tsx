'use client'

interface MenuItem {
  japanese: string
  english: string
}

interface MenuDisplayProps {
  items: MenuItem[]
}

export default function MenuDisplay({ items }: MenuDisplayProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Translated Menu</h2>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
              <p className="text-lg font-medium">{item.japanese}</p>
              <p className="text-gray-600 dark:text-gray-300">{item.english}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 