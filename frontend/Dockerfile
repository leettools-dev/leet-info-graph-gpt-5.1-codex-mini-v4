<<<<<<< HEAD
FROM node:20-slim
=======
FROM node:20-alpine
>>>>>>> dev#feature#research-infographic-studio

WORKDIR /app

COPY package*.json ./
RUN npm install

<<<<<<< HEAD
COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "3000"]
=======
COPY frontend ./frontend

RUN npm run build --prefix ./frontend

EXPOSE 3000

CMD ["npm", "run", "start", "--prefix", "./frontend"]
>>>>>>> dev#feature#research-infographic-studio
