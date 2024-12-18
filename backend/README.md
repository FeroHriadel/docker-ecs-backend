# DOCKER TEST - BACKEND
This is my Docker Test backend. 



### LOCAL DEVELOPMENT DB (for development only):
- this is inteded for local development only. In production backend will connect to AWS RDS instead.
- ensure nothing is running on your PC's localhost: 3306
- Start Docker Desktop:
- run this docker-compose file:

```
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: dev-mysql
    ports:
      - "3306:3306" # Exposes MySQL on localhost:3306
    environment:
      MYSQL_ROOT_PASSWORD: root_password # Set the root password
      MYSQL_DATABASE: dev_db             # Create a default database
      MYSQL_USER: dev_user               # Create a user
      MYSQL_PASSWORD: dev_password       # Set the user's password
    volumes:
      - mysql_data:/var/lib/mysql # Attach the named volume for persistent storage
    networks: # network is optional, chat gpt says this is for code organization purposes
      - dev-network

volumes:
  mysql_data: # you have to declare all named volumes here

networks:
  dev-network:
    driver: bridge



# run this by: $ docker-compose up -d (-d = run in detached mode)
# remove by: $ docker-compose down -v (-v = delete volumes too)
```

- set the `DB_HOST` in .env to: `DB_HOST = '127.0.0.1'` (the db will run on your PC's localhost:3306). Complete .env:

```
NODE_ENV = dev
PORT = 80
DB_HOST = '127.0.0.1'
DB_PORT = 3306
DB_USER = dev_user
DB_PASSWORD = dev_password
DB_DATABASE = dev_db
```

- run and remove like this:

```
# run this by: $ docker-compose up -d (-d = run in detached mode)
# remove by: $ docker-compose down -v (-v = delete volumes too)
```


### LOCAL DEVELOPMENT .env
- create .dotenv in the root:

```
NODE_ENV = dev
PORT = 80

DB_HOST = '127.0.0.1'
DB_PORT = 3306
DB_USER = dev_user
DB_PASSWORD = dev_password
DB_DATABASE = dev_db
```


### FOR FRONTEND DEVELOPMENT - NodeJS + Db in a single container on localhost:80
- Frontend dev can run backend with db in a single container on localhost:80 and use localhost:80/api as their dev api
- just go to `/backend` and run $ `docker-compose up -d`
- the nodejs container might crash at first (db won't be ready when it launches) so just restart it



### BUILD BACKEND CONTAINER:
- create `/Dockerfile`:

```
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

```
- $ `docker build -t docker-test-backend`
...