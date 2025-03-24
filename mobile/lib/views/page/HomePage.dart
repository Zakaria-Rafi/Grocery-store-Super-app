import 'package:flutter/material.dart';
import 'package:mobile/controllers/cart_controller.dart';
import 'package:mobile/models/Cart.dart';
import 'package:mobile/models/CartProduct.dart';
import 'package:mobile/models/Category.dart';
import 'package:mobile/views/widget/auth_wrapper.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../widget/HomePageWidget/CategoryList.dart';
import '../widget/HomePageWidget/ProductList.dart';
import '../widget/HomePageWidget/SearchBar.dart' as custom_search_bar;
import '../widget/HomePageWidget/CheckoutSection.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'dart:convert';
import '../widget/HomePageWidget/PaymentMethodDialog.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  bool isLoading = true;
  final CartController cartController = CartController();
  Cart? cartOfUser;
  String qrData = '';
  String _searchQuery = '';

  Future<void> _getCartOfUser() async {
    try {
      cartOfUser = await cartController.getCartOfUser();
      setState(() {
        isLoading = false;
      });
    } catch (e) {
      // Afficher un message d'erreur à l'utilisateur
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Impossible de charger le panier: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  void initState() {
    super.initState();
    _getCartOfUser();
  }

  final Set<int> _selectedCategoryIds = {};

  void _toggleCategory(int categoryId) {
    setState(() {
      if (_selectedCategoryIds.contains(categoryId)) {
        _selectedCategoryIds.remove(categoryId);
      } else {
        _selectedCategoryIds.add(categoryId);
      }
    });
  }

  List<CartProduct> _getFilteredProducts() {
    if (cartOfUser == null ||
        cartOfUser?.products == null ||
        cartOfUser!.products!.isEmpty) {
      return [];
    }

    if (_selectedCategoryIds.isEmpty) {
      return cartOfUser!.products!;
    }

    return cartOfUser!.products!
        .where((product) =>
            product.product.categories.isNotEmpty &&
            _selectedCategoryIds.contains(product.product.categories.first.id))
        .toList();
  }

  void _addProductQuantity(int productId) {
    CartProduct product = cartOfUser!.products!
        .firstWhere((product) => product.product.id == productId);

    if (product.quantity < product.product.stock) {
      setState(() {
        product.quantity++;
      });

      // Mettre à jour le panier via le contrôleur
      cartController.updateItemQuantity(productId, product.quantity).then((_) {
        // Rafraîchir le panier pour obtenir les nouveaux totaux
        _getCartOfUser();
      });
    }
  }

  void _subtractProductQuantity(int productId) {
    CartProduct product = cartOfUser!.products!
        .firstWhere((product) => product.product.id == productId);

    if (product.quantity > 1) {
      setState(() {
        product.quantity--;
      });

      // Mettre à jour le panier via le contrôleur
      cartController.updateItemQuantity(productId, product.quantity).then((_) {
        // Rafraîchir le panier pour obtenir les nouveaux totaux
        _getCartOfUser();
      });
    }
  }

  void _removeProduct(int productId) {
    setState(() {
      cartOfUser!.products!
          .removeWhere((product) => product.product.id == productId);
    });
    // Rafraîchir le panier après un délai pour obtenir les nouveaux totaux
    Future.delayed(const Duration(milliseconds: 600), () {
      _getCartOfUser();
    });
  }

  void _showQRCodeDialog() async {
    if (!mounted) return;

    final paymentData = await _generatePaymentData();
    if (!mounted) return;

    setState(() {
      qrData = paymentData;
    });

    showDialog(
      context: context,
      builder: (BuildContext context) {
        return Dialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
          child: Container(
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  'Présentez le QR code à la borne',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 20),
                Container(
                  padding: const EdgeInsets.all(15),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(15),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.grey.withAlpha(20),
                        spreadRadius: 2,
                        blurRadius: 5,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: QrImageView(
                    data: qrData,
                    version: QrVersions.auto,
                    size: 200.0,
                  ),
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 30,
                      vertical: 12,
                    ),
                  ),
                  onPressed: () => Navigator.of(context).pop(),
                  child: const Text(
                    'Fermer',
                    style: TextStyle(fontSize: 16),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Future<String> _generatePaymentData() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token');
    Map<String, dynamic> paymentData = {
      'cartId': cartOfUser!.id,
      'token': token,
    };
    return jsonEncode(paymentData);
  }

  void _resetCart() {
    setState(() {
      cartController.clearCart();
      cartOfUser?.products?.clear();
    });
  }

  void _handleStripePayment() async {
    // Implémenter la logique de paiement Stripe ici
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text("Paiement avec Stripe en cours...")),
    );
  }

  void _handlePayPalPayment() async {
    // Implémenter la logique de paiement PayPal ici
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text("Paiement avec PayPal en cours...")),
    );
  }

  void _showPaymentMethodDialog() {
    if (!mounted) return;
    showDialog(
      context: context,
      builder: (BuildContext dialogContext) {
        return PaymentMethodDialog(
          onStripePayment: _handleStripePayment,
          onPayPalPayment: _handlePayPalPayment,
          context: dialogContext,
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return AuthWrapper(
        child: Scaffold(
          body: SafeArea(
            child: Column(
              children: [
                Expanded(
                  child: SingleChildScrollView(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Search bar skeleton
                        Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Container(
                            height: 50,
                            decoration: BoxDecoration(
                              color: Colors.grey[300],
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                        ),
                        // Category list skeleton
                        SingleChildScrollView(
                          scrollDirection: Axis.horizontal,
                          child: Row(
                            children: List.generate(
                              4,
                              (index) => Padding(
                                padding: const EdgeInsets.all(8.0),
                                child: Container(
                                  width: 100,
                                  height: 40,
                                  decoration: BoxDecoration(
                                    color: Colors.grey[300],
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                        // Product list skeleton
                        ...List.generate(
                          3,
                          (index) => Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Container(
                              height: 100,
                              decoration: BoxDecoration(
                                color: Colors.grey[300],
                                borderRadius: BorderRadius.circular(8),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                // Checkout section skeleton
                Container(
                  height: 80,
                  decoration: BoxDecoration(
                    color: Colors.grey[300],
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(16),
                      topRight: Radius.circular(16),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final hasProducts = cartOfUser != null &&
        cartOfUser!.products != null &&
        cartOfUser!.products!.isNotEmpty;

    return AuthWrapper(
      child: Scaffold(
        body: SafeArea(
          child: Column(
            children: [
              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: custom_search_bar.SearchBar(
                              onSearch: (query) {
                                // Implement your search functionality here
                                // For example, filter the products based on the query
                                setState(() {
                                  // You could store the search query in a state variable
                                  // and use it to filter products in _getFilteredProducts()
                                  _searchQuery = query;
                                });
                              },
                            ),
                          ),
                          if (hasProducts)
                            IconButton(
                              icon: const Icon(Icons.delete_outline),
                              onPressed: () {
                                showDialog(
                                  context: context,
                                  builder: (BuildContext context) {
                                    return AlertDialog(
                                      title:
                                          const Text('Réinitialiser le panier'),
                                      content: const Text(
                                          'Êtes-vous sûr de vouloir vider votre panier ?'),
                                      actions: [
                                        TextButton(
                                          onPressed: () =>
                                              Navigator.of(context).pop(),
                                          child: const Text('Annuler'),
                                        ),
                                        TextButton(
                                          onPressed: () {
                                            _resetCart();
                                            Navigator.of(context).pop();
                                          },
                                          child: const Text('Confirmer'),
                                        ),
                                      ],
                                    );
                                  },
                                );
                              },
                            ),
                        ],
                      ),
                      if (hasProducts) ...[
                        CategoryList(
                          categories: cartOfUser!.products!
                              .where((product) =>
                                  product.product.categories.isNotEmpty)
                              .map(
                                  (product) => product.product.categories.first)
                              .toList()
                              .fold<List<Category>>(
                            [],
                            (unique, category) =>
                                unique.any((c) => c.id == category.id)
                                    ? unique
                                    : [...unique, category],
                          ),
                          selectedCategoryIds: _selectedCategoryIds,
                          onCategorySelected: _toggleCategory,
                        ),
                        ProductList(
                          products: _getFilteredProducts(),
                          onRemove: _removeProduct,
                          onAdd: _addProductQuantity,
                          onSubtract: _subtractProductQuantity,
                          searchQuery: _searchQuery,
                        ),
                      ] else ...[
                        const Center(
                          child: Padding(
                            padding: EdgeInsets.all(16.0),
                            child: Text('Votre panier est vide'),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
              CheckoutSection(
                totalPrice: cartOfUser?.totalPrice ?? 0.0,
                totalBeforeDiscount: cartOfUser?.totalBeforeDiscount,
                couponCode: cartOfUser?.couponCode,
                onPayAtKiosk: () {
                  _showQRCodeDialog();
                },
                onCheckout: () {
                  _showPaymentMethodDialog();
                },
                onRefresh: () {
                  _getCartOfUser();
                },
                onCouponChanged: (couponCode) {
                  _getCartOfUser();
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
