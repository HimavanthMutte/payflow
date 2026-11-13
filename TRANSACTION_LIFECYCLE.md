# 🔄 Transaction State Lifecycle

## State Machine Definition

A payment moves through deterministic states defined in the finite state machine:

```
                  ┌─────────────┐
                  │  INITIATED  │
                  └──────┬──────┘
                         │
                         ▼
                  ┌─────────────┐
                  │ PROCESSING  ├──────────────┐
                  └──┬───────┬──┘              │
                     │       │                 │
           ┌─────────┘       └────────┐        │
           ▼                          ▼        ▼
    ┌─────────────┐            ┌─────────────┐ │
    │   SUCCESS   │            │   PENDING   │ │
    └──────┬──────┘            └──────┬──────┘ │
           │                          │        │
           ▼                          ▼        ▼
    ┌─────────────┐            ┌─────────────┐ │
    │  REVERSED   │            │   FAILED    │◄┘
    └─────────────┘            └─────────────┘
```

## Transition Matrix

| From State | Allowed Target States | Description |
|---|---|---|
| **INITIATED** | `PROCESSING`, `FAILED` | Payment created in database before processing lock |
| **PROCESSING** | `SUCCESS`, `FAILED`, `PENDING` | Active accounting locks and simulated settlement |
| **PENDING** | `SUCCESS`, `FAILED` | Asynchronous resolution on poll or retry |
| **SUCCESS** | `REVERSED` | Reversal with compensating ledger entries |
| **FAILED** | None (Terminal) | Immutable failure record |
| **REVERSED** | None (Terminal) | Immutable compensation record |

## State Descriptions

- **`INITIATED`**: Payment payload received, sender & recipient validated, reference number generated.
- **`PROCESSING`**: Wallet rows locked, simulated banking network call in progress.
- **`SUCCESS`**: Ledger debited and credited atomically, receipt generated.
- **`PENDING`**: Downstream timeout occurred; status awaiting poll/reconciliation.
- **`FAILED`**: Insufficient funds, invalid PIN, or simulated decline.
- **`REVERSED`**: Settled funds debited back from recipient and credited to sender.
