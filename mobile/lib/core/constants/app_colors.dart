import 'package:flutter/material.dart';

/// PayFlow Design System Colors
/// Deep navy + indigo foundation with emerald green for success
class AppColors {
  AppColors._();

  // === PRIMARY BRAND ===
  static const Color primary = Color(0xFF1E3A8A);        // Deep Navy Blue
  static const Color primaryLight = Color(0xFF3B5AC5);   // Indigo
  static const Color primaryDark = Color(0xFF0F1F5C);    // Darker Navy
  static const Color primaryContainer = Color(0xFFE8ECFB);

  // === SECONDARY ===
  static const Color secondary = Color(0xFF4F46E5);       // Indigo
  static const Color secondaryLight = Color(0xFF818CF8);  // Light Indigo
  static const Color secondaryContainer = Color(0xFFEEF2FF);

  // === SUCCESS ===
  static const Color success = Color(0xFF059669);         // Emerald Green
  static const Color successLight = Color(0xFF34D399);
  static const Color successContainer = Color(0xFFD1FAE5);

  // === ERROR/FAILURE ===
  static const Color error = Color(0xFFDC2626);           // Red
  static const Color errorLight = Color(0xFFF87171);
  static const Color errorContainer = Color(0xFFFEE2E2);

  // === WARNING/PENDING ===
  static const Color warning = Color(0xFFD97706);         // Amber
  static const Color warningLight = Color(0xFFFBBF24);
  static const Color warningContainer = Color(0xFFFEF3C7);

  // === NEUTRAL ===
  static const Color surfaceWhite = Color(0xFFFFFFFF);
  static const Color surfaceGrey = Color(0xFFF8FAFC);
  static const Color surfaceLight = Color(0xFFF1F5F9);
  static const Color divider = Color(0xFFE2E8F0);
  static const Color border = Color(0xFFCBD5E1);

  // === TEXT ===
  static const Color textPrimary = Color(0xFF0F172A);     // Slate 900
  static const Color textSecondary = Color(0xFF475569);   // Slate 600
  static const Color textTertiary = Color(0xFF94A3B8);    // Slate 400
  static const Color textOnPrimary = Color(0xFFFFFFFF);

  // === DARK THEME ===
  static const Color darkBackground = Color(0xFF0F172A);  // Dark Navy
  static const Color darkSurface = Color(0xFF1E293B);     // Dark Slate
  static const Color darkCard = Color(0xFF1E293B);
  static const Color darkBorder = Color(0xFF334155);
  static const Color darkTextPrimary = Color(0xFFF8FAFC);
  static const Color darkTextSecondary = Color(0xFF94A3B8);

  // === GRADIENTS ===
  static const LinearGradient primaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [primary, primaryLight],
  );

  static const LinearGradient balanceGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF1E3A8A), Color(0xFF4F46E5)],
  );

  static const LinearGradient successGradient = LinearGradient(
    colors: [Color(0xFF059669), Color(0xFF10B981)],
  );
}
