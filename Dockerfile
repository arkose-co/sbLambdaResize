# Utilise une image Amazon Linux comme base
FROM amazonlinux:2

# Installe Node.js et npm
RUN curl -sL https://rpm.nodesource.com/setup_16.x | bash - \
    && yum install -y nodejs \
    && yum install -y gcc-c++ make

# Crée un répertoire de travail
WORKDIR /app

# Copie package.json et package-lock.json dans le conteneur
COPY package*.json ./

# Installe les dépendances
RUN npm install

# Copie le reste de l'application dans le conteneur
COPY . .

# Commande par défaut
CMD ["node", "index.js"]
