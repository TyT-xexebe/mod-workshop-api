# workshop-api

A production-ready RESTful API backend for a game modification platform, built with Node.js, Express, TypeScript, and MongoDB. The system includes strict input validation, token-based authentication, role-based authorization, rate-limiting for auth endpoints, and safe file management.

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
  createdAt: Date;
  updatedAt: Date;
}

```

---

## File Upload Specifications

* **Allowed Extensions:** `.jar`, `.zip`, `.js`
* **Maximum File Size:** 50MB
* **Storage Location:** Local `./uploads` directory

---

## API Endpoints Documentation

### Utility Endpoints

| Method | Endpoint | Description | Auth Required | Expected Response |
| --- | --- | --- | --- | --- |
| `GET` | `/ping` | Health check endpoint | No | `200 OK` -> `{ "answer": "pong" }` |

### Authentication (`/auth`)

*Rate-limiting policy: Maximum of 20 requests per 15 minutes per IP.*

| Method | Endpoint | Request Payload | Auth Required | Expected Response (Success) |
| --- | --- | --- | --- | --- |
| `POST` | `/auth/register` | JSON: `{ username, email, password }` | No | `201 Created` + User summary data |
| `POST` | `/auth/login` | JSON: `{ email, password }` | No | `200 OK` + JWT Token and User info |

### User Management (`/users`)

| Method | Endpoint | Request Payload / Params | Auth Required | Expected Response (Success) |
| --- | --- | --- | --- | --- |
| `GET` | `/users/me` | None | JWT | `200 OK` + Current user profile (excludes password hash) |
| `PATCH` | `/users/me` | JSON: `{ username?, description?, email? }` (Strict) | JWT | `200 OK` + Updated profile data |
| `GET` | `/users/:id` | Params: `id` (24-char Hex ObjectId) | No | `200 OK` + Public user profile |
| `GET` | `/users/:id/mods` | Params: `id` <br>

<br> Query: `?page=&limit=&sort=&tag=&search=` | No | `200 OK` + Paginated list of mods by this user |

### Modification Management (`/mods`)

| Method | Endpoint | Request Payload / Params | Auth Required | Expected Response (Success) |
| --- | --- | --- | --- | --- |
| `GET` | `/mods` | Query parameters:<br>

<br>• `page` (default: 1)<br>

<br>• `limit` (default: 10, max: 100)<br>

<br>• `sort` (`newest` | `oldest` | `downloads` | `title`) <br>

<br>• `tag` (one or multiple valid tags)<br>

<br>• `search` (partial title match) | No | `200 OK` + Paginated array with meta statistics |
| `POST` | `/mods` | Multipart/Form-Data:<br>

<br>• `file` (binary archive)<br>

<br>• fields: `{ title, description, version, tags? }` | JWT | `201 Created` + Complete Mod metadata object |
| `GET` | `/mods/:id` | Params: `id` (24-char Hex ObjectId) | No | `200 OK` + Target Mod details |
| `PATCH` | `/mods/:id` | Multipart/Form-Data (Optional new `file`) <br>

<br> JSON payload fields: partial mod parameters | JWT (Owner / Admin) | `200 OK` + Updated Mod information |
| `DELETE` | `/mods/:id` | Params: `id` (24-char Hex ObjectId) | JWT (Owner / Admin) | `200 OK` (Deletes metadata and local file) |
| `GET` | `/mods/:id/download` | Params: `id` (24-char Hex ObjectId) | No | `200 OK` (Streams binary attachment, increments counter) |

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
* `ZodError` / `ValidationError`: Request fields fail to match schema definitions. Contains an extra `errors` array mapping fields to validation failures.
* `CastError`: Invalid database `ObjectId` strings passed to endpoints.
* `MulterError`: Uploaded file exceeds limits or hits incorrect routing names.
* `Mongo Error 11000`: Unique constraint violations (e.g., registering duplicate emails or titles).

---

## Author

* Github: [TyT-xexebe](https://www.google.com/search?q=https://github.com/TyT-xexebe)

---

## License

Copyright (c) 2026 TyTxexebe.
This project is licensed under the MIT License.
