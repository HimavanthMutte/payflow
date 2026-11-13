import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:payflow_mobile/shared/widgets/balance_card.dart';

void main() {
  testWidgets('BalanceCard displays balance and VPA accurately', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: BalanceCard(
            balancePaise: 250050, // ₹2,500.50
            vpa: 'testuser@payflow',
          ),
        ),
      ),
    );

    expect(find.text('Wallet Balance'), findsOneWidget);
    expect(find.text('₹2,500.50'), findsOneWidget);
    expect(find.text('testuser@payflow'), findsOneWidget);
    expect(find.text('SIMULATION ONLY'), findsOneWidget);
  });

  testWidgets('BalanceCard toggles balance visibility when eye icon pressed', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: BalanceCard(
            balancePaise: 500000,
            vpa: 'user@payflow',
          ),
        ),
      ),
    );

    // Initial visible balance
    expect(find.text('₹5,000'), findsOneWidget);

    // Tap toggle button
    final toggleButton = find.byType(IconButton);
    await tester.tap(toggleButton);
    await tester.pump();

    // Obscured balance
    expect(find.text('••••••'), findsOneWidget);
    expect(find.text('₹5,000'), findsNothing);
  });
}
