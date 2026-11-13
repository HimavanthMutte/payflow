# 🗄️ Database Design & Double-Entry Ledger

PayFlow utilizes PostgreSQL managed through Prisma ORM.

## Entity Relationship Overview

```
┌──────────────┐       1:1        ┌──────────────┐
│     User     ├─────────────────►│    Wallet    │
└──────┬───────┘                  └──────┬───────┘
       │ 1:N                             │ 1:N
       ├────────────────┐                │
       ▼                ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Payment    │ │ RefreshToken │ │ LedgerEntry  │
└──────┬───────┘ └──────────────┘ └──────▲───────┘
       │ 1:N                             │ 1:N
       ▼                                 │
┌──────────────┐                         │
│ Transaction  ├─────────────────────────┘
└──────────────┘
```

## Tables & Models

### 1. `User`
- `id` (UUID PK)
- `email` (Unique)
- `username` (Unique)
- `displayName` (String)
- `passwordHash` (Argon2id)
- `transactionPinHash` (Argon2id)
- `pinAttempts` (Int, default 0)
- `pinLockedUntil` (DateTime nullable)
- `virtualPaymentId` (Unique VPA, e.g., `alice@payflow`)
- `status` (`ACTIVE`, `SUSPENDED`, `DELETED`)

### 2. `Wallet`
- `id` (UUID PK)
- `userId` (FK User, Unique)
- `balance` (`BigInt` in paise)
- `currency` (`INR`)
- `dailyLimit` (`BigInt` in paise, default ₹1,00,000)

### 3. `Payment`
- `id` (UUID PK)
- `referenceNumber` (Unique, e.g., `PF...`)
- `senderId` (FK User)
- `recipientId` (FK User)
- `amountPaise` (`BigInt`)
- `status` (`TransactionStatus` enum)
- `simulationScenario` (`SUCCESS`, `FAILURE`, `PENDING`, `TIMEOUT`, `DELAYED_SUCCESS`)

### 4. `LedgerEntry` (Double-Entry Core)
- `id` (UUID PK)
- `transactionId` (FK Transaction)
- `userId` (FK User)
- `walletId` (FK Wallet)
- `type` (`CREDIT` | `DEBIT`)
- `amountPaise` (`BigInt`)
- `balanceBefore` (`BigInt`)
- `balanceAfter` (`BigInt`)
- `description` (String)
- `createdAt` (Timestamp)

## Mathematical Invariants

For any given payment transaction $T$:
$$\sum \text{DEBIT} = \sum \text{CREDIT}$$
$$\text{Balance}_{\text{after}} = \text{Balance}_{\text{before}} \pm \text{Amount}_{\text{paise}}$$
All currency balances are non-negative integers ($\ge 0$).
