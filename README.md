# ⚖️ Legalyx CMS — Court Management System

<div align="center">

![Legalyx CMS](https://img.shields.io/badge/Legalyx-CMS-1E3A8A?style=for-the-badge&logo=shield&logoColor=FBBF24)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3ECF8E?style=for-the-badge&logo=supabase)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=for-the-badge&logo=tailwindcss)

**Système de Gestion de Tribunal — Conçu pour le Cameroun et l'Afrique**

[Français](#) • [English](#getting-started)

</div>

---

## 📋 Table des matières

- [Présentation](#présentation)
- [Fonctionnalités](#-fonctionnalités)
- [Stack Technique](#-stack-technique)
- [Prérequis](#prérequis)
- [Installation](#-installation)
- [Configuration Supabase](#-configuration-supabase)
- [Démarrage](#-démarrage)
- [Structure du Projet](#-structure-du-projet)
- [Utilisateurs de Démonstration](#-utilisateurs-de-démonstration)
- [Déploiement](#-déploiement)
- [Feuille de Route](#-feuille-de-route)

---

## Présentation

**Legalyx CMS** est un système de gestion de tribunal (Court Management System) moderne, sécurisé et conforme aux normes juridiques camerounaises. Il couvre le droit civil, pénal, commercial (OHADA), social et administratif.

### Contexte

| Paramètre | Valeur |
|---|---|
| **Juridiction** | Cameroun (droit civil, pénal, commercial OHADA, social, administratif) |
| **Capacité** | ~100 utilisateurs simultanés, ~100 dossiers/jour |
| **Langues** | Français, English |
| **Hébergement** | Cloud (Supabase + Vercel) |

---

## ✨ Fonctionnalités

### MVP — Phase 1

| Module | Description |
|---|---|
| 🔐 **Authentification** | Supabase Auth avec rôles (ADMIN, GREFFIER, JUGE, AVOCAT, PARTIE) |
| 📂 **Gestion des Dossiers** | Création, suivi, archivage, numérotation officielle automatique |
| 📅 **Calendrier & Audiences** | Planification, gestion des salles, prochaines audiences |
| 📄 **Gestion Documentaire** | Upload, classification, recherche |
| 👥 **Gestion des Utilisateurs** | Profils, rôles, permissions RLS |
| 📊 **Tableau de Bord** | Vue d'ensemble en temps réel, alertes, statistiques |
| 🔍 **Journal d'Audit** | Traçabilité complète de toutes les actions |
| ⚙️ **Paramètres** | Configuration système |
| 📑 **Génération PDF** | Export des documents officiels |

### Prochaines phases

- 🖊️ Signature électronique
- 🔗 Intégration avec les systèmes juridiques nationaux
- 📱 Application mobile
- 🌍 Extension marchés africains

---

## 🛠 Stack Technique

| Couche | Technologie |
|---|---|
| **Frontend** | [Next.js 16](https://nextjs.org) (App Router, RSC) |
| **Langage** | [TypeScript 5](https://www.typescriptlang.org) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) |
| **Backend & Auth** | [Supabase](https://supabase.com) (PostgreSQL, Auth, RLS) |
| **i18n** | [next-intl](https://next-intl-docs.vercel.app/) (fr/en) |
| **Icônes** | [Lucide React](https://lucide.dev) |
| **Dates** | [date-fns](https://date-fns.org/) |

---

## Prérequis

- **Node.js** ≥ 18.17
- **npm** ≥ 9
- Un compte [Supabase](https://supabase.com) (gratuit)
- [Git](https://git-scm.com/)

---

## 🚀 Installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/VOTRE_USERNAME/legalyx-cms.git
cd legalyx-cms

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env.local
# Éditez .env.local avec vos clés Supabase
```

---

## 🔧 Configuration Supabase

### 1. Créer un projet Supabase

1. Allez sur [app.supabase.com](https://app.supabase.com)
2. Cliquez sur **New Project**
3. Choisissez un nom (ex: `legalyx-cms`)
4. Sélectionnez la région la plus proche (ex: `West EU`)
5. Notez votre **mot de passe de base de données**

### 2. Récupérer les clés API

1. Allez dans **Settings > API**
2. Copiez l'**URL** et l'**anon key**
3. Collez-les dans votre fichier `.env.local`

### 3. Exécuter la migration SQL

1. Allez dans **SQL Editor** dans votre projet Supabase
2. Copiez le contenu du fichier `supabase/migrations/20260101000000_init.sql`
3. Exécutez le script

> ⚠️ **Important** : Le script crée automatiquement les tables, les politiques RLS, les triggers, les utilisateurs de démonstration et les données de seed.

---

## 🏃 Démarrage

```bash
# Mode développement
npm run dev

# Mode production
npm run build
npm start
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

---

## 📁 Structure du Projet

```
legalyx-cms/
├── messages/               # Fichiers de traduction (fr.json, en.json)
├── public/                 # Assets statiques
├── src/
│   ├── app/
│   │   ├── globals.css     # Thème Tailwind + couleurs Legalyx
│   │   └── [locale]/       # Routes internationalisées
│   │       ├── login/      # Page de connexion + actions serveur
│   │       └── (dashboard)/
│   │           ├── page.tsx          # Tableau de bord
│   │           ├── dossiers/         # Gestion des dossiers
│   │           ├── audiences/        # Calendrier & audiences
│   │           ├── documents/        # Gestion documentaire
│   │           ├── utilisateurs/     # Gestion des utilisateurs
│   │           ├── audit/            # Journal d'audit
│   │           └── parametres/       # Paramètres système
│   ├── components/
│   │   └── layout/         # Header, Sidebar
│   ├── i18n/               # Configuration i18n (routing, request)
│   ├── lib/
│   │   └── supabase/       # Clients Supabase (client, server, middleware)
│   └── middleware.ts       # Middleware i18n + auth
├── supabase/
│   └── migrations/         # Scripts SQL (schema + seed)
├── .env.example            # Template variables d'environnement
├── next.config.ts          # Configuration Next.js + i18n
├── tailwind.config.ts      # (v4: config inline dans globals.css)
└── package.json
```

---

## 👤 Utilisateurs de Démonstration

Les utilisateurs suivants sont créés automatiquement lors de l'exécution de la migration SQL :

| Email | Mot de passe | Rôle |
|---|---|---|
| `pat.epee@gmail.com` | `AdminLegalyx2026!` | **ADMIN** 👑 |
| `juge@legalyx.cm` | `JugeLegalyx2026!` | JUGE |
| `greffier@legalyx.cm` | `GreffierLegalyx2026!` | GREFFIER |

### Données de démonstration incluses

- **3 dossiers** : Civil (EN_INSTRUCTION), Commercial (OUVERT), Pénal (AUDIENCE)
- **2 audiences** planifiées avec attribution de juges
- **3 entrées d'audit** traçant la création des dossiers

---

## 🚀 Déploiement

### Vercel (Recommandé)

1. Connectez votre dépôt GitHub à [Vercel](https://vercel.com)
2. Ajoutez les variables d'environnement dans les Settings Vercel
3. Déployez !

### Variables d'environnement requises

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## 🗺 Feuille de Route

- [x] **Phase 1** — MVP (Authentification, Dossiers, Audiences, Documents, Audit)
- [ ] **Phase 2** — Notifications temps réel, Workflow judiciaire avancé
- [ ] **Phase 3** — Signature électronique, Intégrations externes
- [ ] **Phase 4** — Mobile (React Native / PWA)
- [ ] **Phase 5** — Extension multi-pays Afrique

---

## 🎨 Identité Visuelle

| Élément | Couleur | Hex |
|---|---|---|
| **Couleur principale** | Bleu Royal | `#1E3A8A` |
| **Couleur d'accent** | Or | `#FBBF24` |
| **Arrière-plan** | Blanc | `#FFFFFF` |

---

## 📜 Licence

Propriétaire — Tous droits réservés.

---

<div align="center">

**Développé avec ❤️ pour la justice camerounaise**

</div>
