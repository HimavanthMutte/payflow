import 'package:dio/dio.dart';
import '../storage/secure_storage.dart';
import '../errors/app_exception.dart';
import '../constants/api_constants.dart';

/// Interceptor that attaches the Bearer JWT token to outgoing requests
class AuthInterceptor extends Interceptor {
  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await SecureStorage.getAccessToken();
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    options.headers['Accept'] = 'application/json';
    options.headers['Content-Type'] = 'application/json';
    handler.next(options);
  }
}

/// Interceptor that handles 401 Unauthorized errors and attempts refresh
class TokenRefreshInterceptor extends QueuedInterceptor {
  final Dio dio;

  TokenRefreshInterceptor(this.dio);

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      final refreshToken = await SecureStorage.getRefreshToken();
      if (refreshToken != null) {
        try {
          final refreshResponse = await dio.post(
            ApiConstants.refresh,
            data: {'refreshToken': refreshToken},
          );

          if (refreshResponse.statusCode == 200) {
            final data = refreshResponse.data['data'] ?? refreshResponse.data;
            final newAccess = data['accessToken'] as String;
            final newRefresh = (data['refreshToken'] as String?) ?? refreshToken;

            await SecureStorage.saveTokens(
              accessToken: newAccess,
              refreshToken: newRefresh,
            );

            // Retry original request with new token
            final options = err.requestOptions;
            options.headers['Authorization'] = 'Bearer $newAccess';

            final response = await dio.fetch(options);
            return handler.resolve(response);
          }
        } catch (_) {
          await SecureStorage.clearAll();
        }
      }
    }
    handler.next(err);
  }
}

/// Interceptor that maps Dio network and HTTP errors to domain AppException
class ErrorMappingInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    AppException exception;

    switch (err.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        exception = AppException.timeout();
        break;
      case DioExceptionType.connectionError:
        exception = AppException.network('Unable to connect to server. Check connection.');
        break;
      case DioExceptionType.badResponse:
        final status = err.response?.statusCode;
        final responseData = err.response?.data;
        String message = 'Server error occurred';
        String? code;

        if (responseData is Map<String, dynamic>) {
          message = responseData['message'] ?? responseData['error'] ?? message;
          code = responseData['code'];
        }

        if (status == 401) {
          exception = AppException.unauthorized();
        } else if (status == 422 && code == 'INSUFFICIENT_FUNDS') {
          exception = AppException.insufficientFunds();
        } else if (code == 'INVALID_PIN') {
          exception = AppException.invalidPin();
        } else {
          exception = AppException(message, code: code, statusCode: status);
        }
        break;
      case DioExceptionType.cancel:
        exception = const AppException('Request was cancelled', code: 'CANCELLED');
        break;
      default:
        exception = AppException.network(err.message ?? 'Unexpected network error');
    }

    handler.reject(
      DioException(
        requestOptions: err.requestOptions,
        error: exception,
        response: err.response,
        type: err.type,
      ),
    );
  }
}
