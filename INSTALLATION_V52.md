# BatiPilot V5.2 - Login Premium
Pré-requis: V5.1 fonctionnelle.
1. Sauvegarder C:\BatiPilot-Full.
2. Décompresser ce ZIP à la racine de C:\BatiPilot-Full.
3. Remplacer app\login\page.tsx.
4. Copier le contenu de STYLE_V52.css à la fin de app\style.css.
5. Vérifier que public\logo.png existe.
6. Remove-Item -Recurse -Force .\.next -ErrorAction SilentlyContinue
7. npm.cmd run build
8. npm.cmd run dev
9. Ouvrir http://localhost:3000/login

Aucune modification Prisma/Neon. L'API /api/auth/login existante reste utilisée.
