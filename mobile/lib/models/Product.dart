import 'package:mobile/models/Category.dart';

class Product {
  final int id;
  final String name;
  final String description;
  final String brand;
  final double price;
  final double weight;
  final String nutritionalValues;
  final num stock;
  final List<String> imagesUrl;
  final List<Category> categories;
  final String? allergens;
  final String? ingredients;
  final String? barcode;

  Product(
      {required this.id,
      required this.name,
      required this.description,
      required this.brand,
      required this.price,
      required this.weight,
      required this.imagesUrl,
      required this.nutritionalValues,
      required this.stock,
      required this.categories,
      this.allergens,
      this.ingredients,
      this.barcode});

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      brand: json['brand'],
      price: double.tryParse(json['price'].toString()) ?? 0.0,
      weight: double.tryParse(json['weight'].toString()) ?? 0.0,
      imagesUrl: (json['imagesUrl'] as List<dynamic>?)
              ?.map((dynamic item) => item.toString())
              .toList() ??
          [],
      stock: json['stock'] ?? 0,
      nutritionalValues: json['nutritionalValues'] ?? '',
      categories: json['categories'] != null
          ? (json['categories'] as List<dynamic>)
              .map((item) => Category.fromJson(item))
              .toList()
          : [Category(id: 0, name: 'Non catégorisé')],
      allergens: json['allergens'],
      ingredients: json['ingredients'],
      barcode: json['barcode'],
    );
  }

  get quantity => null;

  get totalPrice => null;
}
