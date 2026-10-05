# Ten Ten maison

Talkie-walkie entre amis : même code de groupe = on s'entend. Node 18+ seul, aucune dépendance.

## Lancer sur ton ordi
    node server.js
Puis ouvre http://localhost:3000 (le micro marche sur localhost ; sur un téléphone il faut du **https**).

## Mettre en ligne gratuitement
**Option A, Render (toujours en ligne, gratuit)**
1. Mets ce dossier dans un dépôt GitHub.
2. Sur render.com : New > Web Service > choisis le dépôt. Build : (vide). Start : `node server.js`. Plan : Free.
3. Partage l'adresse `https://xxx.onrender.com` à tes amis.
Limite : le plan gratuit s'endort après 15 min sans visite, le premier qui ouvre l'appli attend ~30 s.

**Option B, depuis ton PC (rien à créer)**
    node server.js
    npx cloudflared tunnel --url http://localhost:3000
Donne l'adresse `https://….trycloudflare.com` affichée. Marche tant que ton PC est allumé ; l'adresse change à chaque lancement.

## Sur le téléphone
Ouvre l'adresse, puis « Ajouter à l'écran d'accueil » (Safari : bouton Partager ; Chrome : menu ⋮). Entre ton pseudo et le code du groupe, autorise le micro.

## Limites
- Il faut que l'appli soit ouverte à l'écran pour entendre (sur iPhone surtout : un site web ne peut pas jouer de son appli fermée, Ten Ten le fait parce que c'est une vraie appli).
- Les messages ne sont pas enregistrés : si tu n'es pas connecté, tu ne les entends pas.
- Le code du groupe sert de mot de passe : choisis-en un pas devinable.
