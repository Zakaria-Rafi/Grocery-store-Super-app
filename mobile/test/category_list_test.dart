import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/models/Category.dart';
import 'package:mobile/views/widget/HomePageWidget/CategoryList.dart';

void main() {
  testWidgets('CategoryList displays categories correctly',
      (WidgetTester tester) async {
    // Préparation des données de test
    final categories = [
      Category(id: 1, name: 'Catégorie 1'),
      Category(id: 2, name: 'Catégorie 2'),
    ];
    final selectedCategoryIds = <int>{};

    // Construction du widget
    await tester.pumpWidget(MaterialApp(
      home: Scaffold(
        body: CategoryList(
          categories: categories,
          selectedCategoryIds: selectedCategoryIds,
          onCategorySelected: (_) {},
        ),
      ),
    ));

    // Vérification du titre
    expect(find.text('Catégories'), findsOneWidget);

    // Vérification des noms des catégories
    expect(find.text('Catégorie 1'), findsOneWidget);
    expect(find.text('Catégorie 2'), findsOneWidget);

    // Vérification des icônes
    expect(find.byIcon(Icons.shopping_bag), findsNWidgets(2));
  });

  testWidgets('CategoryList handles empty categories',
      (WidgetTester tester) async {
    await tester.pumpWidget(MaterialApp(
      home: Scaffold(
        body: CategoryList(
          categories: const [],
          selectedCategoryIds: const {},
          onCategorySelected: (id) {},
        ),
      ),
    ));

    // Vérification que rien n'est affiché
    expect(find.byType(CategoryList), findsOneWidget);
    expect(find.text('Catégories'), findsNothing);
  });

  testWidgets('CategoryList handles category selection',
      (WidgetTester tester) async {
    final categories = [Category(id: 1, name: 'Test')];
    final selectedCategoryIds = <int>{};
    var selectedId = -1;

    await tester.pumpWidget(MaterialApp(
      home: Scaffold(
        body: CategoryList(
          categories: categories,
          selectedCategoryIds: selectedCategoryIds,
          onCategorySelected: (id) => selectedId = id,
        ),
      ),
    ));

    // Test du tap sur une catégorie
    await tester.tap(find.text('Test'));
    await tester.pump();

    // Vérification que le callback a été appelé avec le bon ID
    expect(selectedId, equals(1));
  });
}
