class Category {
  final int id;
  final String name;

  Category({required this.id, required this.name});

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id'],
      name: json['name'],
    );
  }

  static List<Category> fromJsonList(List<dynamic> jsonList) {
    return jsonList.map((json) => Category.fromJson(json)).toList();
  }
}
