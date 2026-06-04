FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG MYSQL_URL=mysql://dummy:dummy@localhost:3306/dummy
ENV MYSQL_URL=${MYSQL_URL}

RUN npx prisma generate

CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]