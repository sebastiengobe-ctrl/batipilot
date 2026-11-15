# Correctif UI V5.5
Cause: le précédent patch V5.5 ajoutait ProjectWorkspace et GlobalTasksV55, mais si BatiPilotApp.tsx V5.4 n'avait pas été intégré correctement, les nouvelles fonctions restaient invisibles.

1. Sauvegarder components/BatiPilotApp.tsx actuel.
2. Copier les 3 fichiers de components/ dans C:\BatiPilot-Full\components et accepter le remplacement.
3. Vérifier que les API V5.5 et le schema Prisma V5.5 sont déjà installés.
4. Supprimer .next.
5. npx.cmd prisma generate
6. npm.cmd run build
7. npm.cmd run dev

Résultat attendu:
- Projets: chaque carte affiche Ouvrir → et ouvre ProjectWorkspace.
- ProjectWorkspace: Synthèse, Phases MOE, Gantt projet, Tâches projet, Équipe, Lots, Documents, Chantier, Finance.
- Tâches globales: filtres Projet / Collaborateur / Statut + Kanban + Charge équipe.
