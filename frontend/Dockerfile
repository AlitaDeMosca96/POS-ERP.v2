FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# En producción, usarías npm run build y npm run start. 
# Para desarrollo, dejamos el dev server:
CMD ["npm", "run", "dev", "--", "-p", "3001", "-H", "0.0.0.0"]