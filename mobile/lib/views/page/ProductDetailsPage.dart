import 'package:flutter/material.dart';
import 'package:mobile/models/Product.dart';
import 'package:barcode_widget/barcode_widget.dart';
import 'package:carousel_slider/carousel_slider.dart';

class ProductDetailsPage extends StatefulWidget {
  final Product product;

  const ProductDetailsPage({
    super.key,
    required this.product,
  });

  @override
  ProductDetailsPageState createState() => ProductDetailsPageState();
}

class ProductDetailsPageState extends State<ProductDetailsPage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  int _currentImageIndex = 0;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          _buildSliverAppBar(),
          SliverToBoxAdapter(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildProductHeader(),
                _buildPriceInfo(),
                _buildTabBar(),
                _buildTabBarView(),
              ],
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => Navigator.pop(context),
        child: Container(
          width: 40,
          height: 40,
          decoration: const BoxDecoration(
            shape: BoxShape.circle,
          ),
          child: const Icon(Icons.arrow_back),
        ),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.startFloat,
    );
  }

  Widget _buildSliverAppBar() {
    return SliverAppBar(
      expandedHeight: 300,
      pinned: true,
      flexibleSpace: FlexibleSpaceBar(
        background: Stack(
          fit: StackFit.expand,
          children: [
            CarouselSlider(
              options: CarouselOptions(
                height: 300,
                viewportFraction: 1.0,
                enlargeCenterPage: false,
                onPageChanged: (index, reason) {
                  setState(() {
                    _currentImageIndex = index;
                  });
                },
              ),
              items: widget.product.imagesUrl.map((url) {
                return Builder(
                  builder: (BuildContext context) {
                    return GestureDetector(
                      child: Hero(
                        tag: 'product-image-$url',
                        child: Image.network(
                          url,
                          fit: BoxFit.cover,
                        ),
                      ),
                    );
                  },
                );
              }).toList(),
            ),
            Positioned(
              bottom: 16,
              left: 0,
              right: 0,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: widget.product.imagesUrl.asMap().entries.map((entry) {
                  return Container(
                    width: 8.0,
                    height: 8.0,
                    margin: const EdgeInsets.symmetric(horizontal: 4.0),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: _currentImageIndex == entry.key
                          ? Colors.white
                          : Colors.white.withAlpha(40),
                    ),
                  );
                }).toList(),
              ),
            ),
          ],
        ),
      ),
      leading: IconButton(
        icon: const Icon(Icons.arrow_back_ios, color: Colors.white),
        onPressed: () => Navigator.pop(context),
      ),
    );
  }

  Widget _buildProductHeader() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.product.name,
                      style:
                          Theme.of(context).textTheme.headlineMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      widget.product.brand,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: Colors.grey[600],
                          ),
                    ),
                  ],
                ),
              ),
              Image.asset(
                "assets/images/Nutri-score-${widget.product.nutritionalValues.toUpperCase()}.png",
                height: 40,
                width: 80,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPriceInfo() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(5),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Price (incl. VAT)',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  Text(
                    '${widget.product.price.toStringAsFixed(2)} €',
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                          color: Theme.of(context).primaryColor,
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    'Weight',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  Text(
                    '${widget.product.weight.toStringAsFixed(2)} kg',
                    style: Theme.of(context).textTheme.headlineMedium,
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Price (excl. VAT): ${(widget.product.price / 1.2).toStringAsFixed(2)} €',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              Text(
                'VAT: ${(widget.product.price - widget.product.price / 1.2).toStringAsFixed(2)} €',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTabBar() {
    return Container(
      margin: const EdgeInsets.only(top: 24),
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(
            color: Colors.grey[300]!,
            width: 1,
          ),
        ),
      ),
      child: TabBar(
        controller: _tabController,
        labelColor: Theme.of(context).primaryColor,
        unselectedLabelColor: Colors.grey[600],
        indicatorColor: Theme.of(context).primaryColor,
        tabs: const [
          Tab(text: 'Details'),
          Tab(text: 'Ingredients'),
        ],
      ),
    );
  }

  Widget _buildTabBarView() {
    return SizedBox(
      height: 300,
      child: TabBarView(
        controller: _tabController,
        children: [
          _buildDetailsTab(),
          _buildIngredientsTab(),
        ],
      ),
    );
  }

  Widget _buildDetailsTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSection('Description', widget.product.description),
          const SizedBox(height: 16),
          Text(
            'Categories',
            style: Theme.of(context).textTheme.headlineMedium,
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: widget.product.categories
                .map((category) => Chip(
                      label: Text(category.name),
                      backgroundColor:
                          Theme.of(context).primaryColor.withAlpha(10),
                      labelStyle:
                          TextStyle(color: Theme.of(context).primaryColor),
                    ))
                .toList(),
          ),
          const SizedBox(height: 16),
          if (widget.product.barcode != null) ...[
            Text(
              'Barcode',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            const SizedBox(height: 8),
            Center(
              child: BarcodeWidget(
                barcode: Barcode.code128(),
                data: widget.product.barcode!,
                width: 200,
                height: 80,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildIngredientsTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (widget.product.ingredients != null &&
              widget.product.ingredients!.isNotEmpty)
            _buildSection('Ingredients', widget.product.ingredients!),
          const SizedBox(height: 16),
          if (widget.product.allergens != null &&
              widget.product.allergens!.isNotEmpty)
            _buildSection('Allergens', widget.product.allergens!,
                isWarning: true),
        ],
      ),
    );
  }

  Widget _buildSection(String title, String content, {bool isWarning = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: Theme.of(context).textTheme.headlineMedium,
        ),
        const SizedBox(height: 8),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isWarning
                ? Theme.of(context).colorScheme.error.withAlpha(10)
                : Theme.of(context).colorScheme.surface,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withAlpha(5),
                blurRadius: 10,
                offset: const Offset(0, 5),
              ),
            ],
          ),
          child: Text(
            content,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: isWarning ? Theme.of(context).colorScheme.error : null,
                ),
          ),
        ),
      ],
    );
  }
}
