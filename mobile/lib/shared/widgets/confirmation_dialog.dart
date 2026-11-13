import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_typography.dart';
import '../../core/constants/app_dimensions.dart';
import '../../core/utils/amount_formatter.dart';

class ConfirmationDialog extends StatelessWidget {
  final String title;
  final String recipientName;
  final String recipientVpa;
  final int amountPaise;
  final String? note;
  final VoidCallback onConfirm;
  final VoidCallback onCancel;

  const ConfirmationDialog({
    super.key,
    this.title = 'Confirm Payment',
    required this.recipientName,
    required this.recipientVpa,
    required this.amountPaise,
    this.note,
    required this.onConfirm,
    required this.onCancel,
  });

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
      ),
      contentPadding: const EdgeInsets.all(24),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            title,
            textAlign: TextAlign.center,
            style: AppTypography.headlineMedium,
          ),
          const SizedBox(height: 20),
          Text(
            AmountFormatter.formatRupees(amountPaise),
            textAlign: TextAlign.center,
            style: AppTypography.amountLarge.copyWith(
              color: AppColors.primary,
            ),
          ),
          const SizedBox(height: 16),
          const Divider(),
          const SizedBox(height: 12),
          _buildRow('Paying to', recipientName),
          const SizedBox(height: 8),
          _buildRow('UPI ID', recipientVpa),
          if (note != null && note!.isNotEmpty) ...[
            const SizedBox(height: 8),
            _buildRow('Note', note!),
          ],
          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: onCancel,
                  child: const Text('Cancel'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: onConfirm,
                  child: const Text('Pay Now'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: AppTypography.bodySmall),
        Text(
          value,
          style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w600),
        ),
      ],
    );
  }
}
