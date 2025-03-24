import 'package:flutter/material.dart';
import 'package:mobile/models/Category.dart';

class CategoryList extends StatefulWidget {
  final List<Category> categories;
  final Set<int> selectedCategoryIds;
  final Function(int) onCategorySelected;

  const CategoryList({
    super.key,
    required this.categories,
    required this.selectedCategoryIds,
    required this.onCategorySelected,
  });

  @override
  CategoryListState createState() => CategoryListState();
}

class CategoryListState extends State<CategoryList> {
  // Liste de couleurs différentes à appliquer aux catégories
  final List<Color> categoryColors = [
    Colors.red[100]!,
    Colors.blue[100]!,
    Colors.green[100]!,
    Colors.orange[100]!,
    Colors.purple[100]!,
    Colors.pink[100]!,
    Colors.amber[100]!,
    Colors.teal[100]!,
    Colors.indigo[100]!,
    Colors.brown[100]!,
  ];

  final IconData categoryIcon =
      Icons.shopping_bag; // Une seule icône pour toutes les catégories

  @override
  Widget build(BuildContext context) {
    if (widget.categories.isEmpty) {
      return const SizedBox.shrink();
    }
    return SizedBox(
      height: 140, // Ajusté pour laisser de la place au texte
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.only(left: 16.0, top: 16.0, bottom: 8.0),
            child: Text(
              'Catégories',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          Expanded(
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12.0),
                child: Wrap(
                  alignment: WrapAlignment.start,
                  children: widget.categories.asMap().entries.map((entry) {
                    int index = entry.key;
                    Category category = entry.value;
                    bool isSelected =
                        widget.selectedCategoryIds.contains(category.id);

                    // Assurer une distribution de couleurs en boucle
                    Color backgroundColor =
                        categoryColors[index % categoryColors.length];

                    return GestureDetector(
                      onTap: () => widget.onCategorySelected(category.id),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          CircleAvatar(
                            radius: 30,
                            backgroundColor: isSelected
                                ? backgroundColor
                                : backgroundColor.withAlpha(50),
                            child: Icon(
                              categoryIcon,
                              size: 30,
                              color: isSelected ? Colors.black : Colors.black38,
                            ),
                          ),
                          const SizedBox(height: 8),
                          SizedBox(
                            width: 90, // Largeur fixe pour tous les textes
                            child: Text(
                              category.name.trim(), // Affichage du nom
                              textAlign: TextAlign.center,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: isSelected
                                    ? FontWeight.bold
                                    : FontWeight.w500,
                                color: isSelected
                                    ? Colors.black
                                    : Colors.black54, // Couleur du texte
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
