# 💸 PayFlow — Production-Grade UPI Payment Simulator

[![CI/CD Pipeline](https://github.com/HimavanthMutte/payflow/actions/workflows/ci.yml/badge.svg)](https://github.com/HimavanthMutte/payflow/actions/workflows/ci.yml)
[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748.svg)](https://www.prisma.io/)
[![Flutter](https://img.shields.io/badge/Flutter-3.24%2B-02569B.svg)](https://flutter.dev/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

> ⚠️ **DISCLAIMER: SIMULATION ONLY**  
> PayFlow is a fintech software engineering demonstration platform simulating Unified Payments Interface (UPI) flows. **No real currency, banking networks, or actual monetary transactions occur.** All balances and payments operate inside an isolated double-entry accounting ledger.

---

## 🌟 Architecture & Highlights

PayFlow is engineered to SDE-1 production standards showcasing mission-critical financial backend patterns:
- **ACID Double-Entry Accounting**: Zero floating-point arithmetic errors. All currency is tracked as `BigInt` paise ($1\text{ INR} = 100\text{ paise}$).
- **Row-Level Locking (`FOR UPDATE`)**: Prevents balance race conditions and double-spending across concurrent requests.
- **Strict Payment State Machine**: Guarantees deterministic state transitions (`INITIATED` → `PROCESSING` → `SUCCESS` / `FAILED` / `PENDING` → `REVERSED`).
- **Database-Level Idempotency**: UUID-backed request deduplication to prevent duplicate debits on mobile retries.
- **Cryptographic Security**: Argon2id hashing for both authentication passwords and 6-digit transaction PINs with lockout protection.
- **Dynamic & Static UPI QR**: Fully compliant UPI deep link strings (`upi://pay?pa=...&pn=...`).

---

## 🏗️ System Overview

```
                      ┌──────────────────────────────┐
                      │    PayFlow Flutter Client    │
                      │  (Riverpod + Clean Arch)     │
                      └──────────────┬───────────────┘
                                     │ HTTPS / JWT
                                     ▼
                      ┌──────────────────────────────┐
                      │   Express Gateway / API      │
                      │ Helmet | CORS | RateLimiter  │
                      └──────────────┬───────────────┘
                                     │
                 ┌───────────────────┴───────────────────┐
                 │                                       │
                 ▼                                       ▼
     ┌───────────────────────┐               ┌───────────────────────┐
     │  Payment Core Engine  │               │   Auth & Security     │
     │  - State Machine      │               │  - Argon2id Password  │
     │  - Row-Level Locking  │               │  - Argon2id PIN       │
     │  - Idempotency Cache  │               │  - JWT & Rotation     │
     └───────────┬───────────┘               └───────────────────────┘
                 │
                 ▼
     ┌───────────────────────┐
     │ PostgreSQL (Prisma)   │
     │  - Double-Entry Ledger│
     │  - Atomic TX Locks    │
     └───────────────────────┘
```

---

## 🚀 Quick Start

### 1. Prerequisites
- [Node.js v20+](https://nodejs.org/)
- [Docker & Docker Compose](https://www.docker.com/)
- [Git](https://git-scm.com/)

### 2. Run with Docker Compose (Recommended)
```bash
git clone https://github.com/HimavanthMutte/payflow.git
cd payflow
docker-compose up -d
```
The backend API will be live at `http://localhost:3000`.  
Swagger documentation available at `http://localhost:3000/api/docs`.

### 3. Local Development Setup
```bash
# Setup backend environment
cd backend
cp ../.env.example .env

# Install dependencies
npm install

# Run database migrations and seed
npx prisma generate
npx prisma migrate dev
npm run db:seed

# Start backend dev server
npm run dev
```

---

## 🧪 Testing

```bash
cd backend
# Run unit tests
npm run test:unit

# Run full integration test suite
npm run test:integration
```

---

## 📚 Technical Documentation

- 📐 [Architecture & Clean Design](docs/ARCHITECTURE.md)
- 🔌 [Complete REST API Specification](docs/API_DOCUMENTATION.md)
- 🗄️ [Database Schema & Double-Entry Design](docs/DATABASE_DESIGN.md)
- ⚙️ [Core Payment Engine Mechanics](docs/PAYMENT_ENGINE.md)
- 🔄 [Transaction State Lifecycle](docs/TRANSACTION_LIFECYCLE.md)
- 🛡️ [Security & PIN Lockout Protocols](docs/SECURITY.md)
- 📊 [Development Progress Tracker](docs/DEVELOPMENT_PROGRESS.md)
