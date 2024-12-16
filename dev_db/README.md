# DOCKER TEST - LOCAL DEVELOPMENT DB
- this is inteded for nodejs api local development only.
- Run this if you want your localhost:80 nodejs app to have a db to connect to.
- If you need a backend container on your machine for FE development run the `/backend/docker-compose.yaml` which creates both api (port:80) and db
- In production backend will connect to AWS RDS instead.
- run and remove like this:

```
# run this by: $ docker-compose up -d (-d = run in detached mode)
# remove by: $ docker-compose down -v (-v = delete volumes too)
```