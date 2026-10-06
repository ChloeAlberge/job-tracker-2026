# Job Tracker 2026

> Parce que « on garde votre CV sous le coude » mérite un suivi rigoureux.

PWA personnelle pour suivre mes candidatures : entreprise, poste, statut, dates, lien de l'offre, source, contact et notes.

**[Ouvrir l'application](https://chloealberge.github.io/job-tracker-2026/)**

## Fonctionnalités

- Ajouter, modifier et supprimer une candidature
- 7 statuts : à postuler, envoyée, relancée, entretien, offre reçue, refusée, abandonnée
- 12 sources : LinkedIn, Welcome to the Jungle, Indeed, APEC, France Travail, réseau…
- Date de relance facultative
- Installable sur téléphone et utilisable hors ligne
- Interface mobile first

## Stack

- **TypeScript** (mode strict), sans framework
- **Vite** pour le développement et la compilation
- **vite-plugin-pwa** pour le manifest et le service worker
- **GitHub Actions** + **GitHub Pages** pour le déploiement

## Sécurité

- Aucune donnée n'est envoyée sur un serveur : tout reste dans le `localStorage` du navigateur
- Validation de toutes les saisies et des données relues depuis le stockage
- Liens d'offre limités à `http://` et `https://`
- Affichage via `textContent`, jamais `innerHTML` (protection contre les injections XSS)
- Content Security Policy stricte en production

## Structure

```
src/
├── main.ts         # point d'entrée
├── types.ts        # modèle de données (statuts, sources, candidature)
├── validation.ts   # contrôle des saisies
├── storage.ts      # lecture / écriture dans le localStorage
├── ui.ts           # affichage de la liste et du formulaire
└── style.css       # thème coloré, mobile first
```

## Lancer en local

```bash
npm install
npm run dev
```

Puis ouvrir http://localhost:5173/job-tracker-2026/

## Déploiement

Chaque push sur `main` déclenche la compilation et la publication automatique sur GitHub Pages.

## Bon à savoir

Les candidatures sont stockées sur l'appareil où elles sont saisies, sans synchronisation entre le téléphone et l'ordinateur.

## Licence

MIT