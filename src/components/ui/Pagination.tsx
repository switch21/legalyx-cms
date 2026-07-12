'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  total: number
  currentPage: number
  limit: number
}

export default function Pagination({ total, currentPage, limit }: PaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const totalPages = Math.max(1, Math.ceil(total / limit))

  if (totalPages <= 1) return null

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (page <= 1) {
      params.delete('page')
    } else {
      params.set('page', String(page))
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const getPageNumbers = () => {
    const pages: (number | '...')[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push('...')
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      for (let i = start; i <= end; i++) pages.push(i)
      if (currentPage < totalPages - 2) pages.push('...')
      pages.push(totalPages)
    }
    return pages
  }

  return (
    <div className="flex items-center justify-between text-sm text-gray-500">
      <p className="hidden sm:block">
        Page {currentPage} sur {totalPages} ({total} r&eacute;sultat{total !== 1 ? 's' : ''})
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Page pr&eacute;c&eacute;dente"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {getPageNumbers().map((p, i) =>
          p === '...' ? (
            <span key={`dots-${i}`} className="px-2 text-gray-400">...</span>
          ) : (
            <button
              key={p}
              onClick={() => goToPage(p)}
              className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors ${
                p === currentPage
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
              aria-label={`Page ${p}`}
              aria-current={p === currentPage ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Page suivante"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}