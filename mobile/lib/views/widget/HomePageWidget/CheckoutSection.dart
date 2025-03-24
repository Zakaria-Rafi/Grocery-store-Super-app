import 'package:flutter/material.dart';
import 'package:mobile/controllers/coupon_controller.dart';

class CheckoutSection extends StatefulWidget {
  final double totalPrice;
  final double? totalBeforeDiscount;
  final String? couponCode;
  final VoidCallback onPayAtKiosk;
  final VoidCallback onCheckout;
  final VoidCallback? onRefresh;
  final Function(String?)? onCouponChanged;

  const CheckoutSection({
    required this.totalPrice,
    this.totalBeforeDiscount,
    this.couponCode,
    required this.onPayAtKiosk,
    required this.onCheckout,
    this.onRefresh,
    this.onCouponChanged,
    super.key,
  });

  @override
  State<CheckoutSection> createState() => _CheckoutSectionState();
}

class _CheckoutSectionState extends State<CheckoutSection> {
  final _couponController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  final CouponController _couponService = CouponController();
  bool _isLoading = false;
  bool _showCouponInput = true;

  @override
  void initState() {
    super.initState();
    _showCouponInput = widget.couponCode == null;
    if (widget.couponCode != null) {
      _couponController.text = widget.couponCode!;
    }
  }

  @override
  void dispose() {
    _couponController.dispose();
    super.dispose();
  }

  Future<void> _applyCoupon() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);
    try {
      // Appliquer le coupon et récupérer les informations du panier mis à jour
      final cart = await _couponService.applyCoupon(_couponController.text);

      // Vérifier si le coupon a bien été appliqué
      if (cart.couponCode == null || cart.couponCode!.isEmpty) {
        throw Exception('Le coupon n\'a pas pu être appliqué');
      }

      setState(() => _showCouponInput = false);
      if (widget.onCouponChanged != null) {
        widget.onCouponChanged!(cart.couponCode);
      }
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Coupon appliqué avec succès'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString().replaceAll('Exception: ', '')),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _removeCoupon() async {
    setState(() => _isLoading = true);
    try {
      await _couponService.removeCoupon(_couponController.text);
      _couponController.clear();
      setState(() => _showCouponInput = true);
      if (widget.onCouponChanged != null) {
        widget.onCouponChanged!(null);
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Coupon retiré avec succès'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString()),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withAlpha(2),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Section de coupon
            if (_showCouponInput)
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _couponController,
                      decoration: const InputDecoration(
                        labelText: 'Code promo',
                        hintText: 'Entrez votre code promo',
                        border: OutlineInputBorder(),
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Veuillez entrer un code promo';
                        }
                        return null;
                      },
                      enabled: !_isLoading,
                    ),
                  ),
                  const SizedBox(width: 16),
                  ElevatedButton(
                    onPressed: _isLoading ? null : _applyCoupon,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: _isLoading
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor:
                                  AlwaysStoppedAnimation<Color>(Colors.white),
                            ),
                          )
                        : const Text('Appliquer'),
                  ),
                ],
              ),

            // Affichage du coupon si appliqué
            if (!_showCouponInput && widget.couponCode != null) ...[
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.local_offer,
                          color: Colors.orange, size: 20),
                      const SizedBox(width: 8),
                      Text(
                        "Coupon appliqué: ${widget.couponCode}",
                        style: const TextStyle(
                          color: Colors.orange,
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, size: 18, color: Colors.grey),
                    onPressed: _isLoading ? null : _removeCoupon,
                    tooltip: "Supprimer le coupon",
                  ),
                ],
              ),
              const SizedBox(height: 12),
            ],

            // Résumé des prix
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.grey[50],
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                children: [
                  // Prix avant réduction
                  if (widget.totalBeforeDiscount != null) ...[
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          "Sous-total",
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey,
                          ),
                        ),
                        Text(
                          "\$${widget.totalBeforeDiscount!.toStringAsFixed(2)}",
                          style: const TextStyle(
                            fontSize: 14,
                            color: Colors.grey,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          "Réduction",
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.green,
                          ),
                        ),
                        Text(
                          "-\$${(widget.totalBeforeDiscount! - widget.totalPrice).toStringAsFixed(2)}",
                          style: const TextStyle(
                            fontSize: 14,
                            color: Colors.green,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 8),
                      child: Divider(),
                    ),
                  ],

                  // Prix final
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        "Total",
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        "\$${widget.totalPrice.toStringAsFixed(2)}",
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.green,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Boutons de paiement
            Row(
              children: [
                Expanded(
                  flex: 3,
                  child: OutlinedButton.icon(
                    onPressed: widget.onPayAtKiosk,
                    icon: const Icon(Icons.qr_code, color: Colors.green),
                    label: const Text(
                      "Payer sur la borne",
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.green,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Colors.green),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  flex: 2,
                  child: ElevatedButton(
                    onPressed: widget.onCheckout,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 24.0,
                        vertical: 12.0,
                      ),
                      elevation: 4,
                    ),
                    child: const Text(
                      "Checkout",
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
