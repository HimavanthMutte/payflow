class ApiConstants {
  ApiConstants._();

  static const String baseUrl = 'http://10.0.2.2:3000/api/v1'; // Android emulator localhost
  static const String devBaseUrl = 'http://localhost:3000/api/v1';

  // Auth
  static const String register = '/auth/register';
  static const String login = '/auth/login';
  static const String refresh = '/auth/refresh';
  static const String logout = '/auth/logout';

  // Users
  static const String me = '/users/me';
  static const String usersSearch = '/users/search';

  // Wallet
  static const String wallet = '/wallet';
  static const String walletBalance = '/wallet/balance';

  // Recipients
  static const String recipientsSearch = '/recipients/search';
  static const String recentRecipients = '/recipients/recent';
  static const String favouriteRecipients = '/recipients/favourites';

  // Payments
  static const String payments = '/payments';

  // Transactions
  static const String transactions = '/transactions';

  // QR
  static const String qrGenerate = '/qr/generate';
  static const String qrValidate = '/qr/validate';

  // Health
  static const String health = '/health';
}
