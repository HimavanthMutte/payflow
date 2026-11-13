class AppException implements Exception {
  final String message;
  final String? code;
  final int? statusCode;

  const AppException(this.message, {this.code, this.statusCode});

  factory AppException.network(String message) =>
      AppException(message, code: 'NETWORK_ERROR');

  factory AppException.unauthorized() => const AppException(
        'Session expired. Please log in again.',
        code: 'UNAUTHORIZED',
        statusCode: 401,
      );

  factory AppException.insufficientFunds() => const AppException(
        'Insufficient wallet balance',
        code: 'INSUFFICIENT_FUNDS',
        statusCode: 422,
      );

  factory AppException.invalidPin() => const AppException(
        'Incorrect transaction PIN',
        code: 'INVALID_PIN',
        statusCode: 400,
      );

  factory AppException.timeout() => const AppException(
        'Request timed out. Please check transaction status.',
        code: 'TIMEOUT',
        statusCode: 408,
      );

  factory AppException.server(String message) =>
      AppException(message, code: 'SERVER_ERROR', statusCode: 500);

  @override
  String toString() => 'AppException($code): $message';
}
