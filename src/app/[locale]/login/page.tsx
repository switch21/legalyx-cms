'use client'

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Shield, Loader2, AlertCircle } from 'lucide-react';
import { login } from './actions';

export default function LoginPage() {
  const t = useTranslations('Index');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await login(formData);
      if (res && res.error) {
        setError(res.error);
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute top-40 -left-40 w-96 h-96 rounded-full bg-secondary/5 blur-3xl"></div>
      </div>

      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl z-10 border border-gray-100 relative">
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
          <div className="w-24 h-24 bg-primary rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
            <Shield className="w-12 h-12 text-white" />
          </div>
        </div>
        
        <div className="text-center pt-8">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">LEGALYX CMS</h2>
          <p className="mt-2 text-sm text-gray-500">Portail Judiciaire Sécurisé</p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 text-sm text-red-800 animate-in fade-in slide-in-from-top-1 duration-200">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
            <div>
              <p className="font-semibold">Erreur de connexion</p>
              <p className="text-xs text-red-700/95 mt-0.5">{error}</p>
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Adresse email professionnelle</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                placeholder="pat.epee@gmail.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mot de passe</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Se souvenir de moi
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-primary hover:text-primary/80 transition-colors">
                Mot de passe oublié ?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                'Connexion Sécurisée'
              )}
            </button>
          </div>
        </form>
        
        <div className="pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            Accès restreint au personnel autorisé. Toute tentative d'accès non autorisé fera l'objet de poursuites.
          </p>
        </div>
      </div>
    </div>
  );
}
