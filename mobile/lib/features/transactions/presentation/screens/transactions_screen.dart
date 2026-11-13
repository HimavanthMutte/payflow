import 'package:flutter/material.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../shared/widgets/empty_state.dart';

class TransactionsScreen extends StatelessWidget {
  const TransactionsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Transaction History')),
      body: const Padding(
        padding: EdgeInsets.all(AppDimensions.pagePadding),
        child: EmptyState(
          icon: Icons.receipt_long_outlined,
          title: 'No transactions yet',
          message: 'All your simulated UPI payments and receipts will appear here.',
        ),
      ),
    );
  }
}
