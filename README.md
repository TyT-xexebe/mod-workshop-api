# workshop-api

A production-ready RESTful API backend for a game modification platform, built with Node.js, Express, TypeScript, and MongoDB. The system includes strict input validation, token-based authentication, role-based authorization, rate-limiting, and safe file management.

---

## Tech Stack

* **Runtime:** Node.js (v24+)
* **Language:** TypeScript
* **Framework:** Express.js
* **Database:** MongoDB
* **File Handling:** Multer
* **Validation:** Zod
* **Security:** Helmet, CORS, Bcrypt, JSON Web Tokens (JWT), Express Rate Limit

---

## Getting Started

### Prerequisites

Node.js and MongoDB must be installed and running on your system.

### Environment Configuration

Create a `.env` file in the root directory. Note that the database URI variable name required by the application is `MONGO`.

```env
PORT=5000
MONGO=mongodb://127.0.0.1:27017/workshop
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
ALLOWED_ORIGIN=https://domain.com

```

### Installation

Install the project dependencies:

```bash
npm install

```

### Running the Application

* **Development Mode (with hot-reload):**

```bash
npm run dev

```

* **Production Build:**

```bash
npm run build

```

* **Production Run:**

```bash
npm start

```

---

## Rate-Limiting Policies

The application enforces differential rate limits via dedicated middlewares to protect against spam and brute-force attacks:

* **Global Limiter (`globalLimiter`):** Max 300 requests per 15 minutes per IP. Applied globally to all `/api/*` routes. Returns error code `TOO_MANY_REQUESTS`.
* **Auth Limiter (`authLimiter`):** Max 15 requests per 15 minutes per IP. Applied to authentication endpoints. Returns error code `AUTH_LIMIT_EXCEEDED`.
* **Spam Limiter (`spamLimiter`):** Max 20 requests per 1 minute per IP. Applied to sensitive actions like profile modifications, liking, and commenting. Returns error code `SPAM_PROTECTION`.
* **Upload Limiter (`uploadLimiter`):** Max 5 requests per 15 minutes per IP. Applied to mod creation and updates. Returns error code `UPLOAD_LIMIT_EXCEEDED`.

---

## Data Models

### User Schema

```typescript
{
  _id: ObjectId;
  username: string;     // Unique, required, trimmed, 3-20 characters
  passwordHash: string; // Required
  email: string;        // Unique, required, valid email format
  description: string;  // Optional, max 200 characters, default: ""
  role: "user" | "moderator" | "admin"; // Default: "user"
  createdAt: Date;
  updatedAt: Date;
}

```

### Mod Schema

```typescript
{
  _id: ObjectId;
  title: string;        // Unique, required, 3-50 characters
  description: string;  // Required, 10-1000 characters
  version: string;      // Required, SemVer format (e.g., 1.0.0)
  author: ObjectId;     // Reference to User model, required
  tags: string[];       // Array of enums: "content" | "script" | "UI" | "qol" | "java" | "soundpack" | "texturepack"
  fileUrl: string;      // Required, file path on disk
  downloads: number;    // Default: 0
  likesCount: number;   // Default: 0
  createdAt: Date;
  updatedAt: Date;
}

```

### Like Schema

```typescript
{
  userId: ObjectId;     // Reference to User model, required, Compound unique index
  modId: ObjectId;      // Reference to Mod model, required, Compound unique index
  createdAt: Date;      // Automatically managed timestamp
}

```

### Comment Schema

```typescript
{
  _id: ObjectId;
  modId: ObjectId;      // Reference to Mod model, required
  userId: ObjectId;     // Reference to User model, required
  text: string;         // Required, trimmed, 1-500 characters
  parentId: ObjectId;   // Reference to Comment model for threading, default null for root comment
  replyTo: ObjectId;    // Reference to User model, optional
  createdAt: Date;
  updatedAt: Date;
}

```

---

## File Upload Specifications

* **Allowed Extensions:** `.jar`, `.zip`, `.js`
* **Maximum File Size:** 50MB (`50 * 1024 * 1024` bytes)
* **Storage Location:** Local `./uploads` directory

---

## API Endpoints Documentation

### Utility Endpoints

| Method | Endpoint | Description | Auth Required | Rate Limiter | Expected Response |
| --- | --- | --- | --- | --- | --- |
| `GET` | `/api/ping` | Health check endpoint | No | `globalLimiter` | `200 OK` -> `{ "answer": "pong" }` |

### Authentication (`/api/auth`)

| Method | Endpoint | Request Payload / Zod Validation | Auth Required | Rate Limiter | Expected Response (Success) |
| --- | --- | --- | --- | --- | --- |
| `POST` | `/api/auth/register` | **Body:** `{ username (3-20), email, password (min 6) }` | No | `authLimiter` | `201 Created` + User configuration data (excludes password) |
| `POST` | `/api/auth/login` | **Body:** `{ email, password (min 6) }` | No | `authLimiter` | `200 OK` + JWT Token and User parameters |

### User Management (`/api/users`)

| Method | Endpoint | Request Payload / Params Validation | Auth Required | Rate Limiter | Expected Response (Success) |
| --- | --- | --- | --- | --- | --- |
| `GET` | `/api/users/me` | None | JWT | `globalLimiter` | `200 OK` + Current user profile |
| `PATCH` | `/api/users/me` | **Body (Strict):** `{ username?, description?, email? }` | JWT | `spamLimiter` | `200 OK` + Updated user profile data |
| `GET` | `/api/users/:id` | **Params:** `id` (24-char Hex ObjectId) | No | `globalLimiter` | `200 OK` + Public user profile |
| `GET` | `/api/users/:id/mods` | **Params:** `id` (24-char Hex ObjectId) <br>

<br> **Query:** `?page=&limit=&sort=&tag=&search=` | No | `globalLimiter` | `200 OK` + Paginated mods created by this user |
| `PATCH` | `/api/users/:id/role` | **Params:** `id` <br>

<br> **Body (Strict):** `{ role: "user" | "moderator" | "admin" }` | JWT (Admin only) | `spamLimiter` | `200 OK` + Updated target user object |

### Modification Management (`/api/mods`)

| Method | Endpoint | Request Payload / Params Validation | Auth Required | Rate Limiter | Expected Response (Success) |
| --- | --- | --- | --- | --- | --- |
| `GET` | `/api/mods` | **Query parameters:** <br>

<br> • `page` (default: 1) <br>

<br> • `limit` (default: 10, max: 100) <br>

<br> • `sort` (`newest` | `oldest` | `downloads` | `title`) <br>

<br> • `tag` (one or multiple valid tag enums) <br>

<br> • `search` (partial match case-insensitive) | No (Optional JWT) | `globalLimiter` | `200 OK` + Paginated array with meta statistics and `isLiked` state |
| `POST` | `/api/mods` | **Multipart/Form-Data:** <br>

<br> • `file` (binary archive payload) <br>

<br> • `body`: `{ title, description, version (SemVer), tags? }` | JWT | `uploadLimiter` | `201 Created` + Populated Mod metadata object |
| `GET` | `/api/mods/:id` | **Params:** `id` (24-char Hex ObjectId) | No | `globalLimiter` | `200 OK` + Specified Mod details |
| `PATCH` | `/api/mods/:id` | **Params:** `id` <br>

<br> **Multipart/Form-Data:** Optional binary `file` <br>

<br> **Body (Strict):** partial validation fields matching mod structure | JWT (Owner / Admin) | `uploadLimiter` | `200 OK` + Updated Mod information object |
| `DELETE` | `/api/mods/:id` | **Params:** `id` (24-char Hex ObjectId) | JWT (Owner / Admin) | `globalLimiter` | `200 OK` (Removes document and local attachment completely) |
| `GET` | `/api/mods/:id/download` | **Params:** `id` (24-char Hex ObjectId) | No | `globalLimiter` | Streams binary attachment payload using clean standardized filename syntax and increments downloads |
| `POST` | `/api/mods/:id/like` | **Params:** `id` (24-char Hex ObjectId) | JWT | `spamLimiter` | `200 OK` -> `{ "status": "success", "data": { "liked": boolean, "likesCount": number } }` |

### Comment Management (`/api/mods`)

| Method | Endpoint | Request Payload / Params Validation | Auth Required | Rate Limiter | Expected Response (Success) |
| --- | --- | --- | --- | --- | --- |
| `POST` | `/api/mods/:id/comments` | **Params:** `id` (Mod id) <br>

<br> **Body (Strict):** `{ text (1-500), parentId?, replyTo? }` | JWT | `spamLimiter` | `201 Created` + New populated comment instance |
| `GET` | `/api/mods/:id/comments` | **Params:** `id` (Mod id) <br>

<br> **Query:** `?parentId=&page=&limit=` | No | `globalLimiter` | `200 OK` + Balanced chronological array of comments with meta |
| `PATCH` | `/api/mods/comments/:id` | **Params:** `id` (Comment id) <br>

<br> **Body (Strict):** `{ text (1-500), replyTo? }` | JWT (Owner / Admin) | `spamLimiter` | `203 Non-Authoritative Information` + Updated comment |
| `DELETE` | `/api/mods/comments/:id` | **Params:** `id` (Comment id) | JWT (Owner / Admin) | `globalLimiter` | `200 OK` (Cascades and deletes child replies contextually) |

---

## Error Handling Structure

All application errors pass through a centralized processing middleware. Standard API error payloads use the following structured format:

```json
{
  "status": "error",
  "code": "ERROR_CODE_STRING",
  "message": "Detailed context-specific error explanation"
}

```

### Handled Error Profiles

* `AppError`: Custom application-level failures (e.g., `403 FORBIDDEN`, `401 NO_TOKEN`, `404 MOD_NOT_FOUND`).
* `ZodError`: Request fields fail to match Zod validation schema parameters. Returns an `errors` array containing the specific `field` and `message`.
* `mongoose.Error.ValidationError`: Mongoose schema state failures on database persistence operations.
* `mongoose.Error.CastError`: Invalid database `ObjectId` parameter formats passed to core operations.
* `MulterError`: Uploaded binary assets exceed size constraints or map to invalid field handles.
* `Mongo Error 11000`: Unique constraint violations (e.g., registering duplicate emails or titles). Returns `DUPLICATE_RECORD`.

---

## Author

* Github: [TyT-xexebe](https://www.google.com/search?q=https://github.com/TyT-xexebe)

---

## License

Copyright (c) 2026 TyTxexebe.
This project is licensed under the MIT License.
