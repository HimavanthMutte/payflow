import 'package:flutter_test/flutter_test.dart';
import 'package:payflow_mobile/core/utils/amount_formatter.dart';

void main() {
  group('AmountFormatter', () {
    test('formatRupees formats whole rupee amounts with ₹ symbol', () {
      expect(AmountFormatter.formatRupees(100), equals('₹1'));
      expect(AmountFormatter.formatRupees(1000), equals('₹10'));
      expect(AmountFormatter.formatRupees(10000), equals('₹100'));
      expect(AmountFormatter.formatRupees(100000), equals('₹1,000'));
      expect(AmountFormatter.formatRupees(10000000), equals('₹1,00,000'));
    });

    test('formatRupees formats paise decimals properly with 2 digits', () {
      expect(AmountFormatter.formatRupees(150), equals('₹1.50'));
      expect(AmountFormatter.formatRupees(105), equals('₹1.05'));
      expect(AmountFormatter.formatRupees(99), equals('₹0.99'));
      expect(AmountFormatter.formatRupees(123456), equals('₹1,234.56'));
    });

    test('formatRupees formats zero correctly', () {
      expect(AmountFormatter.formatRupees(0), equals('₹0'));
    });

    test('formatRupees formats negative amounts with -₹ prefix', () {
      expect(AmountFormatter.formatRupees(-5000), equals('-₹50'));
      expect(AmountFormatter.formatRupees(-1250), equals('-₹12.50'));
    });

    test('parseRupees parses plain integer string to paise', () {
      expect(AmountFormatter.parseRupees('100'), equals(10000));
      expect(AmountFormatter.parseRupees('1'), equals(100));
      expect(AmountFormatter.parseRupees('0'), equals(0));
    });

    test('parseRupees parses decimal string to paise', () {
      expect(AmountFormatter.parseRupees('10.50'), equals(1050));
      expect(AmountFormatter.parseRupees('10.5'), equals(1050));
      expect(AmountFormatter.parseRupees('0.99'), equals(99));
    });

    test('parseRupees parses rupee symbol and commas correctly', () {
      expect(AmountFormatter.parseRupees('₹1,000.50'), equals(100050));
      expect(AmountFormatter.parseRupees('₹ 50,000'), equals(5000000));
    });

    test('formatPaise returns exact string representation of paise', () {
      expect(AmountFormatter.formatPaise(5000), equals('5000'));
      expect(AmountFormatter.formatPaise(0), equals('0'));
    });

    test('isValidAmount validates limits correctly', () {
      expect(AmountFormatter.isValidAmount(100), isTrue); // min 100 paise = ₹1
      expect(AmountFormatter.isValidAmount(99), isFalse);
      expect(AmountFormatter.isValidAmount(10000000), isTrue); // max ₹1,00,000
      expect(AmountFormatter.isValidAmount(10000001), isFalse);
    });

    test('isValidAmount supports custom min and max constraints', () {
      expect(AmountFormatter.isValidAmount(500, min: 1000, max: 5000), isFalse);
      expect(AmountFormatter.isValidAmount(2500, min: 1000, max: 5000), isTrue);
      expect(AmountFormatter.isValidAmount(6000, min: 1000, max: 5000), isFalse);
    });
  });
}
