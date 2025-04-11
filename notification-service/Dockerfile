FROM node:alpine:latest

WORKDIR /notificaton/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 8083

CMD ["npm", "start"]
