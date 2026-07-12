'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'

interface SearchBarProps {
  placeholder?: string
  paramName?: string
  className?: string
}

export default function SearchBar({
  placeholder = 'Rechercher...',
  paramName = 'q',
  className = ''
}: SearchBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get(paramName) || '')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const updateSearch = useCallback((term: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (term.trim()) {
      params.set(paramName, term.trim())
    } else {
      params.delete(paramName)
    }
    params.delete('page') // Reset to page 1 on search
    router.push(`${pathname}?${params.toString()}`)
  }, [router, pathname, searchParams, paramName])

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setValue(newValue)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => updateSearch(newValue), 300)
  }

  const handleClear = () => {
    setValue('')
    updateSearch('')
  }

  return (
    <div className={`relative ${className}`}>
      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-9 pr-9 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-sm"
        aria-label={placeholder}
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Effacer la recherche"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}