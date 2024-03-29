FROM node:16.15

WORKDIR /app
COPY package.json .
RUN npm install
COPY . .

CMD npm run start:dev