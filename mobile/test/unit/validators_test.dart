import 'package:flutter_test/flutter_test.dart';
import 'package:payflow_mobile/core/utils/validators.dart';

void main() {
  group('Validators', () {
    group('validateEmail', () {
      test('returns error when email is null or empty', () {
        expect(Validators.validateEmail(null), equals('Email is required'));
        expect(Validators.validateEmail(''), equals('Email is required'));
        expect(Validators.validateEmail('   '), equals('Email is required'));
      });

      test('returns error for invalid email formats', () {
        expect(Validators.validateEmail('notanemail'), equals('Enter a valid email address'));
        expect(Validators.validateEmail('test@'), equals('Enter a valid email address'));
        expect(Validators.validateEmail('@example.com'), equals('Enter a valid email address'));
      });

      test('returns null for valid emails', () {
        expect(Validators.validateEmail('user@payflow.com'), isNull);
        expect(Validators.validateEmail('john.doe@sub.domain.org'), isNull);
      });
    });

    group('validatePassword', () {
      test('returns error when password is empty or short', () {
        expect(Validators.validatePassword(null), equals('Password is required'));
        expect(Validators.validatePassword(''), equals('Password is required'));
        expect(Validators.validatePassword('1234567'), equals('Password must be at least 8 characters'));
      });

      test('returns null when password is 8+ characters', () {
        expect(Validators.validatePassword('password123'), isNull);
      });
    });

    group('validateName', () {
      test('validates minimum name length', () {
        expect(Validators.validateName(null), equals('Name is required'));
        expect(Validators.validateName('A'), equals('Name must be at least 2 characters'));
        expect(Validators.validateName('John Doe'), isNull);
      });
    });

    group('validatePhone', () {
      test('validates 10-digit Indian phone numbers', () {
        expect(Validators.validatePhone(null), equals('Phone number is required'));
        expect(Validators.validatePhone('12345'), equals('Enter a valid 10-digit mobile number'));
        expect(Validators.validatePhone('1234567890'), equals('Enter a valid 10-digit mobile number')); // Starts with 1
        expect(Validators.validatePhone('9876543210'), isNull);
        expect(Validators.validatePhone('+91 98765 43210'), isNull);
      });
    });

    group('validateVpa', () {
      test('validates UPI ID format', () {
        expect(Validators.validateVpa(null), equals('UPI ID is required'));
        expect(Validators.validateVpa('invalid_vpa'), equals('Enter a valid UPI ID (e.g. name@payflow)'));
        expect(Validators.validateVpa('john@payflow'), isNull);
        expect(Validators.validateVpa('user.name@okaxis'), isNull);
      });
    });

    group('validatePin', () {
      test('validates 6-digit numeric PIN', () {
        expect(Validators.validatePin('123'), equals('PIN must be 6 digits'));
        expect(Validators.validatePin('1234567'), equals('PIN must be 6 digits'));
        expect(Validators.validatePin('12a456'), equals('PIN must only contain digits'));
        expect(Validators.validatePin('123456'), isNull);
      });
    });

    group('validateAmount', () {
      test('validates amount limits', () {
        expect(Validators.validateAmount(null), equals('Amount is required'));
        expect(Validators.validateAmount('0'), equals('Enter a valid amount'));
        expect(Validators.validateAmount('0.5'), equals('Minimum amount is ₹1.0'));
        expect(Validators.validateAmount('100'), isNull);
      });
    });
  });
}
