import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../shared/widgets/status_badge.dart';

class TransactionDetailScreen extends StatelessWidget {
  final String id;

  const TransactionDetailScreen({super.key, required this.id});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Transaction Details')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppDimensions.pagePadding),
        child: Column(
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  children: [
                    const Icon(Icons.check_circle_outline, color: AppColors.success, size: 56),
                    const SizedBox(height: 12),
                    Text('Payment Successful', style: AppTypography.headlineMedium),
                    const SizedBox(height: 4),
                    Text('Transaction ID: $id', style: AppTypography.bodySmall),
                    const SizedBox(height: 16),
                    const StatusBadge(status: 'SUCCESS'),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
