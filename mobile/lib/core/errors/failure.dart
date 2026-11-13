abstract class Failure {
  final String message;
  final String? code;

  const Failure(this.message, {this.code});

  @override
  String toString() => '$runtimeType($code): $message';
}

class ServerFailure extends Failure {
  const ServerFailure(super.message, {super.code});
}

class NetworkFailure extends Failure {
  const NetworkFailure([String message = 'Please check your internet connection'])
      : super(message, code: 'NETWORK_ERROR');
}

class AuthFailure extends Failure {
  const AuthFailure(super.message, {super.code = 'AUTH_ERROR'});
}

class ValidationFailure extends Failure {
  const ValidationFailure(super.message, {super.code = 'VALIDATION_ERROR'});
}

class CacheFailure extends Failure {
  const CacheFailure(super.message, {super.code = 'CACHE_ERROR'});
}
