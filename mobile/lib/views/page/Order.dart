import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:mobile/models/Order.dart';
import 'package:mobile/controllers/order_controller.dart';
import 'package:path_provider/path_provider.dart';
import 'package:open_file/open_file.dart';

class OrdersPage extends StatefulWidget {
  const OrdersPage({super.key});

  @override
  State<OrdersPage> createState() => _OrdersPageState();
}

class _OrdersPageState extends State<OrdersPage> {
  final OrderController _orderController = OrderController();
  List<Order> orders = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadOrders();
  }

  Future<void> _loadOrders() async {
    try {
      final List<dynamic> response = await _orderController.loadOrders();
      setState(() {
        orders = response.map((data) => Order.fromJson(data)).toList();
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to load orders'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  String formatDate(String dateStr) {
    final date = DateTime.parse(dateStr);
    return DateFormat('dd/MM/yyyy HH:mm').format(date);
  }

  Future<void> downloadAndOpenPdf(Uint8List bytes, String orderNumber) async {
    try {
      // Obtenez le répertoire temporaire
      final directory = await getTemporaryDirectory();
      final filePath = '${directory.path}/invoice_$orderNumber.pdf';
      final file = File(filePath);

      // Écrivez les bytes dans le fichier
      await file.writeAsBytes(bytes);

      // Ouvrez le fichier
      await OpenFile.open(filePath);
    } catch (e) {
      throw Exception('Failed to download or open PDF: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Orders'),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 1,
      ),
      backgroundColor: Colors.grey[100],
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : orders.isEmpty
              ? const Center(child: Text('No orders found'))
              : RefreshIndicator(
                  onRefresh: _loadOrders,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16.0),
                    itemCount: orders.length,
                    itemBuilder: (context, index) {
                      final order = orders[index];
                      return Card(
                        margin: const EdgeInsets.only(bottom: 16.0),
                        color: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Text(
                                      'Order #${order.orderNumber}',
                                      style: const TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: _getStatusColor(order.status),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Text(
                                      order.status,
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 12,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Date: ${formatDate(order.createdAt)}',
                                style: TextStyle(
                                  color: Colors.grey[600],
                                  fontSize: 14,
                                ),
                              ),
                              Text(
                                'Payment: ${order.paymentMethod}',
                                style: TextStyle(
                                  color: Colors.grey[600],
                                  fontSize: 14,
                                ),
                              ),
                              Text(
                                'Total: \$${order.amount}',
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 8),
                              ExpansionTile(
                                title: const Text('Products'),
                                children: order.products.map((product) {
                                  return ListTile(
                                    leading: product.imageUrls.isNotEmpty
                                        ? ClipRRect(
                                            borderRadius:
                                                BorderRadius.circular(4),
                                            child: Image.network(
                                              product.imageUrls[0],
                                              width: 50,
                                              height: 50,
                                              fit: BoxFit.cover,
                                              errorBuilder:
                                                  (context, error, stackTrace) {
                                                return Container(
                                                  width: 50,
                                                  height: 50,
                                                  color: Colors.grey[200],
                                                  child: const Icon(Icons
                                                      .image_not_supported),
                                                );
                                              },
                                            ),
                                          )
                                        : Container(
                                            width: 50,
                                            height: 50,
                                            color: Colors.grey[200],
                                            child: const Icon(Icons.image),
                                          ),
                                    title: Text(product.productName),
                                    subtitle:
                                        Text('Quantity: ${product.quantity}'),
                                    trailing: Text('\$${product.price}'),
                                  );
                                }).toList(),
                              ),
                              const SizedBox(height: 16),
                              Align(
                                alignment: Alignment.centerRight,
                                child: ElevatedButton.icon(
                                  onPressed: () async {
                                    try {
                                      // Utilisez la méthode publique pour obtenir les bytes du PDF
                                      final bytes = await _orderController
                                          .downloadInvoicePdf(order.id);

                                      // Appelez la nouvelle fonction pour télécharger et ouvrir le PDF
                                      await downloadAndOpenPdf(
                                          bytes, order.orderNumber);

                                      // Affichez un message de succès
                                      if (!mounted) return;
                                      ScaffoldMessenger.of(context)
                                          .showSnackBar(
                                        const SnackBar(
                                          content: Text(
                                              'Invoice downloaded successfully'),
                                          backgroundColor: Colors.green,
                                          duration: Duration(seconds: 2),
                                        ),
                                      );
                                    } catch (e) {
                                      if (!mounted) return;
                                      ScaffoldMessenger.of(context)
                                          .showSnackBar(
                                        SnackBar(
                                          content: Text(
                                              'Failed to download invoice: ${e.toString()}'),
                                          backgroundColor: Colors.red,
                                        ),
                                      );
                                    }
                                  },
                                  icon: const Icon(Icons.download),
                                  label: const Text('Download Invoice'),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Colors.green,
                                    foregroundColor: Colors.white,
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 16, vertical: 8),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toUpperCase()) {
      case 'PAID':
        return Colors.green;
      case 'PENDING':
        return Colors.orange;
      case 'CANCELLED':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }
}
