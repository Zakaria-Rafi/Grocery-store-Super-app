import 'package:flutter/material.dart';
import 'package:mobile/views/widget/ScanBottomSheet.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:mobile/views/widget/auth_wrapper.dart';

class ScanPage extends StatelessWidget {
  final MobileScannerController _controller =
      MobileScannerController(facing: CameraFacing.back);

  ScanPage({super.key});

  void _onDetect(BuildContext context, BarcodeCapture capture) {
    final List<Barcode> barcodes = capture.barcodes;
    for (final barcode in barcodes) {
      if (barcode.rawValue != null) {
        _controller.stop();
        showModalBottomSheet(
          context: context,
          builder: (BuildContext context) {
            return FractionallySizedBox(
                heightFactor: 1.5,
                child: SizedBox(
                    height: MediaQuery.of(context).size.height,
                    child: ScanBottomSheet(codebar: barcode.rawValue!)));
          },
        ).whenComplete(() => _controller.start());

        break;
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return AuthWrapper(
      child: Column(
        children: [
          Expanded(
            child: MobileScanner(
              controller: _controller,
              onDetect: (capture) => _onDetect(context, capture),
            ),
          ),
        ],
      ),
    );
  }
}
