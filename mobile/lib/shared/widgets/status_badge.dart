import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_typography.dart';

enum PaymentStatus { pending, processing, success, failed, reversed }

class StatusBadge extends StatelessWidget {
  final String status;

  const StatusBadge({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color text;
    String label = status.toUpperCase();

    switch (status.toUpperCase()) {
      case 'SUCCESS':
      case 'COMPLETED':
        bg = AppColors.successContainer;
        text = AppColors.success;
        label = 'SUCCESS';
        break;
      case 'PENDING':
      case 'PROCESSING':
        bg = AppColors.warningContainer;
        text = AppColors.warning;
        label = 'PENDING';
        break;
      case 'FAILED':
        bg = AppColors.errorContainer;
        text = AppColors.error;
        label = 'FAILED';
        break;
      case 'REVERSED':
      case 'REFUNDED':
        bg = AppColors.surfaceLight;
        text = AppColors.textSecondary;
        label = 'REVERSED';
        break;
      default:
        bg = AppColors.surfaceLight;
        text = AppColors.textSecondary;
        label = status.toUpperCase();
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Text(
        label,
        style: AppTypography.bodySmall.copyWith(
          color: text,
          fontWeight: FontWeight.w700,
          fontSize: 11,
          letterSpacing: 0.4,
        ),
      ),
    );
  }
}
