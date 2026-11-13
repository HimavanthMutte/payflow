import '../../../../core/network/api_client.dart';
import '../../../../core/constants/api_constants.dart';
import '../../../../core/storage/secure_storage.dart';
import '../../domain/entities/user_entity.dart';
import '../../domain/repositories/auth_repository.dart';
import '../models/auth_model.dart';

class AuthRepositoryImpl implements AuthRepository {
  final ApiClient _apiClient;

  AuthRepositoryImpl(this._apiClient);

  @override
  Future<UserEntity> login({
    required String email,
    required String password,
  }) async {
    final response = await _apiClient.post(
      ApiConstants.login,
      data: {
        'email': email,
        'password': password,
      },
    );

    final data = response.data['data'] ?? response.data;
    final authResponse = AuthResponseModel.fromJson(data);

    await SecureStorage.saveTokens(
      accessToken: authResponse.accessToken,
      refreshToken: authResponse.refreshToken,
    );
    await SecureStorage.saveUserId(authResponse.user.id);

    return authResponse.user;
  }

  @override
  Future<UserEntity> register({
    required String email,
    required String password,
    required String username,
    required String displayName,
    String? phone,
  }) async {
    final response = await _apiClient.post(
      ApiConstants.register,
      data: {
        'email': email,
        'password': password,
        'username': username,
        'displayName': displayName,
        if (phone != null) 'phone': phone,
      },
    );

    final data = response.data['data'] ?? response.data;
    final authResponse = AuthResponseModel.fromJson(data);

    await SecureStorage.saveTokens(
      accessToken: authResponse.accessToken,
      refreshToken: authResponse.refreshToken,
    );
    await SecureStorage.saveUserId(authResponse.user.id);

    return authResponse.user;
  }

  @override
  Future<UserEntity?> getCurrentUser() async {
    try {
      final response = await _apiClient.get(ApiConstants.me);
      final data = response.data['data'] ?? response.data;
      return UserModel.fromJson(data);
    } catch (_) {
      return null;
    }
  }

  @override
  Future<void> logout() async {
    try {
      await _apiClient.post(ApiConstants.logout);
    } catch (_) {
      // Best-effort logout
    } finally {
      await SecureStorage.clearAll();
    }
  }

  @override
  Future<bool> isAuthenticated() async {
    final token = await SecureStorage.getAccessToken();
    return token != null && token.isNotEmpty;
  }
}
