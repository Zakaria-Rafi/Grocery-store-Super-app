import '../models/Product.dart';
import '../services/api_service.dart';

class ProductController {
  final ApiService _apiService = ApiService();

  Future<Product?> getProductFromBarCode(String codebar) async {
    try {
      var result = await _apiService.get('/products/barcodeUser/$codebar');

      // Vérification que result n'est pas null
      if (result.data == null) return null;

      // Vérifie si la réponse est une liste et prend le premier élément
      if (result.data is List) {
        if (result.data.isNotEmpty && result.data[0] is Map<String, dynamic>) {
          return Product.fromJson(result.data[0]);
        }
        return null;
      }

      // Vérifie si la réponse est déjà un objet Map<String, dynamic>
      if (result.data is Map<String, dynamic>) {
        return Product.fromJson(result.data);
      }

      return null;
    } catch (e) {
      return null;
    }
  }
}
