class UserEntity {
  final String id;
  final String email;
  final String username;
  final String displayName;
  final String virtualPaymentId;
  final String? phone;
  final bool hasPinSet;

  const UserEntity({
    required this.id,
    required this.email,
    required this.username,
    required this.displayName,
    required this.virtualPaymentId,
    this.phone,
    this.hasPinSet = false,
  });

  UserEntity copyWith({
    String? id,
    String? email,
    String? username,
    String? displayName,
    String? virtualPaymentId,
    String? phone,
    bool? hasPinSet,
  }) {
    return UserEntity(
      id: id ?? this.id,
      email: email ?? this.email,
      username: username ?? this.username,
      displayName: displayName ?? this.displayName,
      virtualPaymentId: virtualPaymentId ?? this.virtualPaymentId,
      phone: phone ?? this.phone,
      hasPinSet: hasPinSet ?? this.hasPinSet,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is UserEntity &&
          runtimeType == other.runtimeType &&
          id == other.id &&
          email == other.email &&
          username == other.username;

  @override
  int get hashCode => id.hashCode ^ email.hashCode ^ username.hashCode;
}
