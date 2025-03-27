# Table of Contents

1. [List of Backend Routes](#list-of-backend-routes)
2. [Tech Stack](#tech-stack)
5. [Implementation Details](#implementation-details)
6. [Directory Structure](#directory-structure)
7. [Development Workflow](#development-workflow)
8. [Next Steps](#next-steps)


## List of Backend Routes

#### Authentication & User Management
| **Method** | **Endpoint**                  | **Purpose**                                                                 |
|------------|-------------------------------|-----------------------------------------------------------------------------|
| POST       | `/api/auth/register`          | Register a new user (admin, teacher, department head, or student).           |
| POST       | `/api/auth/login`             | Authenticate a user and return a JWT token.                                 |
| POST       | `/api/auth/logout`            | Invalidate the user's session (optional, depending on token strategy).      |
| POST       | `/api/auth/refresh-token`     | Refresh an expired JWT token.                                               |
| POST       | `/api/auth/forgot-password`   | Send a password reset email with a reset token.                             |
| POST       | `/api/auth/reset-password`    | Reset the user’s password using the reset token.                            |
| GET        | `/api/users/me`               | Get the authenticated user’s profile details.                               |
| PUT        | `/api/users/me`               | Update the authenticated user’s profile (e.g., name, email, etc.).          |
| POST       | `/api/auth/2fa/enable`        | Enable two-factor authentication (2FA) for the user.                        |
| POST       | `/api/auth/2fa/verify`        | Verify 2FA code during login or setup.                                      |
| GET        | `/api/users/:id`              | Get a specific user’s details (admin-only or role-based access).            |
| PUT        | `/api/users/:id`              | Update a specific user’s details (admin-only).                              |
| DELETE     | `/api/users/:id`              | Delete a user (admin-only).                                                 |

#### Institution Management
| **Method** | **Endpoint**                  | **Purpose**                                                                 |
|------------|-------------------------------|-----------------------------------------------------------------------------|
| POST       | `/api/institutions`           | Create a new institution (super admin only).                                |
| GET        | `/api/institutions`           | Get a list of all institutions (super admin only).                          |
| GET        | `/api/institutions/:id`       | Get details of a specific institution.                                      |
| PUT        | `/api/institutions/:id`       | Update an institution’s details (super admin or institution admin).         |
| DELETE     | `/api/institutions/:id`       | Delete an institution (super admin only).                                   |

#### Department Management
| **Method** | **Endpoint**                  | **Purpose**                                                                 |
|------------|-------------------------------|-----------------------------------------------------------------------------|
| POST       | `/api/departments`            | Create a new department within an institution (admin or dept head).         |
| GET        | `/api/departments`            | Get a list of departments (filtered by institution).                        |
| GET        | `/api/departments/:id`        | Get details of a specific department.                                       |
| PUT        | `/api/departments/:id`        | Update a department’s details (admin or dept head).                         |
| DELETE     | `/api/departments/:id`        | Delete a department (admin only).                                           |

#### Course & Academic Structure
| **Method** | **Endpoint**                  | **Purpose**                                                                 |
|------------|-------------------------------|-----------------------------------------------------------------------------|
| POST       | `/api/courses`                | Create a new course (teacher or dept head).                                 |
| GET        | `/api/courses`                | Get a list of courses (filtered by department or institution).              |
| GET        | `/api/courses/:id`            | Get details of a specific course.                                           |
| PUT        | `/api/courses/:id`            | Update a course’s details.                                                  |
| DELETE     | `/api/courses/:id`            | Delete a course.                                                            |
| POST       | `/api/batches`                | Create a new batch (admin or dept head).                                    |
| GET        | `/api/batches`                | Get a list of batches (filtered by department).                             |
| GET        | `/api/batches/:id`            | Get details of a specific batch.                                            |
| PUT        | `/api/batches/:id`            | Update a batch’s details.                                                   |
| DELETE     | `/api/batches/:id`            | Delete a batch.                                                             |
| POST       | `/api/semesters`              | Create a new semester (admin).                                              |
| GET        | `/api/semesters`              | Get a list of semesters (filtered by institution).                          |
| GET        | `/api/semesters/:id`          | Get details of a specific semester.                                         |
| PUT        | `/api/semesters/:id`          | Update a semester’s details.                                                |
| DELETE     | `/api/semesters/:id`          | Delete a semester.                                                          |
| POST       | `/api/class-sections`         | Create a new class section (teacher or dept head).                          |
| GET        | `/api/class-sections`         | Get a list of class sections (filtered by batch or course).                 |
| GET        | `/api/class-sections/:id`     | Get details of a specific class section.                                    |
| PUT        | `/api/class-sections/:id`     | Update a class section’s details.                                           |
| DELETE     | `/api/class-sections/:id`     | Delete a class section.                                                     |

#### Attendance Management
| **Method** | **Endpoint**                  | **Purpose**                                                                 |
|------------|-------------------------------|-----------------------------------------------------------------------------|
| POST       | `/api/attendance-sessions`    | Create a new attendance session (teacher).                                  |
| GET        | `/api/attendance-sessions`    | Get a list of attendance sessions (filtered by class section or teacher).   |
| GET        | `/api/attendance-sessions/:id`| Get details of a specific attendance session.                               |
| PUT        | `/api/attendance-sessions/:id`| Update an attendance session (e.g., status).                                |
| POST       | `/api/attendance`             | Record attendance for a session (teacher).                                  |
| GET        | `/api/attendance`             | Get attendance records (filtered by session, student, or class).            |
| PUT        | `/api/attendance/:id`         | Update an attendance record (teacher or dept head).                         |
| GET        | `/api/attendance-settings`    | Get attendance settings for an institution (admin).                         |
| PUT        | `/api/attendance-settings`    | Update attendance settings (admin).                                         |

#### Examination & Assessment
| **Method** | **Endpoint**                  | **Purpose**                                                                 |
|------------|-------------------------------|-----------------------------------------------------------------------------|
| POST       | `/api/exam-types`             | Create a new exam type (admin).                                             |
| GET        | `/api/exam-types`             | Get a list of exam types (filtered by institution).                         |
| PUT        | `/api/exam-types/:id`         | Update an exam type.                                                        |
| DELETE     | `/api/exam-types/:id`         | Delete an exam type.                                                        |
| POST       | `/api/exams`                  | Create a new exam (teacher).                                                |
| GET        | `/api/exams`                  | Get a list of exams (filtered by class section or teacher).                 |
| GET        | `/api/exams/:id`              | Get details of a specific exam.                                             |
| PUT        | `/api/exams/:id`              | Update an exam (e.g., publish it).                                          |
| DELETE     | `/api/exams/:id`              | Delete an exam.                                                             |
| POST       | `/api/questions`              | Add a question to an exam (teacher or AI-generated).                        |
| GET        | `/api/questions`              | Get questions for an exam.                                                  |
| PUT        | `/api/questions/:id`          | Update a question.                                                          |
| DELETE     | `/api/questions/:id`          | Delete a question.                                                          |
| POST       | `/api/exam-submissions`       | Submit an exam by a student.                                                |
| GET        | `/api/exam-submissions`       | Get exam submissions (filtered by exam or student).                         |
| GET        | `/api/exam-submissions/:id`   | Get details of a specific submission.                                       |
| POST       | `/api/answer-scripts`         | Grade an answer script (teacher or AI).                                     |
| GET        | `/api/answer-scripts`         | Get answer scripts (filtered by exam submission).                           |
| PUT        | `/api/answer-scripts/:id`     | Update an answer script (e.g., remarks or marks).                           |

#### AI Content Generation
| **Method** | **Endpoint**                  | **Purpose**                                                                 |
|------------|-------------------------------|-----------------------------------------------------------------------------|
| POST       | `/api/ai/videos`              | Generate an AI teaching video from notes (teacher).                         |
| GET        | `/api/ai/videos`              | Get a list of AI-generated videos (filtered by course or teacher).          |
| GET        | `/api/ai/videos/:id`          | Get details of a specific video (including status).                         |
| DELETE     | `/api/ai/videos/:id`          | Delete a video.                                                             |
| GET        | `/api/ai/video-logs`          | Get video view logs (filtered by video or student).                         |
| POST       | `/api/ai/questions`           | Generate AI question papers (teacher).                                      |
| GET        | `/api/ai/questions`           | Get AI-generated questions from the question bank.                          |
| DELETE     | `/api/ai/questions/:id`       | Delete an AI-generated question bank entry.                                 |

#### Subscription & Billing
| **Method** | **Endpoint**                  | **Purpose**                                                                 |
|------------|-------------------------------|-----------------------------------------------------------------------------|
| POST       | `/api/subscription-plans`     | Create a new subscription plan (super admin).                               |
| GET        | `/api/subscription-plans`     | Get a list of subscription plans.                                           |
| PUT        | `/api/subscription-plans/:id` | Update a subscription plan.                                                 |
| DELETE     | `/api/subscription-plans/:id` | Delete a subscription plan.                                                 |
| POST       | `/api/subscriptions`          | Subscribe an institution to a plan (admin).                                 |
| GET        | `/api/subscriptions`          | Get subscription details for an institution.                                |
| PUT        | `/api/subscriptions/:id`      | Update a subscription (e.g., renew or cancel).                              |
| GET        | `/api/credits`                | Get credit balance for an institution.                                      |
| POST       | `/api/credits`                | Add credits to an institution (admin or payment).                           |
| GET        | `/api/credit-transactions`    | Get credit transaction history.                                             |
| POST       | `/api/invoices`               | Generate an invoice for a subscription (admin).                             |
| GET        | `/api/invoices`               | Get a list of invoices for an institution.                                  |
| PUT        | `/api/invoices/:id`           | Update invoice status (e.g., mark as paid).                                 |

#### Performance Analytics
| **Method** | **Endpoint**                  | **Purpose**                                                                 |
|------------|-------------------------------|-----------------------------------------------------------------------------|
| GET        | `/api/teacher-metrics`        | Get teacher performance metrics (dept head or admin).                       |
| POST       | `/api/teacher-metrics`        | Add or update a teacher’s performance metric (dept head).                   |
| GET        | `/api/student-metrics`        | Get student performance metrics (teacher or dept head).                     |
| POST       | `/api/student-metrics`        | Add or update a student’s performance metric (teacher).                     |

#### Notifications & Announcements
| **Method** | **Endpoint**                  | **Purpose**                                                                 |
|------------|-------------------------------|-----------------------------------------------------------------------------|
| POST       | `/api/notifications`          | Send a notification to a user (system-generated or manual).                 |
| GET        | `/api/notifications`          | Get a user’s notifications (authenticated user).                            |
| PUT        | `/api/notifications/:id`      | Mark a notification as read.                                                |
| POST       | `/api/announcements`          | Create an announcement (admin, dept head, or teacher).                      |
| GET        | `/api/announcements`          | Get announcements (filtered by institution, dept, or class).                |
| PUT        | `/api/announcements/:id`      | Update an announcement.                                                     |
| DELETE     | `/api/announcements/:id`      | Delete an announcement.                                                     |

#### Audit & Security
| **Method** | **Endpoint**                  | **Purpose**                                                                 |
|------------|-------------------------------|-----------------------------------------------------------------------------|
| GET        | `/api/audit-logs`             | Get audit logs (admin only, with filters).                                  |
| GET        | `/api/login-attempts`         | Get login attempt history (admin only).                                     |
| POST       | `/api/api-keys`               | Generate a new API key for an institution (admin).                          |
| GET        | `/api/api-keys`               | Get a list of API keys for an institution.                                  |
| DELETE     | `/api/api-keys/:id`           | Revoke an API key.                                                          |

#### System Settings
| **Method** | **Endpoint**                  | **Purpose**                                                                 |
|------------|-------------------------------|-----------------------------------------------------------------------------|
| GET        | `/api/system-settings`        | Get system settings for an institution (admin).                             |
| PUT        | `/api/system-settings`        | Update system settings (admin).                                             |

---

## Tech Stack
- **Frontend**: Next.js (SSR/SSG), React, TailwindCSS
- **Backend**: Next.js API Routes, Node.js, TypeScript
- **Database**: PostgreSQL (via NeonDB), Prisma ORM
- **Caching**: Redis (session management, queues, real-time updates)
- **AI/ML**: Pre-trained NLP models, AI video generation (external APIs or custom integration)
- **Cloud**: AWS/Google Cloud (hosting, storage, compute)


## Implementation Details

### Features to Implement
1. **Authentication & Authorization**
   - JWT-based authentication with refresh tokens.
   - Role-based access control (RBAC) for ADMIN, TEACHER, DEPARTMENT_HEAD, STUDENT roles.
   - Two-factor authentication (2FA) using TOTP (e.g., `speakeasy` library).
   - Password reset via email (e.g., Nodemailer).

2. **User Management**
   - CRUD operations for users with role-specific permissions.
   - Profile management for authenticated users.

3. **Institution & Department Management**
   - CRUD operations for institutions and departments.
   - Link users to institutions and departments.

4. **Academic Structure**
   - Manage courses, batches, semesters, and class sections.
   - Enroll students in class sections.

5. **Attendance Management**
   - Record and track attendance sessions with real-time updates (WebSockets or Redis Pub/Sub).
   - Generate attendance reports with insights (e.g., percentage trends).

6. **Examination & Assessment**
   - Create and manage exams, questions, and submissions.
   - AI-assisted grading with manual override option.
   - Generate PDF results for students.

7. **AI Content Generation**
   - Generate teaching videos from notes (integrate with AI video generation API).
   - Generate question papers using NLP models (e.g., Hugging Face transformers).
   - Track AI content status and credit usage.

8. **Subscription & Billing**
   - Manage subscription plans and institution subscriptions.
   - Track credits for AI features (video, question generation, paper checking).
   - Generate and manage invoices.

9. **Performance Analytics**
   - Calculate and store teacher and student performance metrics.
   - Provide detailed reports for department heads and admins.

10. **Notifications & Announcements**
    - Send real-time notifications to users (e.g., via WebSockets or email).
    - Manage institution-wide or class-specific announcements.

11. **Audit & Security**
    - Log all critical actions (e.g., CRUD operations) in audit logs.
    - Track login attempts for security monitoring.
    - Generate and manage API keys for external integrations.

12. **System Settings**
    - Store and manage institution-specific settings (e.g., attendance rules, exam policies).

### Key Considerations
- **Security**: Use HTTPS, encrypt sensitive data, implement rate limiting (Redis), and sanitize inputs.
- **Scalability**: Offload AI tasks to background jobs (Redis queues + BullMQ) and use cloud storage (S3).
- **Error Handling**: Implement global error middleware and consistent error responses.
- **Testing**: Write unit and integration tests (Jest + Supertest).
- **Documentation**: Use Swagger/OpenAPI for API documentation.


## Directory Structure


```
education-management-platform/
├── prisma/                    # Prisma schema and migrations
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Migration files
├── src/                       # Source code
│   ├── api/                   # API routes (Next.js API Routes)
│   │   ├── auth/              # Authentication routes
│   │   ├── institutions/      # Institution-related routes
│   │   ├── departments/       # Department-related routes
│   │   ├── courses/           # Course-related routes
│   │   ├── attendance/        # Attendance-related routes
│   │   ├── exams/             # Exam-related routes
│   │   ├── ai/                # AI content generation routes
│   │   ├── subscriptions/     # Subscription and billing routes
│   │   ├── analytics/         # Performance analytics routes
│   │   ├── notifications/     # Notifications and announcements routes
│   │   └── settings/          # System settings routes
│   ├── controllers/           # Business logic for each route
│   │   ├── authController.ts  # Auth-related logic
│   │   ├── institutionController.ts
│   │   └── ...                # One per feature module
│   ├── services/              # Reusable service layer (e.g., database, AI, email)
│   │   ├── prismaService.ts   # Prisma database operations
│   │   ├── aiService.ts       # AI integration (video, question generation)
│   │   ├── emailService.ts    # Email sending logic
│   │   └── redisService.ts    # Redis operations
│   ├── models/                # TypeScript types and interfaces
│   │   ├── user.ts            # User-related types
│   │   ├── institution.ts     # Institution-related types
│   │   └── ...                # One per entity
│   ├── middleware/            # Custom middleware
│   │   ├── authMiddleware.ts  # JWT and RBAC checks
│   │   ├── errorMiddleware.ts # Global error handling
│   │   └── rateLimitMiddleware.ts # Rate limiting
│   ├── utils/                 # Utility functions
│   │   ├── logger.ts          # Logging (e.g., Winston)
│   │   ├── validator.ts       # Input validation (e.g., Zod)
│   │   └── helpers.ts         # General helper functions
│   ├── jobs/                  # Background job definitions (e.g., BullMQ)
│   │   ├── videoGenerationJob.ts
│   │   └── questionGenerationJob.ts
│   ├── config/                # Configuration files
│   │   ├── database.ts        # Database connection config
│   │   ├── redis.ts           # Redis config
│   │   └── env.ts             # Environment variable parsing (e.g., Zod)
│   └── tests/                 # Test files
│       ├── unit/              # Unit tests
│       └── integration/       # Integration tests
├── public/                    # Static assets (optional for frontend)
├── .env                       # Environment variables
├── .env.example               # Example env file
├── tsconfig.json              # TypeScript configuration
├── package.json               # Dependencies and scripts
└── README.md                  # Project documentation
```

### Directory Purposes
- **`prisma/`**: Contains the Prisma schema and migration files for database management.
- **`src/api/`**: Houses Next.js API routes, organized by feature modules for clean separation.
- **`src/controllers/`**: Contains business logic for each route, keeping API handlers thin.
- **`src/services/`**: Reusable services for database operations, AI integrations, and external APIs.
- **`src/models/`**: TypeScript types and interfaces for strong typing and consistency.
- **`src/middleware/`**: Custom middleware for authentication, error handling, and rate limiting.
- **`src/utils/`**: General-purpose utilities like logging, validation, and helpers.
- **`src/jobs/`**: Background job definitions for offloading heavy tasks (e.g., AI processing).
- **`src/config/`**: Configuration files for database, Redis, and environment variables.
- **`src/tests/`**: Unit and integration tests to ensure code reliability.


## Development Workflow
1. **Setup**: Configure Prisma, Redis, and environment variables.
2. **API Routes**: Implement routes in `src/api/` with controllers in `src/controllers/`.
3. **Services**: Write reusable services in `src/services/` for database and AI operations.
4. **Middleware**: Add authentication and error handling middleware in `src/middleware/`.
5. **Background Jobs**: Implement AI tasks as background jobs in `src/jobs/`.
6. **Testing**: Write tests in `src/tests/` for each feature.
7. **Deployment**: Deploy to Vercel (Next.js) with PostgreSQL and Redis on a cloud provider.


## Next Steps
- Define detailed API request/response schemas (e.g., using Swagger).
- Implement input validation with Zod or Joi.
- Set up CI/CD pipelines (e.g., GitHub Actions) for automated testing and deployment.
- Integrate AI APIs or models for video and question generation.