import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_typography.dart';
import '../../core/utils/amount_formatter.dart';
import '../../core/utils/date_formatter.dart';
import 'status_badge.dart';

class TransactionListItem extends StatelessWidget {
  final String id;
  final String title;
  final String? subtitle;
  final int amountPaise;
  final bool isDebit;
  final String status;
  final DateTime timestamp;
  final VoidCallback? onTap;

  const TransactionListItem({
    super.key,
    required this.id,
    required this.title,
    this.subtitle,
    required this.amountPaise,
    required this.isDebit,
    required this.status,
    required this.timestamp,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final amountColor = isDebit ? AppColors.textPrimary : AppColors.success;
    final prefix = isDebit ? '-' : '+';

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        child: Row(
          children: [
            // Icon
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: isDebit
                    ? AppColors.primaryContainer
                    : AppColors.successContainer,
                shape: BoxShape.circle,
              ),
              child: Icon(
                isDebit ? Icons.arrow_upward_rounded : Icons.arrow_downward_rounded,
                color: isDebit ? AppColors.primary : AppColors.success,
                size: 22,
              ),
            ),
            const SizedBox(width: 14),

            // Details
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AppTypography.titleMedium.copyWith(
                      fontWeight: FontWeight.w600,
                      fontSize: 15,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    subtitle ?? DateFormatter.formatRelative(timestamp),
                    style: AppTypography.bodySmall,
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),

            // Amount & status
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  '$prefix${AmountFormatter.formatRupees(amountPaise)}',
                  style: AppTypography.titleMedium.copyWith(
                    fontWeight: FontWeight.w700,
                    color: amountColor,
                  ),
                ),
                const SizedBox(height: 4),
                StatusBadge(status: status),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
