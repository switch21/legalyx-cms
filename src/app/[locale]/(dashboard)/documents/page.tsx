'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { FileText, Upload, Download, Search, Database, Trash2, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react'
import { uploadDocument, removeDocument } from '@/lib/actions/documents'
import { createBrowserClient } from '@supabase/ssr'
import Pagination from '@/components/ui/Pagination'

interface Doc {
  id: string
  original_name: string
  file_size: number
  mime_type: string
  category: string
  created_at: string
  uploader_name: string
  dossier_id: string
  dossier_numero: string
  dossier_titre: string
  storage_path: string
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

function getCategoryStyle(cat: string) {
  switch(cat) {
    case 'conclusions': return 'bg-purple-50 text-purple-700 border border-purple-100'
    case 'jugement': return 'bg-amber-50 text-amber-700 border border-amber-100'
    case 'acte': return 'bg-red-50 text-red-700 border border-red-100'
    default: return 'bg-blue-50 text-blue-700 border border-blue-100'
  }
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Doc[]>([])
  const [dossiers, setDossiers] = useState<{ id: string; numero: string; titre: string }[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploadMsg, setUploadMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedDossier, setSelectedDossier] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('piece_jointe')
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const loadData = async () => {
    setLoading(true)
    try {
      const [docsRes, countRes, dossiersRes] = await Promise.all([
        supabase.rpc('get_all_documents', { p_limit: 50, p_offset: 0 }),
        supabase.rpc('count_documents'),
        supabase.rpc('get_dossiers_select'),
      ])
      if (docsRes.data) setDocuments(docsRes.data)
      if (countRes.data) setTotalCount(countRes.data as number)
      if (dossiersRes.data) setDossiers(dossiersRes.data)
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const handleUpload = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setUploadMsg(null)
    const formData = new FormData(e.currentTarget)
    formData.set('dossier_id', selectedDossier)
    formData.set('category', selectedCategory)
    startTransition(async () => {
      const result = await uploadDocument(formData)
      if (result?.error) {
        setUploadMsg({ type: 'error', text: result.error })
      } else {
        setUploadMsg({ type: 'success', text: 'Document déposé avec succès.' })
        setSelectedDossier('')
        if (fileInputRef.current) fileInputRef.current.value = ''
        loadData()
      }
    })
  }

  const handleDelete = async (docId: string) => {
    if (!confirm('Supprimer ce document ?')) return
    const formData = new FormData()
    formData.append('id', docId)
    const result = await removeDocument(formData)
    if (result?.error) {
      alert(result.error)
    } else {
      loadData()
    }
  }

  const handleDownload = async (doc: Doc) => {
    const { data } = await supabase.storage
      .from('documents')
      .createSignedUrl(doc.storage_path, 3600)
    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank')
    }
  }

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      piece_jointe: 'Pièce Jointe',
      conclusions: 'Conclusions',
      acte: 'Acte de Procédure',
      jugement: 'Jugement / Décision',
    }
    return labels[cat] || cat
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestion Documentaire</h1>
        <p className="text-sm text-gray-500 mt-1">Déposez et consultez les pièces jointes et actes juridiques des dossiers.</p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3 text-sm text-red-800">
          <Database className="w-5 h-5 text-red-600 shrink-0" />
          <p className="font-semibold">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Zone */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-fit space-y-4">
          <h2 className="font-semibold text-gray-900 text-lg">Déposer une nouvelle pièce</h2>
          
          {uploadMsg && (
            <div className={`p-3 rounded-xl text-sm flex items-center gap-2 ${
              uploadMsg.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' 
                : 'bg-red-50 text-red-800 border border-red-100'
            }`}>
              {uploadMsg.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              {uploadMsg.text}
            </div>
          )}

          <form onSubmit={handleUpload} className="space-y-3">
            <div className="border-2 border-dashed border-gray-200 hover:border-primary/50 transition-colors rounded-2xl p-6 text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <input
                ref={fileInputRef}
                type="file"
                name="file"
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                required
                className="text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
              <p className="text-xs text-gray-400 mt-2">PDF, PNG, JPG, DOCX (Max 10 Mo)</p>
            </div>

            <div>
              <label htmlFor="upload-dossier" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Dossier Associé *</label>
              <select
                id="upload-dossier"
                value={selectedDossier}
                onChange={(e) => setSelectedDossier(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm text-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Sélectionner un dossier...</option>
                {dossiers.map(d => (
                  <option key={d.id} value={d.id}>{d.numero} - {d.titre}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="upload-category" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Catégorie</label>
              <select
                id="upload-category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm text-gray-700 focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="piece_jointe">Pièce Jointe</option>
                <option value="conclusions">Conclusions</option>
                <option value="acte">Acte de Procédure</option>
                <option value="jugement">Jugement / Décision</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isPending || !selectedDossier}
              className="w-full py-3 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Dépôt en cours...' : 'Déposer le document'}
            </button>
          </form>
        </div>

        {/* Documents Table */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center text-gray-400 animate-pulse">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Chargement des documents...</p>
            </div>
          ) : documents.length > 0 ? (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      <th className="px-6 py-4 font-medium">Fichier</th>
                      <th className="px-6 py-4 font-medium">Dossier</th>
                      <th className="px-6 py-4 font-medium">Catégorie</th>
                      <th className="px-6 py-4 font-medium">Taille</th>
                      <th className="px-6 py-4 font-medium">Date</th>
                      <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-semibold text-gray-900 block max-w-[180px] truncate" title={doc.original_name}>
                                {doc.original_name}
                              </span>
                              <span className="text-xs text-gray-400 block mt-0.5">par {doc.uploader_name}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-primary font-bold">{doc.dossier_numero}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryStyle(doc.category)}`}>
                            {getCategoryLabel(doc.category)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500">{formatSize(doc.file_size)}</td>
                        <td className="px-6 py-4 text-xs text-gray-500">{new Date(doc.created_at).toLocaleDateString('fr-FR')}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => handleDownload(doc)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-primary transition-colors" title="Télécharger">
                              <Download className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(doc.id)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-red-600 transition-colors" title="Supprimer">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 text-center py-20 text-gray-400">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-sm font-medium text-gray-500">Aucun document déposé</p>
              <p className="text-xs text-gray-400 mt-1">Les documents associés aux dossiers apparaîtront ici.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}