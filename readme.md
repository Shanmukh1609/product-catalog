Node.js Caching & Rate Limiting with Redis, Postgres & Docker
This project is a complete, containerized Node.js application that serves as a practical guide to implementing advanced backend concepts. It demonstrates a full Create, Read, Update, Delete (CRUD) API for a product catalog, protected by an IP-based rate limiter and optimized with a Redis caching layer.

The entire stack, including the Node.js application, a PostgreSQL database, a Redis server, and a pgAdmin interface, is orchestrated with Docker Compose for easy setup and development.

Features
CRUD API: Full API for managing products (Create, Read, Update, Delete).

Redis Caching: A "Cache-Aside" strategy to reduce database load and improve response times for frequent requests.

IP-Based Rate Limiting: Middleware to protect POST, PUT, and DELETE endpoints from abuse, limiting requests per IP address within a time window.

Fully Containerized: The entire application stack is defined in a docker-compose.yml file for one-command setup.

Persistent Data: Uses Docker Volumes to ensure that your PostgreSQL and pgAdmin data is saved even when the containers are stopped or removed.

Core Concepts Demonstrated
This project is designed to be a learning resource. Here’s a breakdown of the key techniques used:

How Redis is Used for Caching
We implement the Cache-Aside pattern to dramatically speed up data retrieval (GET requests).

Check the Cache First: When a request for a product (e.g., /products/101) arrives, the application first checks if an entry for product:101 exists in Redis.

Cache Hit: If the data is found in Redis, it is immediately returned to the user. This is extremely fast and avoids any interaction with the database.

Cache Miss: If the data is not in Redis, the application queries the main PostgreSQL database to get the product information.

Populate the Cache: Before sending the data to the user, it is saved in Redis with an expiration time (e.g., 1 hour). This ensures that the next request for this same product will be a fast "Cache Hit".

How Cache Invalidation is Handled
Keeping the cache and the database in sync is critical. We invalidate the cache to prevent serving stale or incorrect data.

On Update/Delete: When a request is made to change data (e.g., UPDATE or DELETE a product), the operation is first performed on the primary data source, our PostgreSQL database.

Delete from Cache: Immediately after the database is successfully updated, the application sends a DEL command to Redis to delete the old, stale entry from the cache (e.g., DEL product:101).

Forced Cache Miss: This guarantees that the next GET request for this product will be a "Cache Miss," forcing the application to fetch the fresh, updated data from the database and repopulate the cache with the correct information.

How Rate Limiting is Implemented
To protect our API from spam or denial-of-service attacks, we use an IP-based rate-limiting middleware for sensitive endpoints.

Unique Key: We use the client's IP address to create a unique key in Redis (e.g., rate-limit:192.168.1.10).

Increment on Request: With every request, we use the atomic INCR command in Redis to increment the count for that key.

Set Time Window: The very first time a user makes a request, we also set an EXPIRE command on their key (e.g., 60 seconds). This creates the time window.

Check Limit: If the count for an IP address exceeds our defined limit (e.g., 10 requests) within that window, the request is blocked with a 429 Too Many Requests error.

Docker Integration & Data Persistence
The entire project runs in a set of isolated containers managed by Docker Compose.

Dockerfile: Defines the steps to build a production-ready, multi-stage image for our Node.js application.

docker-compose.yml: Orchestrates the entire stack. It defines four services (app, redis, postgres, pgadmin) and connects them all on a private Docker network. This allows the containers to communicate using their service names (e.g., the app connects to the database using the hostname postgres).

Docker Volumes: To ensure our database data is not lost when containers are stopped, we use a named volume (postgres_data). This volume maps the data directory inside the PostgreSQL container to a managed location on the host machine, effectively making our data persistent.

Tech Stack
Backend: Node.js, Express.js

Database: PostgreSQL

Caching / Rate Limiting: Redis

Containerization: Docker, Docker Compose

Database Management: pgAdmin 4

Getting Started
Follow these instructions to get the project up and running on your local machine.

Prerequisites
Node.js (v18 or higher)

Docker and Docker Compose

How to Run the Project
Clone the repository:

git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
cd your-repo-name

Create the environment file:
Create a .env file in the root of the project by copying the example file.

cp .env.example .env

This file contains all the necessary environment variables, including the passwords and database names.

Build and run the containers:
This single command will build your Node.js image and start all the services in the background.

docker-compose up --build -d

Access the application:

API: Your application will be running at http://localhost:3000.

pgAdmin: The database management interface will be available at http://localhost:8080. (Login with the credentials in the docker-compose.yml file).

To stop the application:

docker-compose down

API Endpoints
Method

Endpoint

Description

Request Body (Example)

GET

/products/:id

Get a single product by its ID.

N/A

POST

/products

Create a new product.

{"id": "103", "name": "4K Monitor", "price": 350, "stock": 50}

PUT

/products/updateProduct/:id

Update an existing product.

{"price": 375.50, "stock": 45}

DELETE

/products/deleteProduct/:id

Delete a product by its ID.

N/A

