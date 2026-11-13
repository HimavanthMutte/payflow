import '../entities/user_entity.dart';
import '../repositories/auth_repository.dart';

class RegisterUseCase {
  final AuthRepository _repository;

  RegisterUseCase(this._repository);

  Future<UserEntity> call({
    required String email,
    required String password,
    required String username,
    required String displayName,
    String? phone,
  }) {
    return _repository.register(
      email: email,
      password: password,
      username: username,
      displayName: displayName,
      phone: phone,
    );
  }
}
