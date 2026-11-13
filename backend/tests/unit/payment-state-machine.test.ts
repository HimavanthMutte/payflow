import {
  canTransition,
  assertValidTransition,
  isTerminalState,
  isRetryEligible,
  isReversalEligible,
} from '../../src/modules/payments/payment-state-machine';

describe('Payment State Machine', () => {
  describe('canTransition', () => {
    it('allows INITIATED -> PROCESSING', () => {
      expect(canTransition('INITIATED', 'PROCESSING')).toBe(true);
    });

    it('allows INITIATED -> FAILED', () => {
      expect(canTransition('INITIATED', 'FAILED')).toBe(true);
    });

    it('disallows INITIATED -> SUCCESS directly', () => {
      expect(canTransition('INITIATED', 'SUCCESS')).toBe(false);
    });

    it('disallows INITIATED -> REVERSED', () => {
      expect(canTransition('INITIATED', 'REVERSED')).toBe(false);
    });

    it('allows PROCESSING -> SUCCESS', () => {
      expect(canTransition('PROCESSING', 'SUCCESS')).toBe(true);
    });

    it('allows PROCESSING -> FAILED', () => {
      expect(canTransition('PROCESSING', 'FAILED')).toBe(true);
    });

    it('allows PROCESSING -> PENDING', () => {
      expect(canTransition('PROCESSING', 'PENDING')).toBe(true);
    });

    it('disallows PROCESSING -> INITIATED', () => {
      expect(canTransition('PROCESSING', 'INITIATED')).toBe(false);
    });

    it('allows PENDING -> SUCCESS', () => {
      expect(canTransition('PENDING', 'SUCCESS')).toBe(true);
    });

    it('allows PENDING -> FAILED', () => {
      expect(canTransition('PENDING', 'FAILED')).toBe(true);
    });

    it('disallows PENDING -> INITIATED', () => {
      expect(canTransition('PENDING', 'INITIATED')).toBe(false);
    });

    it('allows SUCCESS -> REVERSED', () => {
      expect(canTransition('SUCCESS', 'REVERSED')).toBe(true);
    });

    it('disallows SUCCESS -> FAILED', () => {
      expect(canTransition('SUCCESS', 'FAILED')).toBe(false);
    });

    it('disallows FAILED -> any other state (terminal)', () => {
      expect(canTransition('FAILED', 'SUCCESS')).toBe(false);
      expect(canTransition('FAILED', 'PROCESSING')).toBe(false);
      expect(canTransition('FAILED', 'REVERSED')).toBe(false);
    });

    it('disallows REVERSED -> any other state (terminal)', () => {
      expect(canTransition('REVERSED', 'SUCCESS')).toBe(false);
      expect(canTransition('REVERSED', 'PROCESSING')).toBe(false);
    });
  });

  describe('assertValidTransition', () => {
    it('does not throw for valid transition', () => {
      expect(() =>
        assertValidTransition('INITIATED', 'PROCESSING'),
      ).not.toThrow();
    });

    it('throws descriptive error on invalid transition', () => {
      expect(() =>
        assertValidTransition('INITIATED', 'SUCCESS'),
      ).toThrow('Invalid payment state transition: INITIATED → SUCCESS');
    });
  });

  describe('isTerminalState', () => {
    it('returns true for SUCCESS, FAILED, REVERSED', () => {
      expect(isTerminalState('SUCCESS')).toBe(true);
      expect(isTerminalState('FAILED')).toBe(true);
      expect(isTerminalState('REVERSED')).toBe(true);
    });

    it('returns false for INITIATED, PROCESSING, PENDING', () => {
      expect(isTerminalState('INITIATED')).toBe(false);
      expect(isTerminalState('PROCESSING')).toBe(false);
      expect(isTerminalState('PENDING')).toBe(false);
    });
  });

  describe('isRetryEligible', () => {
    it('returns true for FAILED and PENDING', () => {
      expect(isRetryEligible('FAILED')).toBe(true);
      expect(isRetryEligible('PENDING')).toBe(true);
    });

    it('returns false for SUCCESS and INITIATED', () => {
      expect(isRetryEligible('SUCCESS')).toBe(false);
      expect(isRetryEligible('INITIATED')).toBe(false);
    });
  });

  describe('isReversalEligible', () => {
    it('returns true only for SUCCESS', () => {
      expect(isReversalEligible('SUCCESS')).toBe(true);
    });

    it('returns false for non-success states', () => {
      expect(isReversalEligible('FAILED')).toBe(false);
      expect(isReversalEligible('PENDING')).toBe(false);
      expect(isReversalEligible('INITIATED')).toBe(false);
    });
  });
});
