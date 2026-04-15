# On part d'une image Nginx très légère
FROM nginx:alpine

# On supprime le contenu par défaut de Nginx
RUN rm -rf /usr/share/nginx/html/*

# On copie tes fichiers compilés vers le dossier que Nginx sert par défaut
COPY ./dist /usr/share/nginx/html

# On expose le port 80
EXPOSE 80