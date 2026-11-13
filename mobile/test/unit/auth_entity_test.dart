import 'package:flutter_test/flutter_test.dart';
import 'package:payflow_mobile/features/authentication/domain/entities/user_entity.dart';
import 'package:payflow_mobile/features/authentication/data/models/auth_model.dart';

void main() {
  group('UserEntity & AuthModel Tests', () {
    test('UserEntity instantiation and properties', () {
      const user = UserEntity(
        id: 'usr-1234-uuid',
        email: 'alex@payflow.com',
        username: 'alex',
        displayName: 'Alex Mercer',
        virtualPaymentId: 'alex@payflow',
        phone: '+919876543210',
        hasPinSet: true,
      );

      expect(user.id, 'usr-1234-uuid');
      expect(user.email, 'alex@payflow.com');
      expect(user.virtualPaymentId, 'alex@payflow');
      expect(user.hasPinSet, true);
    });

    test('UserEntity copyWith updates targeted fields', () {
      const user = UserEntity(
        id: 'usr-1234-uuid',
        email: 'alex@payflow.com',
        username: 'alex',
        displayName: 'Alex Mercer',
        virtualPaymentId: 'alex@payflow',
        phone: null,
        hasPinSet: false,
      );

      final updated = user.copyWith(
        displayName: 'Alexander M.',
        hasPinSet: true,
      );

      expect(updated.displayName, 'Alexander M.');
      expect(updated.hasPinSet, true);
      expect(updated.email, 'alex@payflow.com');
      expect(updated.id, 'usr-1234-uuid');
    });

    test('AuthModel fromJson parses user and tokens correctly', () {
      final json = {
        'user': {
          'id': 'usr-demo-uuid',
          'email': 'demo@payflow.com',
          'username': 'demo',
          'displayName': 'Demo User',
          'virtualPaymentId': 'demo@payflow',
          'phone': '+919999988888',
          'hasPinSet': true,
        },
        'accessToken': 'jwt.access.token',
        'refreshToken': 'refresh-token-hex',
      };

      final authModel = AuthModel.fromJson(json);

      expect(authModel.user.username, 'demo');
      expect(authModel.accessToken, 'jwt.access.token');
      expect(authModel.refreshToken, 'refresh-token-hex');
      expect(authModel.user.hasPinSet, true);
    });
  });
}

