import '../storage/secure_storage.dart';

class RouteGuards {
  RouteGuards._();

  static Future<bool> isAuthenticated() async {
    final token = await SecureStorage.getAccessToken();
    return token != null && token.isNotEmpty;
  }
}
