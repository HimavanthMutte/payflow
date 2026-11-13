class AmountFormatter {
  AmountFormatter._();

  /// Formats paise integer to Indian Rupee string, e.g. 100000 -> "₹1,000" or 123450 -> "₹1,234.50"
  static String formatRupees(int paise) {
    final isNegative = paise < 0;
    final absPaise = paise.abs();
    final rupees = absPaise ~/ 100;
    final paiseRemainder = absPaise % 100;

    final rupeesFormatted = _formatIndianNumber(rupees);
    final prefix = isNegative ? '-₹' : '₹';

    if (paiseRemainder == 0) {
      return '$prefix$rupeesFormatted';
    }
    return '$prefix$rupeesFormatted.${paiseRemainder.toString().padLeft(2, '0')}';
  }

  /// Formats raw paise as string
  static String formatPaise(int paise) => '$paise';

  /// Parses a rupee string (e.g. "₹1,500.50" or "1500") to integer paise
  static int parseRupees(String rupeesStr) {
    final cleaned = rupeesStr
        .replaceAll('₹', '')
        .replaceAll(',', '')
        .trim();
    if (cleaned.isEmpty) return 0;
    final double rupees = double.parse(cleaned);
    return (rupees * 100).round();
  }

  /// Validates if paise amount is within allowed transaction limits
  static bool isValidAmount(int paise, {int min = 100, int max = 10000000}) {
    return paise >= min && paise <= max;
  }

  /// Formats integer into Indian numbering format (e.g., 10,00,000)
  static String _formatIndianNumber(int n) {
    final s = n.toString();
    if (s.length <= 3) return s;

    final lastThree = s.substring(s.length - 3);
    final rest = s.substring(0, s.length - 3);

    final buffer = StringBuffer();
    for (int i = 0; i < rest.length; i++) {
      if (i > 0 && (rest.length - i) % 2 == 0) {
        buffer.write(',');
      }
      buffer.write(rest[i]);
    }
    buffer.write(',');
    buffer.write(lastThree);
    return buffer.toString();
  }
}
