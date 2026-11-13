# 🔌 PayFlow REST API Documentation

Base URL: `http://localhost:3000/api/v1`  
Swagger UI: `http://localhost:3000/api/docs`  
Authentication: `Authorization: Bearer <JWT>`

---

## 1. Authentication (`/api/v1/auth`)

### POST `/register`
Creates user, assigns VPA, initializes wallet with ₹500 starter balance (50,000 paise).
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "Password@123",
  "displayName": "John Doe",
  "phone": "+919876543210"
}
```

### POST `/login`
Returns access token (15m) and refresh token (7d).
```json
{
  "email": "user@example.com",
  "password": "Password@123"
}
```

### POST `/refresh`
Rotates refresh tokens and returns fresh access token.
```json
{
  "refreshToken": "<refresh_token>"
}
```

### POST `/pin/set` (Auth required)
```json
{
  "pin": "123456",
  "confirmPin": "123456"
}
```

---

## 2. Wallet (`/api/v1/wallet`)

### GET `/`
Returns user wallet, balance in paise and rupees, and daily/monthly limits.

### GET `/balance`
Returns balance snapshot.

---

## 3. Payments (`/api/v1/payments`)

### POST `/`
Initiates and executes a payment with idempotency guarantee.
```json
{
  "recipientVirtualId": "bob@payflow",
  "amountPaise": "25000",
  "description": "Lunch split",
  "pin": "123456",
  "idempotencyKey": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "simulationScenario": "SUCCESS"
}
```

### GET `/`
Returns paginated list of sent and received payments.

### GET `/:id/status`
Polls transaction status (`INITIATED`, `PROCESSING`, `SUCCESS`, `FAILED`, `PENDING`).

### POST `/:id/retry`
Retries a failed or pending payment.

### POST `/:id/reverse`
Executes compensating balance reversal for a completed payment.
```json
{
  "reason": "Duplicate order cancellation"
}
```

---

## 4. QR Code (`/api/v1/qr`)

### POST `/generate`
Generates static or dynamic UPI QR code.
```json
{
  "type": "DYNAMIC",
  "amountPaise": "50000",
  "description": "Invoice #1042"
}
```

### POST `/decode`
Parses and validates a `upi://pay` URI string.
```json
{
  "payload": "upi://pay?pa=alice@payflow&pn=Alice+Sharma&cu=INR&am=500.00"
}
```

---

## 5. Transactions & Ledger (`/api/v1/transactions`)

### GET `/`
Returns double-entry ledger entries with running balance before and after.

### GET `/:id`
Returns transaction details and counterparty audit record.
