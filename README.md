# Bank Transaction API

A RESTful banking API built with **Express.js**, **MongoDB**, and **Redis**. Supports user authentication, bank account management, and atomic fund transfers with a double-entry ledger system.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM modules) |
| Framework | Express.js v5 |
| Database | MongoDB via Mongoose |
| Cache / Lock | Redis via ioredis |
| Auth | JWT (jsonwebtoken) + cookies |
| Password Hashing | bcrypt |

---

## Project Structure

```
src/
├── config/
│   ├── db.js               # MongoDB connection
│   └── redis.js            # Redis client (ioredis)
├── controllers/
│   ├── auth.controllers.js         # Register, Login, Logout
│   ├── account.controllers.js      # Create account
│   └── transaction.controller.js   # Transfer funds, Transaction history
├── middleware/
│   └── auth.middleware.js  # JWT verification + blacklist check
├── models/
│   ├── user.model.js        # User schema
│   ├── accounts.model.js    # Account schema
│   ├── transactions.model.js# Transaction schema
│   └── ledger.models.js     # Ledger schema (immutable)
├── routes/
│   ├── auth.routes.js       # /auth/*
│   ├── accounts.routes.js   # /account/*
│   └── transactions.routes.js # /transactions/*
└── app.js                   # Express app setup
server.js                    # Entry point
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB with a replica set)
- Docker (for Redis)

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd bank_transaction
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root:

```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
SYSTEM_ACC_ID=your_system_account_id
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

> ⚠️ Never commit `.env` to git. It is listed in `.gitignore`.

### 4. Start Redis

```bash
docker run -d -p 6379:6379 --name redis redis:alpine
```

### 5. Run the server

```bash
npm run dev
```

---

## API Reference

### Auth — `/auth`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Register a new user |
| POST | `/auth/login` | No | Login and receive a JWT cookie |
| POST | `/auth/logout` | Yes | Logout and blacklist the token |

#### POST `/auth/register`
```json
{
  "name": "Ganesh",
  "email": "ganesh@example.com",
  "password": "securepassword"
}
```

#### POST `/auth/login`
```json
{
  "email": "ganesh@example.com",
  "password": "securepassword"
}
```

---

### Accounts — `/account`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| POST | `/account/createAccount` | Yes | Create a bank account for the logged-in user |

Accounts are created as `savings` type with `active` status and `0` balance by default.

---

### Transactions — `/transactions`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| POST | `/transactions/transferFunds` | Yes | Transfer funds between two accounts |
| GET | `/transactions/getTransactionHistory/:accountId` | Yes | Get ledger history for an account |

#### POST `/transactions/transferFunds`
```json
{
  "fromAccountId": "account_object_id",
  "toAccountId": "account_object_id",
  "amount": 500,
  "idempotencyKey": "unique-uuid-per-request"
}
```

> The `idempotencyKey` must be unique per transaction. Re-sending the same key will be rejected.

---

## Data Models

### User
| Field | Type | Notes |
|---|---|---|
| email | String | Unique, required, lowercase |
| name | String | Required |
| password | String | Hashed with bcrypt, not returned by default |

### Account
| Field | Type | Notes |
|---|---|---|
| user | ObjectId | Ref to User |
| status | String | `active`, `dormant`, `frozen` |
| accountType | String | `savings`, `current`, `business` |
| balance | Number | Default 0 |
| isSystemAccount | Boolean | Default false |

### Transaction
| Field | Type | Notes |
|---|---|---|
| fromAccount | ObjectId | Ref to Account |
| toAccount | ObjectId | Ref to Account |
| transactionStatus | String | `Pending`, `Completed`, `Failed`, `Reversed` |
| amount | Number | Required |
| idempotencyKey | String | Unique, indexed |

### Ledger
| Field | Type | Notes |
|---|---|---|
| account | ObjectId | Ref to Account |
| amount | Number | Immutable |
| transaction | ObjectId | Ref to Transaction |
| type | String | `Credited` or `Debited` |

> Ledger entries are **fully immutable** — all update and delete operations are blocked at the schema level via Mongoose middleware.

---

## Redis Features

### 1. Idempotency Key Locking
Every transfer request requires a unique `idempotencyKey`. On arrival, the key is stored in Redis using `SET NX EX 86400` (set only if not exists, expires in 24h).

- If the key doesn't exist → lock acquired → transaction proceeds
- If the key already exists → duplicate request → rejected with `409`

This prevents race conditions where two identical requests arrive simultaneously and both pass the MongoDB check before either one creates a record.

### 2. JWT Blacklisting
On logout, the JWT token is decoded to get its remaining expiry time, then stored in Redis with a matching TTL. Every request through `authMiddleware` checks Redis before trusting the token.

- Token in Redis → blacklisted → `401 Unauthorized`
- Token not in Redis → valid → proceed normally

Tokens auto-expire from Redis at the same time they would have expired naturally, keeping memory clean.

### 3. Transaction History Caching
`getTransactionHistory` results are cached in Redis per account with a 15-minute TTL.

- Cache hit → return instantly from Redis
- Cache miss → query MongoDB + populate → store in Redis → return
- New transaction committed → cache for both involved accounts is invalidated via `DEL`

---

## Authentication Flow

All protected routes use cookie-based JWT auth. The token is set as a cookie on login/register and cleared on logout.

```
Request → authMiddleware
            ├── No token → 401
            ├── Token in Redis blacklist → 401
            ├── jwt.verify() fails → 500
            ├── User not found in DB → 401
            └── OK → attach user to request → next()
```

---

## Transfer Flow

```
POST /transferFunds
  ├── Redis SET NX idempotencyKey → duplicate? reject
  ├── Start MongoDB session + transaction
  ├── Validate fromAccount, toAccount
  ├── Check account status (must be active)
  ├── Check ownership (fromAccount must belong to logged-in user)
  ├── Check balance >= amount
  ├── Debit fromAccount, Credit toAccount
  ├── Create Transaction record
  ├── Create two Ledger entries (Debited + Credited)
  ├── Commit MongoDB transaction
  ├── Invalidate Redis cache for both accounts
  └── Return transaction record
```
