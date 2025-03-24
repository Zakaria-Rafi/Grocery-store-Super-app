import 'package:flutter/material.dart';
import 'package:mobile/controllers/cart_controller.dart';
import 'package:mobile/models/CartProduct.dart';
import 'package:go_router/go_router.dart';
import 'dart:async';

class ProductList extends StatefulWidget {
  final List<CartProduct> products;
  final Function(int) onRemove;
  final Function(int) onAdd;
  final Function(int) onSubtract;
  final String searchQuery; // Add search query parameter

  const ProductList(
      {required this.products,
      required this.onRemove,
      required this.onAdd,
      required this.onSubtract,
      this.searchQuery = '', // Default to empty string

      super.key});

  @override
  State<ProductList> createState() => _ProductListState();
}

class _ProductListState extends State<ProductList> {
  final CartController cartController = CartController();
  bool isDismissing = false;
  final Map<int, Timer> _debounceTimers = {};

  void _debounceCartUpdate(int productId, int newQuantity) {
    if (_debounceTimers[productId]?.isActive ?? false) {
      _debounceTimers[productId]!.cancel();
    }
    _debounceTimers[productId] = Timer(const Duration(milliseconds: 500), () {
      cartController.updateItemQuantity(productId, newQuantity);
      _debounceTimers.remove(productId);
    });
  }

  @override
  void dispose() {
    for (var timer in _debounceTimers.values) {
      timer.cancel();
    }
    _debounceTimers.clear();
    super.dispose();
  }

  String _normalizeString(String str) {
    final Map<String, String> accentsMap = {
      'é': 'e',
      'è': 'e',
      'ê': 'e',
      'ë': 'e',
      'à': 'a',
      'â': 'a',
      'ä': 'a',
      'î': 'i',
      'ï': 'i',
      'ô': 'o',
      'ö': 'o',
      'ù': 'u',
      'û': 'u',
      'ü': 'u',
      'ç': 'c',
      'É': 'E',
      'È': 'E',
      'Ê': 'E',
      'Ë': 'E',
      'À': 'A',
      'Â': 'A',
      'Ä': 'A',
      'Î': 'I',
      'Ï': 'I',
      'Ô': 'O',
      'Ö': 'O',
      'Ù': 'U',
      'Û': 'U',
      'Ü': 'U',
      'Ç': 'C',
    };

    String result = str;
    accentsMap.forEach((key, value) {
      result = result.replaceAll(key, value);
    });

    return result.toLowerCase();
  }

  // Filter products based on search query
  List<CartProduct> _getFilteredProducts() {
    if (widget.searchQuery.isEmpty) {
      return widget.products;
    }

    final normalizedQuery = _normalizeString(widget.searchQuery);

    return widget.products.where((product) {
      final normalizedName = _normalizeString(product.product.name);
      return normalizedName.contains(normalizedQuery);
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final filteredProducts = _getFilteredProducts();

    if (filteredProducts.isEmpty) {
      return widget.searchQuery.isNotEmpty
          ? const Center(
              child: Text('Aucun produit ne correspond à votre recherche'),
            )
          : const Center(
              child: Text('Aucun produit dans le panier'),
            );
    }

    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: filteredProducts.length, // Use filteredProducts.length instead
      itemBuilder: (context, index) {
        final product =
            filteredProducts[index]; // Use filteredProducts[index] instead
        return Dismissible(
          key: ValueKey(product.product.id),
          direction: DismissDirection.endToStart,
          background: Container(
            alignment: Alignment.centerRight,
            padding: const EdgeInsets.symmetric(horizontal: 20),
            decoration: BoxDecoration(
              shape: BoxShape.rectangle,
              gradient: LinearGradient(
                colors: [Colors.red.shade200, Colors.red.shade400],
                begin: Alignment.centerLeft,
                end: Alignment.centerRight,
              ),
              borderRadius: BorderRadius.circular(8),
            ),
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.delete, color: Colors.white),
                  ],
                ),
                SizedBox(width: 20),
              ],
            ),
          ),
          confirmDismiss: (direction) async {
            if (isDismissing) return false;
            setState(() => isDismissing = true);

            final result = await showDialog(
              context: context,
              builder: (BuildContext context) {
                return AlertDialog(
                  title: const Text('Confirmation'),
                  content: const Text(
                      'Voulez-vous vraiment supprimer cet article ?'),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.of(context).pop(false),
                      child: const Text('Annuler'),
                    ),
                    TextButton(
                      onPressed: () async {
                        final navigator = Navigator.of(context);
                        await cartController
                            .removeItemFromCart(product.product.id);
                        if (mounted) {
                          navigator.pop(true);
                        }
                      },
                      child: const Text('Supprimer'),
                    ),
                  ],
                );
              },
            );

            setState(() => isDismissing = false);
            return result;
          },
          onDismissed: (direction) => widget.onRemove(product.product.id),
          child: Card(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 1),
            child: InkWell(
              onTap: () {
                context.pushNamed('product-details', extra: product.product);
              },
              child: Padding(
                padding: const EdgeInsets.all(10.0),
                child: Row(
                  children: [
                    Image.network(
                      product.product.imagesUrl[0],
                      width: 60,
                      height: 60,
                      fit: BoxFit.cover,
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (product.priceBeforeDiscount != null)
                            Text(
                              "\$${(product.product.price).toStringAsFixed(2)} x ${product.quantity}",
                              style: const TextStyle(
                                fontSize: 12,
                                color: Colors.grey,
                                decoration: TextDecoration.lineThrough,
                              ),
                            ),
                          Text(
                            product.discountAmount != null
                                ? "\$${(product.totalPrice / product.quantity).toStringAsFixed(2)} x ${product.quantity}"
                                : "\$${product.product.price.toStringAsFixed(2)} x ${product.quantity}",
                            style: const TextStyle(
                              fontSize: 14,
                              color: Colors.green,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          if (product.appliedCouponCode != null)
                            Text(
                              "Coupon appliqué: ${product.appliedCouponCode}",
                              style: const TextStyle(
                                fontSize: 12,
                                color: Colors.orange,
                              ),
                            ),
                          Text(
                            product.product.name,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            "${product.product.weight}g",
                            style: const TextStyle(color: Colors.grey),
                          ),
                        ],
                      ),
                    ),
                    Column(
                      children: [
                        IconButton(
                          onPressed: product.quantity >= product.product.stock
                              ? null
                              : () {
                                  _debounceCartUpdate(
                                      product.product.id, product.quantity + 1);
                                  widget.onAdd(product.product.id);
                                },
                          icon: Icon(
                            Icons.add,
                            color: product.quantity >= product.product.stock
                                ? Colors.grey
                                : Colors.green,
                          ),
                        ),
                        Text(
                          product.quantity.toString(),
                          style: const TextStyle(fontSize: 16),
                        ),
                        IconButton(
                          onPressed: product.quantity <= 1
                              ? null
                              : () {
                                  _debounceCartUpdate(
                                      product.product.id, product.quantity - 1);
                                  widget.onSubtract(product.product.id);
                                },
                          icon: Icon(
                            Icons.remove,
                            color: product.quantity <= 1
                                ? Colors.grey
                                : Colors.green,
                          ),
                        ),
                      ],
                    )
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
