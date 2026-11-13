import '../entities/user_entity.dart';

abstract class AuthRepository {
  Future<UserEntity> login({required String email, required String password});
  Future<UserEntity> register({
    required String email,
    required String password,
    required String username,
    required String displayName,
    String? phone,
  });
  Future<UserEntity?> getCurrentUser();
  Future<void> logout();
  Future<bool> isAuthenticated();
}
