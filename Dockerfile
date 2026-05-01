FROM node:18

WORKDIR /app

COPY frontend/ .

RUN npm install

CMD ["npm", "run", "dev"]