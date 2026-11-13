# 🏛️ Architecture Documentation

## Overview

PayFlow is designed following Clean Architecture and Domain-Driven Design (DDD) principles. The architecture decouples domain logic, application use cases, transport controllers, and persistence infrastructure.

```
+--------------------------------------------------------------+
|                      Presentation Layer                      |
|           Controllers, Routes, Middleware, Validation        |
+--------------------------------------------------------------+
                               │
                               ▼
+--------------------------------------------------------------+
|                     Application / Domain                     |
|        Payment Engine, State Machine, Idempotency            |
+--------------------------------------------------------------+
                               │
                               ▼
+--------------------------------------------------------------+
|                     Infrastructure Layer                     |
|           Prisma ORM, PostgreSQL, Winston Logger, JWT        |
+--------------------------------------------------------------+
```

## Layer Responsibilities

### 1. Presentation Layer (`src/modules/*/`)
- **Routes (`*.routes.ts`)**: Defines endpoint paths, attaches auth middleware, validates payload schemas, and maps to controllers.
- **Controllers (`*.controller.ts`)**: Extracts request parameters, delegates to service logic, and structures standard HTTP responses.
- **Schemas (`*.schema.ts`)**: Zod-based compile-time and runtime validation schemas enforcing strict contract conformity.

### 2. Domain / Core Engine (`src/modules/payments/`)
- **Payment State Machine (`payment-state-machine.ts`)**: Pure state machine function ensuring valid transitions between payment states.
- **Idempotency Service (`idempotency.service.ts`)**: Guarantees exactly-once execution semantics by caching prior outcomes.
- **Payment Engine Service (`payment-engine.service.ts`)**: Orchestrates row-level locking, double-entry wallet adjustments, and transaction journaling.

### 3. Infrastructure & Utilities (`src/config/`, `src/utils/`)
- **Database (`database.ts`)**: Singleton PrismaClient instance with error logging hooks.
- **Crypto Utility (`crypto.util.ts`)**: Argon2id password and PIN hashing, SHA-256 tokens.
- **Amount Utility (`amount.util.ts`)**: Safe integer-based paise calculation avoiding floating-point rounding errors.

## Concurrency Architecture

To eliminate balance inconsistencies and double-spend exploits, PayFlow leverages:
1. **PostgreSQL Row-Level Locking (`SELECT ... FOR UPDATE`)**:
   During payment processing, both the sender and recipient wallet rows are locked in a deterministic order within a serializable database transaction.
2. **Double-Entry Journaling**:
   Every balance movement writes symmetric `DEBIT` and `CREDIT` ledger records. Balance before and balance after are recorded on every row.
