import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../shared/widgets/primary_button.dart';
import '../../../../shared/widgets/amount_input.dart';
import '../../../../core/utils/validators.dart';

class SendMoneyScreen extends StatefulWidget {
  const SendMoneyScreen({super.key});

  @override
  State<SendMoneyScreen> createState() => _SendMoneyScreenState();
}

class _SendMoneyScreenState extends State<SendMoneyScreen> {
  final _recipientController = TextEditingController();
  final _amountController = TextEditingController();
  final _noteController = TextEditingController();
  int _amountPaise = 0;

  @override
  void dispose() {
    _recipientController.dispose();
    _amountController.dispose();
    _noteController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Send Money')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppDimensions.pagePadding),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            TextFormField(
              controller: _recipientController,
              decoration: const InputDecoration(
                labelText: 'Recipient UPI ID or Phone',
                hintText: 'user@payflow or 9876543210',
                prefixIcon: Icon(Icons.alternate_email),
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'Enter Amount',
              textAlign: TextAlign.center,
              style: AppTypography.titleMedium,
            ),
            const SizedBox(height: 12),
            AmountInput(
              controller: _amountController,
              onAmountChanged: (paise) {
                setState(() {
                  _amountPaise = paise;
                });
              },
            ),
            const SizedBox(height: 24),
            TextFormField(
              controller: _noteController,
              decoration: const InputDecoration(
                labelText: 'Add a note (optional)',
                hintText: 'e.g. Dinner, rent',
                prefixIcon: Icon(Icons.note_alt_outlined),
              ),
            ),
            const SizedBox(height: 32),
            PrimaryButton(
              text: 'Continue to Pay',
              onPressed: _amountPaise > 0 && _recipientController.text.isNotEmpty
                  ? () {
                      // Trigger payment flow
                    }
                  : null,
            ),
          ],
        ),
      ),
    );
  }
}
