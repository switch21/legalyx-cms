/**
 * Centralized role definitions for Legalyx CMS.
 * The DB enum is: user_role = 'ADMIN' | 'GREFFIER' | 'JUGE' | 'AVOCAT' | 'PARTIE'
 * This module maps those raw values to human-readable French labels.
 */

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrateur',
  GREFFIER: 'Greffier',
  JUGE: 'Juge / Magistrat',
  AVOCAT: 'Avocat',
  PARTIE: 'Partie',
} as const;

/** Return a human-readable French label for a DB role value. */
export function getRoleLabel(role: string | null | undefined): string {
  if (!role) return 'Utilisateur';
  return ROLE_LABELS[role] || role;
}

/** Return the Tailwind badge classes for a given role. */
export function getRoleBadgeClasses(role: string | null | undefined): string {
  switch (role) {
    case 'ADMIN':
      return 'bg-red-50 text-red-700 border border-red-100';
    case 'JUGE':
      return 'bg-amber-50 text-amber-700 border border-amber-100';
    case 'GREFFIER':
      return 'bg-blue-50 text-blue-700 border border-blue-100';
    case 'AVOCAT':
      return 'bg-purple-50 text-purple-700 border border-purple-100';
    default:
      return 'bg-gray-50 text-gray-700 border border-gray-100';
  }
}