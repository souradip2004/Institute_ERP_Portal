
# Flow Guide

This document provides a high-level overview of the flow of data and requests in our system architecture. It outlines how different components interact with each other, including the caching mechanism, database interactions, and queue management.

## Flow Overview

```

[User]
   │
   ├──> [Apollo GraphQL Server] --read--> [Redis Cache] --cache miss--> [Prisma ORM] --DB--> [PostgreSQL]
   │                                │
   │                                └─write-heavy/critical──┐
   │                                                       ↓
   ├──> [BullMQ Queue] --connected to--> [Redis (as Queue backend)]
                                    │
                                    ↓
                          [Worker Service] --> [Prisma] --> [PostgreSQL]

 ```

## Components

```

my-app/
├── prisma/
│   ├── schema.prisma
│   └── client.ts
│
├── src/
│   ├── apollo/
│   │   ├── resolvers/
│   │   │    └── *.resolver.ts
│   │   ├── typeDefs/
│   │   │    └── *.graphql
│   │   └── index.ts
│   │
│   ├── queues/
│   │   ├── exam.queue.ts
│   │   ├── video.queue.ts
│   │   └── user.queue.ts
│   │
│   ├── workers/
│   │   ├── exam.worker.ts
│   │   ├── video.worker.ts
│   │   └── user.worker.ts
│   │
│   ├── services/
│   │   └── *.service.ts
│   │
│   ├── redis/
│   │   └── redis.ts
│   │
│   ├── utils/
│   │   ├── jobStatus.ts
│   │   └── logger.ts
│   │
│   └── middlewares/
│       ├── auth.ts
│       └── permissions.ts
│
├── server.ts
├── worker.ts
└── queueMonitor.ts

```

## Flow Description

1. **User Request**: The user sends a request to the Apollo GraphQL server.
2. **Apollo GraphQL Server**: The server processes the request and checks if the data is available in the Redis cache.
3. **Redis Cache**: If the data is found in the cache, it is returned to the user. If not, the server queries the database using Prisma ORM.
4. **Prisma ORM**: Prisma interacts with the PostgreSQL database to fetch the required data.
5. **PostgreSQL**: The database returns the data to Prisma, which then sends it back to the Apollo GraphQL server.
6. **Redis Cache (write-heavy/critical)**: For write-heavy or critical operations, the server may also write data to the Redis cache for faster access in future requests.
7. **BullMQ Queue**: For tasks that require background processing, the server pushes jobs to a BullMQ queue.
8. **Worker Service**: The worker service listens to the queue and processes jobs as they come in. It uses Prisma to interact with the PostgreSQL database for any necessary data operations.
9. **PostgreSQL**: The worker service interacts with the PostgreSQL database to perform the required operations.
10. **Redis (as Queue backend)**: The BullMQ queue uses Redis as its backend for managing job states and queues.
11. **Job Status**: The job status can be monitored using the `jobStatus` utility, which provides information about the state of jobs in the queue.
12. **Logging**: The `logger` utility is used throughout the application to log important events and errors for debugging and monitoring purposes.
13. **Middlewares**: The application uses middlewares for authentication and permissions checks to ensure that only authorized users can access certain resources.
14. **Type Definitions and Resolvers**: The GraphQL schema is defined using type definitions and resolvers, which map the queries and mutations to the appropriate data sources.
15. **Schema**: The Prisma schema defines the data model and relationships, which are used by Prisma to generate the client for database interactions.
16. **Redis**: The Redis instance is used for caching and as a backend for the BullMQ queue.
17. **Server and Worker**: The main server file (`server.ts`) starts the Apollo GraphQL server, while the worker file (`worker.ts`) starts the worker service to process jobs from the queue.
18. **Queue Monitor**: The `queueMonitor.ts` file is responsible for monitoring the status of the queues and providing insights into their performance and job states.
19. **Environment Variables**: The application uses environment variables to configure the database connection, Redis instance, and other settings.
20. **Error Handling**: The application includes error handling mechanisms to catch and log errors that occur during the request processing, database interactions, and job processing.
21. **Testing**: The application includes unit tests and integration tests to ensure the correctness of the components and their interactions.
22. **Deployment**: The application can be deployed using Docker or other containerization tools, allowing for easy scaling and management of the services.
23. **Monitoring and Alerts**: The application can be integrated with monitoring tools to track performance metrics, error rates, and other important indicators. Alerts can be set up to notify the development team of any issues that arise in production.