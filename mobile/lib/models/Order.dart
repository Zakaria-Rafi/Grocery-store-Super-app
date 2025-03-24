class Order {
  final int id;
  final String orderNumber;
  final String status;
  final String amount;
  final String paymentMethod;
  final String? refundedAmount;
  final String? paymentIntentId;
  final String createdAt;
  final String updatedAt;
  final User user;
  final List<OrderProduct> products;

  Order({
    required this.id,
    required this.orderNumber,
    required this.status,
    required this.amount,
    required this.paymentMethod,
    this.refundedAmount,
    this.paymentIntentId,
    required this.createdAt,
    required this.updatedAt,
    required this.user,
    required this.products,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'],
      orderNumber: json['orderNumber'],
      status: json['status'],
      amount: json['amount'],
      paymentMethod: json['paimentmethod'] ?? 'Non spécifié',
      refundedAmount: json['refundedAmount'],
      paymentIntentId: json['PaymentIntentId'],
      createdAt: json['created_at'],
      updatedAt: json['updated_at'],
      user: json['user'] != null
          ? User.fromJson(json['user'])
          : User(
              id: 0,
              firstName: 'Client',
              lastName: 'Anonyme',
              email: '',
              role: 'customer',
            ),
      products: (json['products'] as List)
          .map((product) => OrderProduct.fromJson(product))
          .toList(),
    );
  }
}

class User {
  final int id;
  final String firstName;
  final String lastName;
  final String email;
  final String role;

  User({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.role,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      firstName: json['firstName'],
      lastName: json['lastName'],
      email: json['email'],
      role: json['role'],
    );
  }
}

class OrderProduct {
  final int id;
  final int quantity;
  final String price;
  final ProductDetails product;

  OrderProduct({
    required this.id,
    required this.quantity,
    required this.price,
    required this.product,
  });

  factory OrderProduct.fromJson(Map<String, dynamic> json) {
    return OrderProduct(
      id: json['id'],
      quantity: json['quantity'],
      price: json['price'],
      product: ProductDetails.fromJson(json['product']),
    );
  }

  String get productName => product.name;
  List<String> get imageUrls => product.imagesUrl;
}

class ProductDetails {
  final int id;
  final String name;
  final String description;
  final String price;
  final List<String> imagesUrl;
  final String brand;

  ProductDetails({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.imagesUrl,
    required this.brand,
  });

  factory ProductDetails.fromJson(Map<String, dynamic> json) {
    return ProductDetails(
      id: json['id'],
      name: json['name'],
      description: json['description'] ?? '',
      price: json['price'].toString(),
      imagesUrl:
          json['imagesUrl'] != null ? List<String>.from(json['imagesUrl']) : [],
      brand: json['brand'] ?? '',
    );
  }
}
