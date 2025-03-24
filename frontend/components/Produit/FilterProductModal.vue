<template>
  <Teleport to="body">
    <Dialog :open="isOpen" @update:open="closeModal">
      <DialogContent class="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{{ t("PRODUCT.FILTER_PRODUCTS") }}</DialogTitle>
        </DialogHeader>

        <div class="grid gap-6 py-4">
          <div class="space-y-4">
            <div>
              <Label>{{ t("PRODUCT.PRODUCT_NAME") }}</Label>
              <div class="relative">
                <Input
                  v-model="searchQuery"
                  :placeholder="t('PRODUCT.SEARCH_PRODUCT')"
                  class="mt-2"
                  @update:model-value="handleSearch"
                />
                <div
                  v-if="searchQuery.length >= 1 && searchResults.length > 0 && showResults"
                  class="absolute w-full mt-1 bg-white border rounded-md shadow-lg z-50 max-h-48 overflow-y-auto"
                >
                  <div
                    v-for="product in searchResults"
                    :key="product.id"
                    class="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    @click="selectProduct(product)"
                  >
                    {{ product.name }}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label>{{ t("PRODUCT.BRAND") }}</Label>
              <div class="relative">
                <Input
                  v-model="brandQuery"
                  :placeholder="t('PRODUCT.SEARCH_BRAND')"
                  class="mt-2"
                  @update:model-value="handleBrandSearch"
                />
                <div
                  v-if="brandQuery.length >= 1 && brandResults.length > 0 && showBrandResults"
                  class="absolute w-full mt-1 bg-white border rounded-md shadow-lg z-50 max-h-48 overflow-y-auto"
                >
                  <div
                    v-for="brand in brandResults"
                    :key="brand"
                    class="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    @click="selectBrand(brand)"
                  >
                    {{ brand }}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label>{{ t("PRODUCT.STOCK_STATUS") }}</Label>
              <Select v-model="filters.stockStatus">
                <SelectTrigger>
                  <SelectValue
                    :placeholder="t('PRODUCT.STOCK_STATUS')"
                    :class="{ 'text-muted-foreground': filters.stockStatus === 'all' }"
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{{ t("PRODUCT.STOCK_STATUS") }}</SelectItem>
                  <SelectItem value="in_stock">{{ t("PRODUCT.IN_STOCK") }}</SelectItem>
                  <SelectItem value="out_of_stock">{{ t("PRODUCT.OUT_OF_STOCK") }}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Catalogue Status -->
            <div>
              <Label>{{ t("PRODUCT.CATALOG_STATUS") }}</Label>
              <Select v-model="filters.catalogStatus">
                <SelectTrigger>
                  <SelectValue
                    :placeholder="t('PRODUCT.CATALOG_STATUS')"
                    :class="{ 'text-muted-foreground': filters.catalogStatus === 'all' }"
                  />
                </SelectTrigger>
                <SelectContent class="relative z-50">
                  <SelectItem value="all">{{ t("PRODUCT.CATALOG_STATUS") }}</SelectItem>
                  <SelectItem value="active">{{ t("PRODUCT.ACTIVE") }}</SelectItem>
                  <SelectItem value="inactive">{{ t("PRODUCT.INACTIVE") }}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <!-- Prix Range -->
          <div>
            <Label>{{ t("PRODUCT.PRODUCT_PRICE") }}</Label>
            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center gap-2">
                <Input v-model="filters.minPrice" type="number" placeholder="15" class="w-full" />
              </div>
              <div class="flex items-center gap-2">
                <Input v-model="filters.maxPrice" type="number" placeholder="750" class="w-full" />
              </div>
            </div>
          </div>

          <!-- Stock Range -->
          <div>
            <Label>{{ t("PRODUCT.STOCK_QUANTITY") }}</Label>
            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center gap-2">
                <Input v-model="filters.minStock" type="number" placeholder="15" class="w-full" />
              </div>
              <div class="flex items-center gap-2">
                <Input v-model="filters.maxStock" type="number" placeholder="750" class="w-full" />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter class="flex justify-between gap-2 pt-4 border-t">
          <Button variant="outline" class="w-full" @click="resetFilters"> {{ t("BUTTON.RESET") }} </Button>
          <Button type="submit" class="w-full bg-gray-600 hover:bg-gray-700" @click.prevent="handleFilter">
            {{ t("BUTTON.FILTER") }} ({{ activeFiltersCount }})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast/use-toast";
import type { Product, ProductFilters } from "~/types/product";

const { t } = useI18n();

// PROPS & EMITS
const props = defineProps<{
  isOpen: boolean;
  savedFilters: ProductFilters;
}>();

const emit = defineEmits<{
  "update:isOpen": [value: boolean];
  filter: [filters: ProductFilters];
  reset: [];
}>();

const closeModal = (value: boolean) => {
  emit("update:isOpen", value);
};

// Déclaration des refs en premier
const searchQuery = ref("");
const brandQuery = ref("");
const showResults = ref(false);
const showBrandResults = ref(false);
const searchResults = ref<Product[]>([]);
const brandResults = ref<string[]>([]);
const { toast } = useToast();

// État pour les filtres courants
const currentFilters = ref({
  name: "",
  brand: "",
  stockStatus: "all",
  catalogStatus: "all",
  minPrice: "",
  maxPrice: "",
  minStock: "",
  maxStock: "",
});

// LOCAL FILTER STATE
const filters = ref<ProductFilters>({
  name: "",
  brand: "",
  stockStatus: "all" as const,
  catalogStatus: "all" as const,
  minPrice: "",
  maxPrice: "",
  minStock: "",
  maxStock: "",
});

// Surveiller les changements des savedFilters
watch(
  () => props.savedFilters,
  (newFilters) => {
    if (newFilters) {
      // Mettre à jour les champs de recherche
      searchQuery.value = newFilters.name || "";
      brandQuery.value = newFilters.brand || "";
      // Mettre à jour les filtres
      filters.value = {
        ...filters.value,
        ...newFilters,
      };
      currentFilters.value = {
        ...currentFilters.value,
        ...newFilters,
      };
    }
  },
  { immediate: true },
);

// État pour la recherche des marques
const allBrands = ref<string[]>([]);

// Fonction pour récupérer les données des produits
const data = ref<Product[]>([]);
const fetchProducts = async () => {
  try {
    const products = await $api<Product[]>("/products");
    data.value = products;
  } catch {
    toast({
      title: "Erreur",
      description: "Impossible de récupérer les produits",
      variant: "destructive",
    });
    data.value = [];
  }
};

// Récupérer toutes les marques uniques des produits
const fetchBrands = async () => {
  try {
    const products = await $api<Product[]>("/products");
    if (Array.isArray(products)) {
      const uniqueBrands = new Set(products.map((p: Product) => p.brand));
      allBrands.value = Array.from(uniqueBrands).filter(Boolean);
    }
  } catch {
    toast({
      title: "Erreur",
      description: "Impossible de récupérer les marques",
      variant: "destructive",
    });
    allBrands.value = [];
  }
};

// Count how many filters are currently active
const activeFiltersCount = computed(() => {
  let count = 0;
  const f = filters.value;

  // Ne compter que les filtres réellement actifs
  if (f.name) count++;
  if (f.brand) count++;
  if (f.stockStatus && f.stockStatus !== "all") {
    count++;
  }
  if (f.catalogStatus && f.catalogStatus !== "all") {
    count++;
  }
  if (f.minPrice) count++;
  if (f.maxPrice) count++;
  if (f.minStock) count++;
  if (f.maxStock) count++;

  return count;
});

onMounted(async () => {
  try {
    await fetchProducts();
    fetchBrands();
    if (props.savedFilters) {
      searchQuery.value = props.savedFilters.name || "";
      brandQuery.value = props.savedFilters.brand || "";
      filters.value = {
        ...filters.value,
        ...props.savedFilters,
      };
      currentFilters.value = {
        ...currentFilters.value,
        ...props.savedFilters,
      };
    }
  } catch {
    toast({
      title: "Erreur",
      description: "Impossible de récupérer les produits",
      variant: "destructive",
    });
  }
});

// Pas de document.addEventListener(...) => pas de double-clic conflictuel
// On laisse la recherche purement sur l'input

const handleSearch = async () => {
  if (searchQuery.value.length >= 1) {
    showResults.value = true;
    const response = await $api<Product[]>("/products");
    if (Array.isArray(response)) {
      searchResults.value = response.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
      );
    }
  } else {
    showResults.value = false;
    searchResults.value = [];
  }
  filters.value.name = searchQuery.value;
};

const selectProduct = (product: Product) => {
  searchQuery.value = product.name;
  filters.value.name = product.name;
  showResults.value = false;
  currentFilters.value = {
    ...currentFilters.value,
    name: product.name,
  };
};

// Reset local filters only (and emit filter)
const resetFilters = () => {
  filters.value = {
    name: "",
    brand: "",
    stockStatus: "all" as const,
    catalogStatus: "all" as const,
    minPrice: "",
    maxPrice: "",
    minStock: "",
    maxStock: "",
  };
  searchQuery.value = "";
  emit("filter", filters.value);
};

// Actually apply filters
const handleFilter = () => {
  const formatted: ProductFilters = {
    ...filters.value,
    name: searchQuery.value,
    brand: brandQuery.value,
    stockStatus: filters.value.stockStatus,
    catalogStatus: filters.value.catalogStatus,
    minPrice: filters.value.minPrice ? filters.value.minPrice.toString() : "",
    maxPrice: filters.value.maxPrice ? filters.value.maxPrice.toString() : "",
    minStock: filters.value.minStock ? filters.value.minStock.toString() : "",
    maxStock: filters.value.maxStock ? filters.value.maxStock.toString() : "",
  };
  emit("filter", formatted);
  emit("update:isOpen", false);
};

// Pour les marques
const handleBrandSearch = async () => {
  if (brandQuery.value.length >= 1) {
    showBrandResults.value = true;
    // Récupérer et filtrer les marques uniques
    const response = await $api<Product[]>("/products");
    if (Array.isArray(response)) {
      const uniqueBrands = [...new Set(response.map((p: Product) => p.brand))];
      brandResults.value = uniqueBrands.filter((brand) => brand.toLowerCase().includes(brandQuery.value.toLowerCase()));
    }
  } else {
    showBrandResults.value = false;
    brandResults.value = [];
  }
  filters.value.brand = brandQuery.value;
};

const selectBrand = (brand: string) => {
  brandQuery.value = brand;
  filters.value.brand = brand;
  showBrandResults.value = false;
  currentFilters.value = {
    ...currentFilters.value,
    brand: brand,
  };
};

// Mettre à jour les filtres quand les valeurs changent
watch(
  () => searchQuery.value,
  (newValue) => {
    filters.value.name = newValue;
    currentFilters.value = {
      ...currentFilters.value,
      name: newValue,
    };
  },
);

watch(
  () => brandQuery.value,
  (newValue) => {
    filters.value.brand = newValue;
    currentFilters.value = {
      ...currentFilters.value,
      brand: newValue,
    };
  },
);
</script>

<style scoped>
.text-muted-foreground {
  color: var(--muted-foreground);
  opacity: 0.7;
}
</style>
