import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../shared/widgets/balance_card.dart';
import '../../authentication/presentation/providers/auth_provider.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final user = authState.user;

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            CircleAvatar(
              radius: 18,
              backgroundColor: AppColors.primaryContainer,
              child: Text(
                (user?.displayName ?? 'U')[0].toUpperCase(),
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  color: AppColors.primary,
                ),
              ),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Hello, ${user?.displayName ?? "User"}',
                  style: AppTypography.titleMedium,
                ),
                Text(
                  user?.virtualPaymentId ?? '',
                  style: AppTypography.bodySmall,
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.qr_code_scanner),
            onPressed: () => context.push('/scan'),
          ),
          IconButton(
            icon: const Icon(Icons.person_outline),
            onPressed: () => context.push('/profile'),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppDimensions.pagePadding),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            BalanceCard(
              balancePaise: 500000, // ₹5,000 demo initial simulation balance
              vpa: user?.virtualPaymentId ?? 'user@payflow',
            ),
            const SizedBox(height: 24),

            // Quick actions
            Text('Quick Actions', style: AppTypography.titleLarge),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildActionItem(
                  context,
                  icon: Icons.send_rounded,
                  label: 'Send',
                  onTap: () => context.push('/send'),
                ),
                _buildActionItem(
                  context,
                  icon: Icons.call_received_rounded,
                  label: 'Receive',
                  onTap: () => context.push('/receive'),
                ),
                _buildActionItem(
                  context,
                  icon: Icons.qr_code_rounded,
                  label: 'Scan QR',
                  onTap: () => context.push('/scan'),
                ),
                _buildActionItem(
                  context,
                  icon: Icons.history_rounded,
                  label: 'History',
                  onTap: () => context.push('/transactions'),
                ),
              ],
            ),
            const SizedBox(height: 28),

            // Recent Transactions header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Recent Activity', style: AppTypography.titleLarge),
                TextButton(
                  onPressed: () => context.push('/transactions'),
                  child: const Text('View All'),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Center(
                  child: Text(
                    'No recent transactions. Send money to get started!',
                    style: AppTypography.bodyMedium,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionItem(
    BuildContext context, {
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Column(
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: AppColors.primaryContainer,
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: AppColors.primary, size: 26),
          ),
          const SizedBox(height: 8),
          Text(label, style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
