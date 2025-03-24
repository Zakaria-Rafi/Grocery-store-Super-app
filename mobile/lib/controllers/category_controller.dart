import 'package:mobile/models/Category.dart';
import 'package:mobile/services/api_service.dart';

class ProductController {
  final ApiService _apiService = ApiService();

  Future<List<Category>> getCategories() async {
    var result =
        await _apiService.get('/categories'); // Récupération des catégories
    return Category.fromJsonList(result.data);
  }
}
