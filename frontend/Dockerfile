FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY frontend ./frontend

RUN npm run build --prefix ./frontend

EXPOSE 3000

CMD ["npm", "run", "start", "--prefix", "./frontend"]
