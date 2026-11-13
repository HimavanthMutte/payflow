import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/authentication/presentation/providers/auth_provider.dart';
import '../../features/authentication/presentation/screens/splash_screen.dart';
import '../../features/authentication/presentation/screens/login_screen.dart';
import '../../features/authentication/presentation/screens/register_screen.dart';
import '../../features/dashboard/presentation/screens/dashboard_screen.dart';
import '../../features/payments/presentation/screens/send_money_screen.dart';
import '../../features/payments/presentation/screens/receive_money_screen.dart';
import '../../features/qr/presentation/screens/qr_scan_screen.dart';
import '../../features/transactions/presentation/screens/transactions_screen.dart';
import '../../features/transactions/presentation/screens/transaction_detail_screen.dart';
import '../../features/profile/presentation/screens/profile_screen.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final authNotifier = ref.watch(authProvider.notifier);

  return GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(
        path: '/',
        name: 'splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/login',
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        name: 'register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/home',
        name: 'dashboard',
        builder: (context, state) => const DashboardScreen(),
      ),
      GoRoute(
        path: '/send',
        name: 'send',
        builder: (context, state) => const SendMoneyScreen(),
      ),
      GoRoute(
        path: '/receive',
        name: 'receive',
        builder: (context, state) => const ReceiveMoneyScreen(),
      ),
      GoRoute(
        path: '/scan',
        name: 'scan',
        builder: (context, state) => const QrScanScreen(),
      ),
      GoRoute(
        path: '/transactions',
        name: 'transactions',
        builder: (context, state) => const TransactionsScreen(),
        routes: [
          GoRoute(
            path: ':id',
            name: 'transaction_detail',
            builder: (context, state) {
              final id = state.pathParameters['id'] ?? '';
              return TransactionDetailScreen(id: id);
            },
          ),
        ],
      ),
      GoRoute(
        path: '/profile',
        name: 'profile',
        builder: (context, state) => const ProfileScreen(),
      ),
    ],
  );
});
