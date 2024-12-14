FROM node:20-alpine

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

RUN npm run build

EXPOSE 80

CMD ["npm", "run", "start"]

# docker build -t docker-test-backend .
# docker run --env-file .env -p 80:80 docker-test-backend