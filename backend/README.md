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


### (OPTIONAL, FYI ONLY: LOCAL DEVELOPMENT - NodeJS + Db in a single container)
- I repeat: `This is not necessary at all - it's just in case you are curious:`
- If you want to test how the NodeJS app behaves in the container you may put db and nodejs into one container and:
- set .env to:

```
NODE_ENV=dev
PORT=80

DB_HOST='docker-test-db'
DB_PORT=3306
DB_USER=dev_user
DB_PASSWORD=dev_password
DB_DATABASE=dev_db

AWS_ACCESS_KEY_ID=AKIA356fjdlknmkld
AWS_SECRET_ACCESS_KEY=Q9ZYMXdVjie/EFESkdmfvklsd
AWS_REGION=us-east-1
```

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

- create `/docker-compose.yaml`:

```
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: docker-test-db
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: dev_db
      MYSQL_USER: dev_user
      MYSQL_PASSWORD: dev_password
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - docker-test-network
    ports:
      - "3306:3306"

  backend:
    build: .
    container_name: docker-test-backend
    env_file:
      - .env
    depends_on:
      - mysql  # Use the service name, not the container name
    networks:
      - docker-test-network
    ports:
      - "80:80"

volumes:
  mysql_data:
    driver: local

networks:
  docker-test-network:
    driver: bridge



# docker-compose up -d
```

- ensure nothing is running on your PC's localhost: 3306
- $ `docker-compose up -d`
- it will create a mysqldb and a nodejs app inside one container
- the nodejs app will crash at first because the db won't be ready when the nodejs starts - just restart it $ `docker start ...`



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