FROM node:14
WORKDIR /usr/app
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build
COPY .env build/.env
CMD ["node", "build/server.js"]
