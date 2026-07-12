'use client'

import { Printer } from 'lucide-react'

export default function PrintButton() {
  return (
    <button 
      onClick={() => { window.print() }}
      className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all text-sm font-semibold shadow-sm active:scale-[0.98]"
    >
      <Printer className="w-4 h-4" />
      Imprimer la Fiche (PDF)
    </button>
  )
}