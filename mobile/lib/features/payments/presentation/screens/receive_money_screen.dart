import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../authentication/presentation/providers/auth_provider.dart';

class ReceiveMoneyScreen extends ConsumerWidget {
  const ReceiveMoneyScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final user = authState.user;
    final vpa = user?.virtualPaymentId ?? 'user@payflow';
    final qrData = 'upi://pay?pa=$vpa&pn=${Uri.encodeComponent(user?.displayName ?? "User")}&cu=INR';

    return Scaffold(
      appBar: AppBar(title: const Text('Receive Money')),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppDimensions.pagePadding),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Card(
                elevation: 4,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    children: [
                      Text(
                        user?.displayName ?? 'User Name',
                        style: AppTypography.headlineMedium,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        vpa,
                        style: AppTypography.bodyMedium.copyWith(color: AppColors.primary),
                      ),
                      const SizedBox(height: 20),
                      QrImageView(
                        data: qrData,
                        version: QrVersions.auto,
                        size: 220.0,
                        backgroundColor: Colors.white,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Scan this QR using any UPI app to pay',
                        style: AppTypography.bodySmall,
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
