import '../../domain/entities/user_entity.dart';

class UserModel extends UserEntity {
  const UserModel({
    required super.id,
    required super.email,
    required super.username,
    required super.displayName,
    required super.virtualPaymentId,
    super.phone,
    super.hasPinSet,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String,
      email: json['email'] as String,
      username: json['username'] as String,
      displayName: (json['displayName'] ?? json['name'] ?? json['username']) as String,
      virtualPaymentId: (json['virtualPaymentId'] ?? json['vpa'] ?? '${json['username']}@payflow') as String,
      phone: json['phone'] as String?,
      hasPinSet: (json['hasPinSet'] ?? json['hasPin']) as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'username': username,
      'displayName': displayName,
      'virtualPaymentId': virtualPaymentId,
      'phone': phone,
      'hasPinSet': hasPinSet,
    };
  }
}

class AuthResponseModel {
  final UserModel user;
  final String accessToken;
  final String refreshToken;

  const AuthResponseModel({
    required this.user,
    required this.accessToken,
    required this.refreshToken,
  });

  factory AuthResponseModel.fromJson(Map<String, dynamic> json) {
    final userData = json['user'] as Map<String, dynamic>;
    return AuthResponseModel(
      user: UserModel.fromJson(userData),
      accessToken: (json['accessToken'] ?? json['token']) as String,
      refreshToken: (json['refreshToken'] ?? '') as String,
    );
  }
}
