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

/**
 * Permission map: which sidebar routes each role can see.
 * Routes not listed are visible to everyone (Dashboard, Dossiers, Audiences, Documents, Paramètres).
 */
export const ROLE_VISIBLE_ROUTES: Record<string, string[]> = {
  ADMIN: ['/utilisateurs', '/audit'],
  GREFFIER: [],
  JUGE: [],
  AVOCAT: [],
  PARTIE: [],
} as const;

/** Check if a given role can access a specific route in the sidebar. */
export function canSeeRoute(role: string | null | undefined, href: string): boolean {
  // Routes visible to everyone (including when role is unknown)
  const openRoutes = ['/', '/dossiers', '/audiences', '/documents', '/parametres'];
  if (openRoutes.includes(href)) return true;
  // Role-specific routes require a known role
  if (!role) return false;
  const allowed = ROLE_VISIBLE_ROUTES[role];
  return allowed ? allowed.includes(href) : false;
}

/**
 * Status labels — maps DB enum values to French display labels.
 * DB enum: dossier_status = 'OUVERT' | 'EN_INSTRUCTION' | 'AUDIENCE' | 'JUGEMENT' | 'ARCHIVE'
 */
export const STATUS_LABELS: Record<string, string> = {
  OUVERT: 'Ouvert',
  EN_INSTRUCTION: 'En Instruction',
  AUDIENCE: 'Audience',
  JUGEMENT: 'Jugement',
  ARCHIVE: 'Archivé',
} as const;

/** Return a human-readable French label for a dossier status value. */
export function getStatusLabel(status: string | null | undefined): string {
  if (!status) return '';
  return STATUS_LABELS[status] || status.replace(/_/g, ' ');
}