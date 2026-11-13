# ⚙️ Payment Engine Specification

## Execution Lifecycle

The PayFlow payment engine executes in four distinct phases:

### Phase 1: Pre-flight Verification
1. Verify sender authentication & extract `userId`.
2. Check sender PIN lockout timestamp (`pinLockedUntil > now()`).
3. Verify Argon2id hash of the submitted 6-digit PIN.
   - If invalid: increment attempts; if $\ge 5$, lock account for 30 minutes.
   - If valid: reset attempts to 0.
4. Verify recipient virtual address existence (`@payflow`).
5. Disallow self-payments (`senderId === recipientId`).
6. Validate transfer boundaries: $\ge \text{₹1}$ and $\le \text{₹5,00,000}$.

### Phase 2: Idempotency Interception
1. Query `IdempotencyRecord` table by `idempotencyKey`.
2. If record exists and belongs to the caller: return saved response immediately.
3. If not cached, proceed with payment initiation.

### Phase 3: Transaction Execution & Double-Entry Accounting
Within an isolated PostgreSQL serializable transaction:
```sql
-- Lock sender and recipient rows in predictable order to prevent deadlocks
SELECT id, balance FROM "Wallet" WHERE "userId" = :senderId FOR UPDATE;
SELECT id, balance FROM "Wallet" WHERE "userId" = :recipientId FOR UPDATE;
```
1. Verify sender `balance >= amountPaise`.
2. Debit sender balance: `balance - amountPaise`.
3. Credit recipient balance: `balance + amountPaise`.
4. Create `Transaction` record with state `SUCCESS`.
5. Insert two balanced `LedgerEntry` records (`DEBIT` & `CREDIT`).
6. Generate immutable `Receipt` record snapshot.

### Phase 4: Post-Processing & Notifications
1. Dispatch in-app notification to recipient (`PAYMENT_RECEIVED`).
2. Dispatch in-app notification to sender (`PAYMENT_SENT`).
3. Store final response body in `IdempotencyRecord`.
