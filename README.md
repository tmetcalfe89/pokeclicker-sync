# Pokeclicker Sync API

The backend service backs the browser extensions by providing user authentication and localStorage synchronization. All endpoints assume a base URL derived from `PORT` (default `3000`), so a local server listens on `http://localhost:3000` unless deployed elsewhere.

## Environment

Required variables (see `.env.example`):

- `PORT` – port the Express server listens on.
- `MONGODB_URI` – MongoDB connection string.
- `JWT_SECRET` – secret for signing JSON Web Tokens.
- `CORS_ORIGINS` – optional comma-separated list of allowed origins.

Start the service with `npm run dev` or `npm start` after installing dependencies (`npm install`).

## Authentication

Most endpoints require a `Bearer` token received from the authentication endpoints. Include it in the `Authorization` header:

```
Authorization: Bearer <token>
```

Tokens expire after seven days. When a token is missing, invalid, or expired the API returns `401 Unauthorized` with a JSON error message.

## Endpoints

### Health Check

- **GET** `/health`
- **Purpose:** Verify the service is reachable.
- **Response:**
  - `200 OK`
    ```json
    { "status": "ok" }
    ```

### Register

- **POST** `/api/auth/register`
- **Purpose:** Create a new user and receive a session token.
- **Request Body:**
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Responses:**
  - `201 Created`
    ```json
    {
      "token": "<jwt>",
      "user": {
        "id": "<userId>",
        "username": "string",
        "createdAt": "ISO8601",
        "updatedAt": "ISO8601"
      }
    }
    ```
  - `400 Bad Request` if either field is missing.
  - `409 Conflict` if the username already exists.
  - `500 Internal Server Error` on unexpected failures.

**Example:**
```
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"ash","password":"pikachu"}'
```

### Login

- **POST** `/api/auth/login`
- **Purpose:** Exchange credentials for a JWT.
- **Request Body:** Same payload as register.
- **Responses:**
  - `200 OK` with the same JSON structure as the register endpoint.
  - `400 Bad Request` if input is incomplete.
  - `401 Unauthorized` if credentials are invalid.
  - `500 Internal Server Error` on unexpected failures.

**Example:**
```
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"ash","password":"pikachu"}'
```

### Current User

- **GET** `/api/auth/me`
- **Purpose:** Return the authenticated user's profile.
- **Headers:** `Authorization: Bearer <token>`
- **Responses:**
  - `200 OK`
    ```json
    {
      "user": {
        "id": "<userId>",
        "username": "string",
        "createdAt": "ISO8601",
        "updatedAt": "ISO8601"
      }
    }
    ```
  - `401 Unauthorized` if the token is missing or invalid.

**Example:**
```
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <jwt>"
```

### Sync Local Storage

- **POST** `/api/sync`
- **Purpose:** Synchronize a user's localStorage snapshot with the server.
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "values": {
      "key": "value",
      "another": "value"
    },
    "timestamp": "ISO8601 or null"
  }
  ```
  - `values` must be an object containing key-value pairs (null removes a key).
  - `timestamp` is the client's last sync timestamp; omit or set `null` when syncing for the first time.
- **Responses:**
  - `200 OK`
    - When the server has newer data:
      ```json
      {
        "applied": "server",
        "values": { "key": "value" },
        "timestamp": "ISO8601"
      }
      ```
      The client should apply `values` locally.
    - When the client's payload is stored:
      ```json
      {
        "applied": "client",
        "timestamp": "ISO8601"
      }
      ```
  - `400 Bad Request` if `values` is missing or not an object.
  - `401 Unauthorized` if authentication fails.

**Example:**
```
curl -X POST http://localhost:3000/api/sync \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt>" \
  -d '{"values":{"key":"value"},"timestamp":null}'
```

## Error Format

Errors follow a simple structure:
```json
{ "message": "Description of what went wrong." }
```
Always check the HTTP status code to determine the outcome.
