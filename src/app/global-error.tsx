'use client'

// global-error.tsx catches errors that bubble past ALL route-level
// error boundaries (e.g. errors in the root [locale]/layout.tsx).
// It MUST include its own <html> and <body> tags.

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="fr">
      <body style={{ background: '#f9fafb', margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '1rem',
          textAlign: 'center',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: '#fef2f2', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            marginBottom: '1.5rem',
          }}>
            <span style={{ fontSize: 32 }}>⚠</span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>
            Erreur critique
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem', maxWidth: 400 }}>
            {error.message || "Une erreur inattendue s'est produite. Veuillez recharger la page."}
          </p>
          <button
            onClick={reset}
            style={{
              padding: '0.625rem 1.5rem',
              background: '#1e3a5f',
              color: 'white',
              border: 'none',
              borderRadius: '0.75rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            Recharger
          </button>
        </div>
      </body>
    </html>
  )
}