# 🛡️ Security Architecture & Protocols

PayFlow implements industry-standard security practices for fintech platforms:

## 1. Password & PIN Security
- **Algorithm**: Argon2id (memory-hard, resistant to GPU/ASIC cracking).
- **Parameters (Password)**:
  - Memory: 64 MB (`65536` KiB)
  - Time Cost: 3 iterations
  - Parallelism: 4 threads
- **Parameters (6-Digit PIN)**:
  - Memory: 32 MB (`32768` KiB)
  - Time Cost: 2 iterations
  - Parallelism: 2 threads
- **Brute-Force Protection**: 5 failed PIN attempts trigger automatic 30-minute lockout.

## 2. API Security & Transport
- **Rate Limiting**: 100 requests per 15-minute window per IP using `express-rate-limit`.
- **HTTP Headers**: Enforced via `helmet` (HSTS, Content Security Policy, X-Frame-Options, XSS protection).
- **CORS Protection**: Whitelisted origin headers.
- **Correlation ID Tracking**: Every request tagged with unique `X-Correlation-ID` header.

## 3. Financial Invariants & Concurrency Safety
- **Row-Level Locking (`FOR UPDATE`)**: Prevents race conditions during concurrent payments.
- **Zero Floats**: Strictly integer paise representation avoiding floating-point inaccuracies.
- **Idempotency**: UUID idempotency tokens protect against accidental double-clicks and network retries.
