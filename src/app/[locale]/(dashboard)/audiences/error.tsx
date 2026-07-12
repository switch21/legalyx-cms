'use client'

import { AlertTriangle } from 'lucide-react'

export default function AudiencesError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8 text-red-500" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Erreur de chargement</h2>
      <p className="text-sm text-gray-500 max-w-md mb-6">{error.message}</p>
      <button onClick={reset} className="px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors">Réessayer</button>
    </div>
  )
}