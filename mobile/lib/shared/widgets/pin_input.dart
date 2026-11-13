import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_typography.dart';

class PinInput extends StatefulWidget {
  final int length;
  final ValueChanged<String> onCompleted;
  final ValueChanged<String>? onChanged;

  const PinInput({
    super.key,
    this.length = 6,
    required this.onCompleted,
    this.onChanged,
  });

  @override
  State<PinInput> createState() => _PinInputState();
}

class _PinInputState extends State<PinInput> {
  late final List<TextEditingController> _controllers;
  late final List<FocusNode> _focusNodes;

  @override
  void initState() {
    super.initState();
    _controllers = List.generate(widget.length, (_) => TextEditingController());
    _focusNodes = List.generate(widget.length, (_) => FocusNode());
  }

  @override
  void dispose() {
    for (final c in _controllers) {
      c.dispose();
    }
    for (final f in _focusNodes) {
      f.dispose();
    }
    super.dispose();
  }

  String _getPin() {
    return _controllers.map((c) => c.text).join();
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(widget.length, (index) {
        return Container(
          width: 44,
          height: 52,
          margin: const EdgeInsets.symmetric(horizontal: 4),
          child: RawKeyboardListener(
            focusNode: FocusNode(),
            onKey: (event) {
              if (event is RawKeyDownEvent &&
                  event.logicalKey == LogicalKeyboardKey.backspace &&
                  _controllers[index].text.isEmpty &&
                  index > 0) {
                _focusNodes[index - 1].requestFocus();
              }
            },
            child: TextField(
              controller: _controllers[index],
              focusNode: _focusNodes[index],
              textAlign: TextAlign.center,
              keyboardType: TextInputType.number,
              obscureText: true,
              maxLength: 1,
              style: AppTypography.headlineMedium.copyWith(color: AppColors.primary),
              decoration: InputDecoration(
                counterText: '',
                contentPadding: EdgeInsets.zero,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: AppColors.border),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: AppColors.primary, width: 2),
                ),
              ),
              inputFormatters: [FilteringTextInputFormatter.digitsOnly],
              onChanged: (value) {
                if (value.isNotEmpty) {
                  if (index < widget.length - 1) {
                    _focusNodes[index + 1].requestFocus();
                  } else {
                    _focusNodes[index].unfocus();
                    final pin = _getPin();
                    if (pin.length == widget.length) {
                      widget.onCompleted(pin);
                    }
                  }
                }
                widget.onChanged?.call(_getPin());
              },
            ),
          ),
        );
      }),
    );
  }
}
