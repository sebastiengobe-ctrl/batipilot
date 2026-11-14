# BatiPilot Full Source v1
Socle complet couvrant visuellement le cahier des charges : projets, phases, lots, Gantt, tâches, charge, clients, entreprises, suivi chantier, documents, signatures, consultations, budget, honoraires, réception, réserves, portail client et administration.

## Démarrage
1. `copy .env.example .env` puis renseigner PostgreSQL/Neon.
2. `npm install`
3. `npm run db:push`
4. `npm run dev`

## Important
Le package fournit tout le code du socle métier, le modèle PostgreSQL complet et les écrans navigables. Les connecteurs externes nécessitant des comptes et secrets tiers restent à raccorder : Yousign/Universign/DocuSign, Azure Blob, e-mail transactionnel et MFA.
