# BatiPilot V5.4 - Espace Projet MOE
V5.4 se pose directement sur V5.1/V5.3; V5.2 (login premium) n'est PAS requise.
Fonctions: ouverture projet, onglets projet, phases MOE, initialisation ESQ/DIAG/APS/APD/PC/PRO/DCE/ACT/VISA/DET/OPC/AOR, Gantt par projet, tâches par projet, affectation aux collaborateurs, conservation de la vue tâches globale.

1. Sauvegarder C:\BatiPilot-Full.
2. Décompresser ce ZIP à la racine.
3. Copier STYLE_V54.css à la fin de app\style.css.
4. Appliquer les 5 petites modifications décrites dans PATCH_BatiPilotApp_V54.txt à components\BatiPilotApp.tsx V5.3.
5. Vérifier que le schéma Prisma V5 contient bien Project.phases -> Phase[], Project.tasks -> WorkTask[], Project.planning -> PlanningTask[], User.assignedTasks -> WorkTask[]. Aucun changement de schéma n'est normalement nécessaire.
6. Remove-Item -Recurse -Force .\.next -ErrorAction SilentlyContinue
7. npx.cmd prisma generate
8. npm.cmd run build
9. npm.cmd run dev
