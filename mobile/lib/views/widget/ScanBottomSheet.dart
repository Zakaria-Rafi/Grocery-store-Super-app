import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile/controllers/cart_controller.dart';
import 'package:mobile/controllers/product_controller.dart';
import 'package:mobile/models/Product.dart';
import 'package:mobile/views/widget/ScanBottomSheet/ProductNotFound.dart';

class ScanBottomSheet extends StatefulWidget {
  final String codebar;
  const ScanBottomSheet({super.key, required this.codebar});

  @override
  State<ScanBottomSheet> createState() => _ScanBottomSheetState();
}

class _ScanBottomSheetState extends State<ScanBottomSheet> {
  ProductController productController = ProductController();
  final CartController cartController = CartController();
  Product? product;
  var quantity = 1;
  bool isLoading = true;

  @override
  void initState() {
    _getProduct();
    super.initState();
  }

  void _getProduct() async {
    Product? result =
        await productController.getProductFromBarCode(widget.codebar);
    setState(() {
      product = result;
      isLoading = false;
    });
  }

  void handleProductQuantity(int value, bool from) {
    if (from && quantity + value <= product!.stock) {
      setState(() {
        quantity += value;
      });
    } else if (!from && quantity > 1) {
      setState(() {
        quantity += value;
      });
    }
  }

  String _getNutriScoreImage() {
    switch (product!.nutritionalValues.toLowerCase()) {
      case 'a':
        return 'Nutri-score-A.png';
      case 'b':
        return 'Nutri-score-B.png';
      case 'c':
        return 'Nutri-score-C.png';
      case 'd':
        return 'Nutri-score-D.png';
      case 'e':
        return 'Nutri-score-E.png';
      default:
        return 'Nutri-score-E.png';
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return Container(
        height: MediaQuery.of(context).size.height,
        width: MediaQuery.of(context).size.width,
        color: const Color.fromRGBO(244, 245, 249, 1),
        child: const SafeArea(
          child: Center(
            child: CircularProgressIndicator(),
          ),
        ),
      );
    }

    if (product == null) {
      return SafeArea(child: ProductNotFound(codebar: widget.codebar));
    }

    return SafeArea(
      child: Container(
        height: MediaQuery.of(context).size.height,
        width: MediaQuery.of(context).size.width,
        padding: const EdgeInsets.all(16),
        color: const Color.fromRGBO(244, 245, 249, 1),
        child: Stack(
          children: [
            Column(
              mainAxisSize: MainAxisSize.max,
              mainAxisAlignment: MainAxisAlignment.start,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Stack(
                    children: [
                      Container(
                        color: const Color.fromRGBO(244, 245, 249, 1),
                        height: MediaQuery.of(context).size.width * 0.8,
                        width: MediaQuery.of(context).size.width * 0.8,
                        child: Image.network(product!.imagesUrl[0]),
                      ),
                      Positioned(
                        bottom: 0,
                        right: 0,
                        child: Image.asset(
                          "assets/images/${_getNutriScoreImage()}",
                          height: 40,
                          width: 80,
                        ),
                      ),
                    ],
                  ),
                ),
                Text(
                  "${product!.price.toStringAsFixed(2)} €",
                  style: GoogleFonts.poppins(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: const Color.fromRGBO(40, 180, 70, 1),
                  ),
                ),
                Text(
                  product!.name,
                  style: GoogleFonts.poppins(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.black,
                  ),
                ),
                Text(
                  product!.brand,
                  style: GoogleFonts.poppins(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: const Color.fromRGBO(134, 136, 137, 1),
                  ),
                ),
                Text(
                  "Weight: ${product!.weight.toStringAsFixed(2)} kg",
                  style: GoogleFonts.poppins(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: const Color.fromRGBO(134, 136, 137, 1),
                  ),
                ),
              ],
            ),
            Positioned(
                bottom: 110,
                left: 0,
                right: 0,
                child: Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Column(children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            "Quantity",
                            style: GoogleFonts.poppins(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: const Color.fromRGBO(134, 136, 137, 1)),
                          ),
                          Row(
                            children: [
                              IconButton(
                                  onPressed: () {
                                    handleProductQuantity(-1, false);
                                  },
                                  icon: const Icon(
                                    Icons.remove,
                                    color: Color.fromRGBO(40, 180, 70, 1),
                                  )),
                              Text(
                                quantity.toString(),
                                style: GoogleFonts.poppins(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                    color:
                                        const Color.fromRGBO(134, 136, 137, 1)),
                              ),
                              IconButton(
                                onPressed: quantity >= product!.stock
                                    ? null
                                    : () {
                                        handleProductQuantity(1, true);
                                      },
                                icon: const Icon(Icons.add),
                                color: quantity >= product!.stock
                                    ? Colors.grey
                                    : const Color.fromRGBO(40, 180, 70, 1),
                              ),
                            ],
                          )
                        ],
                      ),
                    ),
                    SizedBox(
                      width: MediaQuery.of(context).size.width,
                      height: 60,
                      child: InkWell(
                        onTap: product!.stock > 0
                            ? () {
                                cartController.addItemToCart(
                                    product!.id, quantity);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text(
                                      'Produit ajouté au panier',
                                      style: GoogleFonts.poppins(),
                                    ),
                                    backgroundColor:
                                        const Color.fromRGBO(40, 180, 70, 1),
                                  ),
                                );
                                context.pop();
                              }
                            : null,
                        borderRadius: BorderRadius.circular(10),
                        child: Container(
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(10),
                            gradient: LinearGradient(
                              colors: product!.stock > 0
                                  ? [
                                      const Color.fromRGBO(174, 220, 129, 1),
                                      const Color.fromRGBO(108, 197, 29, 1),
                                    ]
                                  : [
                                      Colors.grey.shade400,
                                      Colors.grey.shade500,
                                    ],
                              begin: Alignment.centerLeft,
                              end: Alignment.centerRight,
                            ),
                          ),
                          child: Center(
                            child: Text(
                              product!.stock > 0
                                  ? "Add to cart"
                                  : "Product out of stock",
                              style: GoogleFonts.poppins(
                                fontSize: 18,
                                fontWeight: FontWeight.normal,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ]),
                )),
            Positioned(
              top: 16,
              left: 0,
              child: IconButton(
                  onPressed: () {
                    context.pop();
                  },
                  icon: const Icon(
                    Icons.arrow_back_ios,
                    color: Colors.black,
                  )),
            )
          ],
        ),
      ),
    );
  }
}
