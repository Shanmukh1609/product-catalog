# Product-Catalog API
This project is a comprehensive product catalog API designed to demonstrate core concepts of backend development, including caching strategies, rate limiting, and containerization with Docker. It provides a full-stack, database-driven application environment managed entirely by Docker Compose.

## **Features**
- **Full CRUD API**: Create, Read, Update, and Delete products.
- **Caching Layer**: High-performance caching with Redis to reduce database load.
- **Rate Limiting**: Middleware to protect create, update, and delete endpoints from abuse.
- **Database Integration**: Persistent data storage using a PostgreSQL database.
- **Containerized Environment**: The entire stack (Node.js, Postgres, Redis, pgAdmin) is managed with Docker and Docker Compose for easy setup and consistent environments.
- **Persistent Data**: Utilizes Docker volumes to ensure database and pgAdmin data is saved across container restarts.

## Technical Deep Dive
This project serves as a practical guide to several important backend patterns.

**Caching with Redis (Cache-Aside Pattern)**
To improve performance and reduce database hits, the application implements a Cache-Aside strategy for fetching products.

Check Cache First: When a request for a product is received (GET /products/:id), the application first checks if the product data exists in the Redis cache using a key (e.g., product:101).

Cache Hit: If the data is found in Redis, it is immediately returned to the client. This is extremely fast and avoids any interaction with the database.

Cache Miss: If the data is not in Redis, the application queries the PostgreSQL database to fetch the product.

Populate Cache: The retrieved data is then saved to the Redis cache with an expiration time (e.g., 1 hour). This ensures that subsequent requests for the same product will be a "Cache Hit".

Rate Limiting
To protect sensitive endpoints (POST, PUT, DELETE), a rate-limiting middleware is used.

IP-Based Tracking: It uses the client's IP address as a unique identifier.

Redis INCR: For each request, it uses the atomic INCR command in Redis on a key like rate-limit:127.0.0.1.

Sliding Window: On the first request within a time window (e.g., 60 seconds), it sets an EXPIRE on the key. This creates a sliding window for rate limiting.

Blocking: If the request count for an IP exceeds the defined limit (e.g., 10 requests), the server responds with a 429 Too Many Requests error and blocks the request.

Cache Invalidation
Keeping the cache and the database in sync is critical. This project uses a common invalidation strategy:

On Update (PUT): When a product's details are updated, the application sends the UPDATE command to PostgreSQL. Upon a successful update, it immediately sends a DEL command to Redis to delete the old, stale cache entry for that product (e.g., DEL product:101).

On Delete (DELETE): Similarly, when a product is deleted from PostgreSQL, its corresponding entry is also deleted from the Redis cache.

This strategy ensures that the next time the updated or deleted product is requested, it will result in a "Cache Miss," forcing the application to fetch the fresh data from the database and repopulate the cache.


How to Run This Project
This entire application is managed by Docker Compose.

## Prerequisites
Docker installed on your machine.

Setup Instructions
Clone the repository:
``` (shell)
git clone <your-repository-url>
cd <your-project-folder>
```
Create an environment file:
Create a .env file in the root of the project and populate it with the necessary credentials. An example is provided below:

## Node.js App
``` PORT=3000 ```

## Redis Connection
``` REDIS_URL=redis://redis:6379 ```

# PostgreSQL Credentials
```
POSTGRES_USER=myuser
POSTGRES_PASSWORD=mypassword
POSTGRES_DB=mydb
```
```
# Database Connection for Node App
DB_HOST=postgres
DB_USER=myuser
DB_PASSWORD=mypassword
DB_NAME=mydb
DB_PORT=5432
```

Build and run the containers:
Run the following command from the project root. The --build flag is important for the first run or after any code changes.
``` (shell)
docker-compose up --build
```
To run in the background (detached mode):
``` (shell)
docker-compose up -d --build
```
Accessing the services:
```
API: http://localhost:3000
```

Stopping the application:
```
docker-compose down
```
## API END POINTS

| Method  | Endpoint         | Description                                 |
|---------|------------------|---------------------------------------------|
| GET     | /products/:id    | Get a single product by its ID. (Cached)    |
| POST    | /products/       | Create a new product. (Rate Limited)        |
| PUT     | /products/:id    | Update an existing product. (Rate Limited)  |
| DELETE  | /products/:id    | Delete a product. (Rate Limited)            |
