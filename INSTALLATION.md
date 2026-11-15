# Patch BatiPilot V5.1 fonctionnel
Pré-requis: V5 installée avec les API v4 et les fichiers lib/auth.ts, lib/db.ts, lib/password.ts.
1. Sauvegarder C:\BatiPilot-Full.
2. Décompresser ce ZIP à la racine de C:\BatiPilot-Full et accepter le remplacement de components/BatiPilotApp.tsx et lib/modules.ts.
3. Copier le contenu de STYLE_ADDON_V51.css à la fin de app/style.css.
4. Vérifier que app/page.tsx importe et affiche `@/components/BatiPilotApp`.
5. `Remove-Item -Recurse -Force .\.next -ErrorAction SilentlyContinue`
6. `npx.cmd prisma generate`
7. `npm.cmd run build`
8. `npm.cmd run dev`
9. Ouvrir http://localhost:3000/login.

Le rôle vient de /api/me et de la session; le sélecteur manuel de rôle a été supprimé. Les écrans principaux lisent les API et les formulaires écrivent dans Neon.
