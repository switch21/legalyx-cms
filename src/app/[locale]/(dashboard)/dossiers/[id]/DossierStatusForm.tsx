'use client'

import { useState, useTransition } from 'react';
import { updateDossierStatus } from '@/lib/actions/dossiers';
import { CheckCircle, Loader2 } from 'lucide-react';

const STATUSES = [
  { value: 'OUVERT', label: 'Ouvert', color: 'bg-blue-100 text-blue-800' },
  { value: 'EN_INSTRUCTION', label: 'En Instruction', color: 'bg-amber-100 text-amber-800' },
  { value: 'AUDIENCE', label: 'Audience', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'JUGEMENT', label: 'Jugement', color: 'bg-purple-100 text-purple-800' },
  { value: 'ARCHIVE', label: 'Archivé', color: 'bg-gray-100 text-gray-800' },
];

export default function DossierStatusForm({ dossierId, currentStatus }: { dossierId: string; currentStatus: string }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = (newStatus: string) => {
    if (newStatus === currentStatus) return;
    setMessage(null);
    const formData = new FormData();
    formData.append('id', dossierId);
    formData.append('status', newStatus);
    startTransition(async () => {
      const result = await updateDossierStatus(formData);
      if (result && result.error) {
        setMessage({ type: 'error', text: result.error });
      } else {
        setMessage({ type: 'success', text: 'Statut mis à jour.' });
        setTimeout(() => window.location.reload(), 1000);
      }
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => handleChange(s.value)}
            disabled={isPending || s.value === currentStatus}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
              s.value === currentStatus
                ? `${s.color} border-current ring-2 ring-offset-1 ring-gray-300`
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {s.label}
          </button>
        ))}
      </div>
      {message && (
        <p className={`text-xs flex items-center gap-1 ${message.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
          {message.type === 'success' ? <CheckCircle className="w-3 h-3" /> : null}
          {message.text}
        </p>
      )}
      {isPending && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
    </div>
  );
}