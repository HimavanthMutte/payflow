import { TransactionStatus } from '@prisma/client';

const VALID_TRANSITIONS: Partial<Record<TransactionStatus, TransactionStatus[]>> = {
  INITIATED: ['PROCESSING', 'FAILED'],
  PROCESSING: ['SUCCESS', 'FAILED', 'PENDING'],
  PENDING: ['SUCCESS', 'FAILED'],
  SUCCESS: ['REVERSED'],
  FAILED: [],
  REVERSED: [],
};

export function canTransition(
  from: TransactionStatus,
  to: TransactionStatus,
): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertValidTransition(
  from: TransactionStatus,
  to: TransactionStatus,
): void {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid payment state transition: ${from} → ${to}`);
  }
}

export function isTerminalState(status: TransactionStatus): boolean {
  return status === 'SUCCESS' || status === 'FAILED' || status === 'REVERSED';
}

export function isRetryEligible(status: TransactionStatus): boolean {
  return status === 'FAILED' || status === 'PENDING';
}

export function isReversalEligible(status: TransactionStatus): boolean {
  return status === 'SUCCESS';
}
