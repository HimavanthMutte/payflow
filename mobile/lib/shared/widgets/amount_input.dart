import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_typography.dart';
import '../../core/utils/amount_formatter.dart';

class AmountInput extends StatefulWidget {
  final TextEditingController controller;
  final ValueChanged<int>? onAmountChanged;
  final String? errorText;
  final int maxPaise;

  const AmountInput({
    super.key,
    required this.controller,
    this.onAmountChanged,
    this.errorText,
    this.maxPaise = 10000000,
  });

  @override
  State<AmountInput> createState() => _AmountInputState();
}

class _AmountInputState extends State<AmountInput> {
  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.baseline,
          textBaseline: TextBaseline.alphabetic,
          children: [
            Text(
              '₹',
              style: AppTypography.amountDisplay.copyWith(
                color: AppColors.primary,
                fontSize: 36,
              ),
            ),
            const SizedBox(width: 4),
            IntrinsicWidth(
              child: TextField(
                controller: widget.controller,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                textAlign: TextAlign.center,
                style: AppTypography.amountDisplay.copyWith(
                  color: AppColors.textPrimary,
                ),
                decoration: InputDecoration(
                  hintText: '0',
                  hintStyle: AppTypography.amountDisplay.copyWith(
                    color: AppColors.textTertiary,
                  ),
                  border: InputBorder.none,
                  enabledBorder: InputBorder.none,
                  focusedBorder: InputBorder.none,
                  filled: false,
                  contentPadding: EdgeInsets.zero,
                ),
                inputFormatters: [
                  FilteringTextInputFormatter.allow(RegExp(r'^\d+\.?\d{0,2}')),
                ],
                onChanged: (val) {
                  final paise = AmountFormatter.parseRupees(val);
                  widget.onAmountChanged?.call(paise);
                },
              ),
            ),
          ],
        ),
        if (widget.errorText != null) ...[
          const SizedBox(height: 8),
          Text(
            widget.errorText!,
            style: AppTypography.bodySmall.copyWith(
              color: AppColors.error,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ],
    );
  }
}
