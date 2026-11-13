import 'package:uuid/uuid.dart';

class IdempotencyKeyGenerator {
  static const _uuid = Uuid();

  /// Generate a new unique idempotency key for a fresh payment
  static String generate() => _uuid.v4();

  /// Store key for the current payment flow — reuse this key on retry
  static String generateForPayment({
    required String senderId,
    required String recipientId,
    required int amountPaise,
  }) =>
      _uuid.v4();
}
