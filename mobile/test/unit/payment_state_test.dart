import 'package:flutter_test/flutter_test.dart';

enum PaymentLifecycle {
  initiated,
  pinRequested,
  processing,
  settled,
  failed,
  reversed,
}

class PaymentState {
  final PaymentLifecycle status;
  final String? txnId;
  final String? failureReason;

  const PaymentState({
    required this.status,
    this.txnId,
    this.failureReason,
  });

  PaymentState transitionTo(PaymentLifecycle next, {String? txnId, String? failureReason}) {
    // State machine rule validation
    if (status == PaymentLifecycle.settled && next != PaymentLifecycle.reversed) {
      throw StateError('Cannot transition from settled to $next except reversed');
    }
    if (status == PaymentLifecycle.failed) {
      throw StateError('Cannot transition terminal state failed');
    }
    return PaymentState(
      status: next,
      txnId: txnId ?? this.txnId,
      failureReason: failureReason,
    );
  }
}

void main() {
  group('PaymentState State Machine', () {
    test('initial payment state starts at initiated', () {
      const state = PaymentState(status: PaymentLifecycle.initiated);
      expect(state.status, equals(PaymentLifecycle.initiated));
      expect(state.txnId, isNull);
    });

    test('transition from initiated to pinRequested to processing to settled', () {
      PaymentState state = const PaymentState(status: PaymentLifecycle.initiated);

      state = state.transitionTo(PaymentLifecycle.pinRequested);
      expect(state.status, equals(PaymentLifecycle.pinRequested));

      state = state.transitionTo(PaymentLifecycle.processing, txnId: 'TXN-123');
      expect(state.status, equals(PaymentLifecycle.processing));
      expect(state.txnId, equals('TXN-123'));

      state = state.transitionTo(PaymentLifecycle.settled);
      expect(state.status, equals(PaymentLifecycle.settled));
      expect(state.txnId, equals('TXN-123'));
    });

    test('transition from settled to reversed is allowed for refund/reversal', () {
      final settled = const PaymentState(
        status: PaymentLifecycle.settled,
        txnId: 'TXN-999',
      );
      final reversed = settled.transitionTo(PaymentLifecycle.reversed);
      expect(reversed.status, equals(PaymentLifecycle.reversed));
    });

    test('transition from settled to processing throws StateError', () {
      final settled = const PaymentState(
        status: PaymentLifecycle.settled,
        txnId: 'TXN-999',
      );
      expect(
        () => settled.transitionTo(PaymentLifecycle.processing),
        throwsStateError,
      );
    });

    test('transition from failed terminal state throws StateError', () {
      final failed = const PaymentState(
        status: PaymentLifecycle.failed,
        failureReason: 'INSUFFICIENT_FUNDS',
      );
      expect(
        () => failed.transitionTo(PaymentLifecycle.processing),
        throwsStateError,
      );
    });
  });
}
