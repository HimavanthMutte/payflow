class Validators {
  Validators._();

  static final RegExp _emailRegExp = RegExp(
    r'^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$',
  );

  static final RegExp _phoneRegExp = RegExp(r'^[6-9]\d{9}$');

  static final RegExp _vpaRegExp = RegExp(r'^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$');

  static String? validateEmail(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Email is required';
    }
    if (!_emailRegExp.hasMatch(value.trim())) {
      return 'Enter a valid email address';
    }
    return null;
  }

  static String? validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Password is required';
    }
    if (value.length < 8) {
      return 'Password must be at least 8 characters';
    }
    return null;
  }

  static String? validateName(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Name is required';
    }
    if (value.trim().length < 2) {
      return 'Name must be at least 2 characters';
    }
    return null;
  }

  static String? validatePhone(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Phone number is required';
    }
    final cleaned = value.replaceAll(RegExp(r'\D'), '');
    if (!_phoneRegExp.hasMatch(cleaned)) {
      return 'Enter a valid 10-digit mobile number';
    }
    return null;
  }

  static String? validateVpa(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'UPI ID is required';
    }
    if (!_vpaRegExp.hasMatch(value.trim())) {
      return 'Enter a valid UPI ID (e.g. name@payflow)';
    }
    return null;
  }

  static String? validatePin(String? value) {
    if (value == null || value.length != 6) {
      return 'PIN must be 6 digits';
    }
    if (!RegExp(r'^\d{6}$').hasMatch(value)) {
      return 'PIN must only contain digits';
    }
    return null;
  }

  static String? validateAmount(String? value, {int minPaise = 100, int maxPaise = 10000000}) {
    if (value == null || value.trim().isEmpty) {
      return 'Amount is required';
    }
    final cleaned = value.replaceAll('₹', '').replaceAll(',', '').trim();
    final double? parsed = double.tryParse(cleaned);
    if (parsed == null || parsed <= 0) {
      return 'Enter a valid amount';
    }
    final paise = (parsed * 100).round();
    if (paise < minPaise) {
      return 'Minimum amount is ₹${minPaise / 100}';
    }
    if (paise > maxPaise) {
      return 'Maximum amount is ₹${maxPaise / 100}';
    }
    return null;
  }
}
