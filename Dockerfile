FROM node:14

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

ENV MONGO_URI mongodb://mongo:27017/nest
ENV RABBITMQ_URI amqp://guest:guest@rabbitmq:5672/

CMD ["npm", "run", "start:dev"]
