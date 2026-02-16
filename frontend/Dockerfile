FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build --prefix ./frontend

EXPOSE 3000

CMD ["npm", "run", "start", "--prefix", "./frontend", "--hostname", "0.0.0.0", "--port", "3000"]
