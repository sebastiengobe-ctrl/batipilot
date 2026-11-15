# BatiPilot V5.5 complet
Pré-requis: V5.4 fonctionnelle.
## Modèle
V5.5 ajoute Phase.tasks, Phase.planning, WorkTask.phaseId, WorkTask.startAt/actualHours, PlanningTask.phaseId. Ces ajouts sont nécessaires à la relation phase-tâche-Gantt.
## Installation sûre
1. Sauvegarder C:\BatiPilot-Full et créer une branche Neon de test.
2. Remplacer prisma/schema.prisma par celui du patch.
3. Décompresser les API et composants.
4. Ajouter STYLE_V55.css à app/style.css.
5. Ajouter GlobalTasksV55 dans la vue globale Tâches de BatiPilotApp si vous souhaitez les filtres + charge; la vue projet fonctionne directement via ProjectWorkspace.
6. npx.cmd prisma format
7. npx.cmd prisma validate
8. npx.cmd prisma generate
9. npx.cmd prisma db push sur la branche Neon de test. Ces nouveaux champs sont nullable, donc aucune donnée existante ne doit être supprimée. Si Prisma annonce une perte de données, arrêter.
10. npm.cmd run build puis npm.cmd run dev.
## Phases MOE
ESQ, DIAG, APS, APD, AUT, PRO, DCE, ACT, VISA, DET, OPC, AOR. Le bouton d'initialisation crée ce modèle, puis les phases restent éditables par projet.
