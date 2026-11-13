import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:payflow_mobile/features/authentication/presentation/screens/login_screen.dart';

void main() {
  testWidgets('LoginScreen displays title, input fields and sign-in button', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          home: LoginScreen(),
        ),
      ),
    );

    // Verify presence of title and labels
    expect(find.text('Welcome back'), findsOneWidget);
    expect(find.text('Sign in to access your PayFlow wallet'), findsOneWidget);
    expect(find.byType(TextFormField), findsNWidgets(2));
    expect(find.text('Sign In'), findsOneWidget);
    expect(find.text("Don't have an account? "), findsOneWidget);
  });

  testWidgets('LoginScreen shows validation errors when submitted empty', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          home: LoginScreen(),
        ),
      ),
    );

    final signInButton = find.widgetWithText(ElevatedButton, 'Sign In');
    await tester.tap(signInButton);
    await tester.pump();

    expect(find.text('Email is required'), findsOneWidget);
    expect(find.text('Password is required'), findsOneWidget);
  });
}
