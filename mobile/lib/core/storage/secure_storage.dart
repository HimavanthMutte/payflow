import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorage {
  SecureStorage._();

  static const _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
    iOptions: IOSOptions(accessibility: KeychainAccessibility.first_unlock),
  );

  static const _accessTokenKey = 'access_token';
  static const _refreshTokenKey = 'refresh_token';
  static const _userIdKey = 'user_id';

  static Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await _storage.write(key: _accessTokenKey, value: accessToken);
    await _storage.write(key: _refreshTokenKey, value: refreshToken);
  }

  static Future<String?> getAccessToken() => _storage.read(key: _accessTokenKey);
  static Future<String?> getRefreshToken() => _storage.read(key: _refreshTokenKey);
  static Future<void> saveUserId(String id) => _storage.write(key: _userIdKey, value: id);
  static Future<String?> getUserId() => _storage.read(key: _userIdKey);

  static Future<void> clearAll() async {
    await _storage.deleteAll();
  }
}
