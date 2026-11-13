import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_typography.dart';
import '../../core/constants/app_dimensions.dart';
import '../../core/utils/amount_formatter.dart';

class BalanceCard extends StatefulWidget {
  final int balancePaise;
  final String vpa;
  final VoidCallback? onAddMoney;
  final VoidCallback? onHistory;

  const BalanceCard({
    super.key,
    required this.balancePaise,
    required this.vpa,
    this.onAddMoney,
    this.onHistory,
  });

  @override
  State<BalanceCard> createState() => _BalanceCardState();
}

class _BalanceCardState extends State<BalanceCard> {
  bool _isBalanceVisible = true;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppDimensions.cardPadding + 4),
      decoration: BoxDecoration(
        gradient: AppColors.balanceGradient,
        borderRadius: BorderRadius.circular(AppDimensions.cardRadius),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withOpacity(0.35),
            blurRadius: 16,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Wallet Balance',
                style: AppTypography.bodyMedium.copyWith(
                  color: Colors.white70,
                  fontWeight: FontWeight.w500,
                ),
              ),
              IconButton(
                icon: Icon(
                  _isBalanceVisible
                      ? Icons.visibility_outlined
                      : Icons.visibility_off_outlined,
                  color: Colors.white70,
                  size: 20,
                ),
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
                onPressed: () {
                  setState(() {
                    _isBalanceVisible = !_isBalanceVisible;
                  });
                },
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            _isBalanceVisible
                ? AmountFormatter.formatRupees(widget.balancePaise)
                : '••••••',
            style: AppTypography.amountLarge.copyWith(
              color: Colors.white,
              fontSize: 32,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(
                    Icons.alternate_email,
                    color: Colors.white60,
                    size: 16,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    widget.vpa,
                    style: AppTypography.bodySmall.copyWith(
                      color: Colors.white70,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.18),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Text(
                  'SIMULATION ONLY',
                  style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 9,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
