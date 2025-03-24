import 'package:flutter/material.dart';
import 'dart:async';

class SearchBar extends StatefulWidget {
  final Function(String)? onSearch;
  final String? initialQuery;

  const SearchBar({this.onSearch, this.initialQuery, super.key});

  @override
  State<SearchBar> createState() => _SearchBarState();
}

class _SearchBarState extends State<SearchBar> {
  final TextEditingController _searchController = TextEditingController();
  Timer? _debounceTimer;

  @override
  void initState() {
    super.initState();
    if (widget.initialQuery != null) {
      _searchController.text = widget.initialQuery!;
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    _debounceTimer?.cancel();
    super.dispose();
  }

  void _onSearchChanged(String query) {
    if (_debounceTimer?.isActive ?? false) {
      _debounceTimer!.cancel();
    }

    // Debounce search to avoid excessive calls
    _debounceTimer = Timer(const Duration(milliseconds: 500), () {
      if (widget.onSearch != null) {
        // Normalize query to handle accents
        String normalizedQuery = _normalizeString(query);
        widget.onSearch!(normalizedQuery);
      }
    });
  }

  // Function to normalize strings (remove accents)
  String _normalizeString(String str) {
    // Normalization map for common French accented characters
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

  void _clearSearch() {
    setState(() {
      _searchController.clear();
      if (widget.onSearch != null) {
        widget.onSearch!('');
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: TextField(
        controller: _searchController,
        onChanged: _onSearchChanged,
        decoration: InputDecoration(
          prefixIcon: const Icon(Icons.search),
          suffixIcon: _searchController.text.isNotEmpty
              ? IconButton(
                  icon: const Icon(Icons.clear),
                  onPressed: _clearSearch,
                )
              : null,
          hintText: "Rechercher des produits...",
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
          filled: true,
          fillColor: Colors.grey[200],
          contentPadding: const EdgeInsets.symmetric(vertical: 0),
        ),
        textInputAction: TextInputAction.search,
        textCapitalization: TextCapitalization.sentences,
      ),
    );
  }
}
