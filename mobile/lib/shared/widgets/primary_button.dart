import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_dimensions.dart';
import '../../core/constants/app_typography.dart';

class PrimaryButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final bool isLoading;
  final bool isFullWidth;
  final Widget? icon;
  final Color? backgroundColor;
  final Gradient? gradient;

  const PrimaryButton({
    super.key,
    required this.text,
    this.onPressed,
    this.isLoading = false,
    this.isFullWidth = true,
    this.icon,
    this.backgroundColor,
    this.gradient,
  });

  @override
  Widget build(BuildContext context) {
    final effectiveGradient = gradient ?? AppColors.primaryGradient;
    final isEnabled = onPressed != null && !isLoading;

    final buttonChild = Row(
      mainAxisAlignment: MainAxisAlignment.center,
      mainAxisSize: isFullWidth ? MainAxisSize.max : MainAxisSize.min,
      children: [
        if (isLoading)
          const SizedBox(
            width: 22,
            height: 22,
            child: CircularProgressIndicator(
              strokeWidth: 2.5,
              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
            ),
          )
        else ...[
          if (icon != null) ...[
            icon!,
            const SizedBox(width: 8),
          ],
          Text(
            text,
            style: AppTypography.labelLarge.copyWith(
              color: Colors.white,
              fontSize: 16,
            ),
          ),
        ],
      ],
    );

    return Container(
      width: isFullWidth ? double.infinity : null,
      height: AppDimensions.buttonHeight,
      decoration: BoxDecoration(
        gradient: isEnabled ? effectiveGradient : null,
        color: !isEnabled ? AppColors.border : null,
        borderRadius: BorderRadius.circular(AppDimensions.buttonRadius),
        boxShadow: isEnabled
            ? [
                BoxShadow(
                  color: AppColors.primary.withOpacity(0.25),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ]
            : null,
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(AppDimensions.buttonRadius),
          onTap: isEnabled ? onPressed : null,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Center(child: buttonChild),
          ),
        ),
      ),
    );
  }
}
