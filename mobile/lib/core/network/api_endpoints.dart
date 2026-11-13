import '../constants/api_constants.dart';

class ApiEndpoints {
  ApiEndpoints._();

  static String get baseUrl => ApiConstants.baseUrl;
  static String get register => ApiConstants.register;
  static String get login => ApiConstants.login;
  static String get refresh => ApiConstants.refresh;
  static String get logout => ApiConstants.logout;
  static String get me => ApiConstants.me;
  static String get usersSearch => ApiConstants.usersSearch;
  static String get wallet => ApiConstants.wallet;
  static String get walletBalance => ApiConstants.walletBalance;
  static String get recipientsSearch => ApiConstants.recipientsSearch;
  static String get recentRecipients => ApiConstants.recentRecipients;
  static String get favouriteRecipients => ApiConstants.favouriteRecipients;
  static String get payments => ApiConstants.payments;
  static String get transactions => ApiConstants.transactions;
  static String transactionDetail(String id) => '${ApiConstants.transactions}/$id';
  static String get qrGenerate => ApiConstants.qrGenerate;
  static String get qrValidate => ApiConstants.qrValidate;
  static String get health => ApiConstants.health;
}
