import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../authentication/presentation/providers/auth_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final user = authState.user;

    return Scaffold(
      appBar: AppBar(title: const Text('My Profile')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppDimensions.pagePadding),
        child: Column(
          children: [
            CircleAvatar(
              radius: 40,
              backgroundColor: AppColors.primaryContainer,
              child: Text(
                (user?.displayName ?? 'U')[0].toUpperCase(),
                style: const TextStyle(fontSize: 32, color: AppColors.primary, fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(height: 16),
            Text(user?.displayName ?? 'User', style: AppTypography.titleLarge),
            Text(user?.email ?? '', style: AppTypography.bodyMedium),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.surfaceLight,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Text(
                user?.virtualPaymentId ?? 'vpa@payflow',
                style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w600),
              ),
            ),
            const SizedBox(height: 32),
            ListTile(
              leading: const Icon(Icons.security_outlined),
              title: const Text('Transaction PIN'),
              subtitle: Text(user?.hasPinSet == true ? 'Configured' : 'Not configured'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {},
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.logout, color: AppColors.error),
              title: Text('Sign Out', style: TextStyle(color: AppColors.error)),
              onTap: () async {
                await ref.read(authProvider.notifier).logout();
                if (context.mounted) {
                  context.go('/login');
                }
              },
            ),
          ],
        ),
      ),
    );
  }
}
