<template>
  <div>
    <div class="container mx-auto px-8">
      <div class="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
        <h2 class="text-4xl font-bold text-gray-900">{{ t("PRODUCT.PRODUCT_CATALOG") }}</h2>
        <div class="flex gap-4">
          <Button
            v-if="Object.keys(rowSelection).length > 0"
            variant="destructive"
            class="flex items-center"
            @click="handleBulkDelete"
          >
            <Trash2Icon class="mr-2 h-4 w-4" />
            {{ t("BUTTON.DELETE") }} ({{ Object.keys(rowSelection).length }})
          </Button>

          <Button variant="outline" @click="showScanModal = true">
            <BarcodeIcon class="mr-2 h-4 w-4" />
            {{ t("BUTTON.ADD_PRODUCT") }}
          </Button>

          <Button variant="outline" @click="openFilterModal">
            <SlidersHorizontalIcon class="mr-2 h-4 w-4" />
            {{ t("BUTTON.FILTER") }} {{ activeFiltersCount > 0 ? `(${activeFiltersCount})` : "" }}
          </Button>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div v-if="isLoading" class="p-4">
          <Skeleton class="h-4 w-[250px]" />
        </div>
        <Produits v-else :columns="columns" :data="filteredData" :table="table" />
      </div>
      <DeleteConfirmationDialog
        :is-open="showDeleteDialog"
        :message="deleteMessage"
        @confirm="confirmDelete"
        @update:is-open="showDeleteDialog = $event"
      />

      <ScanProductModal :is-open="showScanModal" @update:is-open="showScanModal = $event" @scan="handleScanProduct" />

      <Suspense>
        <FilterProductModal
          v-if="isFilterModalOpen"
          :is-open="isFilterModalOpen"
          :saved-filters="currentFilters"
          @update:is-open="updateFilterModalState"
          @filter="handleFilter"
          @reset="handleFilterReset"
        />
      </Suspense>

      <UpdateProductModal
        v-model:is-open="showUpdateModal"
        :product="selectedProduct || null"
        @submit="handleUpdateProduct"
        @update:is-open="
          (value) => {
            showUpdateModal = value;
            if (!value) {
              selectedProduct = null;
            }
          }
        "
      />

      <BarcodeModal :is-open="showBarcodeModal" :barcode="currentBarcode" @update:is-open="showBarcodeModal = $event" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Produits from "@/components/Produit/data-table.vue";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SlidersHorizontalIcon, Trash2Icon, BarcodeIcon } from "lucide-vue-next";
import { ref, onMounted, computed, provide } from "vue";
import { $api } from "@/utils/apiService";
import DeleteConfirmationDialog from "@/components/Produit/DeleteConfirmationDialog.vue";
import FilterProductModal from "@/components/Produit/FilterProductModal.vue";
import ScanProductModal from "@/components/Produit/ScanProductModal.vue";
import UpdateProductModal from "@/components/Produit/UpdateProductModal.vue";
import { useToast } from "@/components/ui/toast/use-toast";
import BarcodeModal from "@/components/Produit/BarcodeModal.vue";
import { getColumns } from "@/components/Produit/columns";
// Table & columns
import { useVueTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel } from "@tanstack/vue-table";
import type { ColumnDef, SortingState, PaginationState, RowSelectionState, Updater } from "@tanstack/vue-table";
import type { Product, ProductEanSubmit, ProductFilters } from "@/types/product";

// States
const data = ref<Product[]>([]);
const filteredData = ref<Product[]>([]);
const isLoading = ref(true);
const { toast } = useToast();
const { t } = useI18n();

// Modal states
const showScanModal = ref(false);
const showUpdateModal = ref(false);
const isFilterModalOpen = ref(false);
const showBarcodeModal = ref(false);
const currentBarcode = ref("");
const selectedProduct = ref<Product | null>(null);

// Stocker les filtres actuels
const currentFilters = ref<ProductFilters>({
  name: "",
  brand: "",
  stockStatus: "all",
  catalogStatus: "all",
  minPrice: "",
  maxPrice: "",
  minStock: "",
  maxStock: "",
});

// Fonction pour gérer les filtres
const handleFilter = (filters: ProductFilters) => {
  currentFilters.value = filters;
  const filtered = data.value.filter((product: Product) => {
    let matches = true;

    // Filter by name
    if (filters.name) {
      matches = matches && product.name.toLowerCase().includes(filters.name.toLowerCase());
    }

    // Filter by brand
    if (filters.brand) {
      matches = matches && product.brand.toLowerCase().includes(filters.brand.toLowerCase());
    }

    // Filter by stock status
    if (filters.stockStatus && filters.stockStatus !== "all") {
      if (filters.stockStatus === "in_stock") {
        matches = matches && product.stock > 0;
      } else if (filters.stockStatus === "out_of_stock") {
        matches = matches && product.stock <= 0;
      }
    }

    // Filter by catalog status
    if (filters.catalogStatus && filters.catalogStatus !== "all") {
      if (filters.catalogStatus === "active") {
        matches = matches && product.catalogStatus === "Actif";
      } else if (filters.catalogStatus === "inactive") {
        matches = matches && product.catalogStatus === "Inactif";
      }
    }

    // Filter by price range
    if (filters.minPrice) {
      matches = matches && product.price >= parseFloat(filters.minPrice);
    }
    if (filters.maxPrice) {
      matches = matches && product.price <= parseFloat(filters.maxPrice);
    }

    // Filter by stock range
    if (filters.minStock) {
      matches = matches && product.stock >= parseInt(filters.minStock);
    }
    if (filters.maxStock) {
      matches = matches && product.stock <= parseInt(filters.maxStock);
    }

    return matches;
  });

  filteredData.value = filtered;
};

// Réinitialiser les filtres
const handleFilterReset = () => {
  currentFilters.value = {
    name: "",
    brand: "",
    stockStatus: "all",
    catalogStatus: "all",
    minPrice: "",
    maxPrice: "",
    minStock: "",
    maxStock: "",
  };
  filteredData.value = data.value;
  pagination.value.pageIndex = 0;
};

// Computed pour le nombre de filtres actifs
const activeFiltersCount = computed(() => {
  if (!currentFilters.value) return 0;
  let count = 0;
  const f = currentFilters.value;

  if (f.name) count++;
  if (f.brand) count++;
  if (f.stockStatus && f.stockStatus !== "all") count++;
  if (f.catalogStatus && f.catalogStatus !== "all") count++;
  if (f.minPrice) count++;
  if (f.maxPrice) count++;
  if (f.minStock) count++;
  if (f.maxStock) count++;

  return count;
});

// Simplifier la gestion de l'état de la modal
const updateFilterModalState = (value: boolean) => {
  if (!value) {
    // Attendre que la transition de fermeture soit terminée
    setTimeout(() => {
      isFilterModalOpen.value = false;
    }, 100);
  } else {
    isFilterModalOpen.value = value;
  }
};

// Open the filter modal
const openFilterModal = () => {
  if (!isFilterModalOpen.value) {
    isFilterModalOpen.value = true;
  }
};

// Bulk Delete
const showDeleteDialog = ref(false);
const deleteMessage = ref("");
const pendingDeleteIds = ref<string[]>([]);

const handleBulkDelete = async () => {
  if (!table) return;
  const selectedRows = Object.entries(table.getState().rowSelection)
    .filter(([_, selected]) => selected)
    .map(([index]) => {
      const row = table.getRowModel().rows[Number(index)];
      const product = row.original;
      const productId = String(product.id);
      return productId.includes("_copy") ? productId.split("_")[0] : productId;
    });
  if (!selectedRows.length) return;

  showDeleteDialog.value = true;
  pendingDeleteIds.value = selectedRows;
  deleteMessage.value =
    selectedRows.length > 1 ? t("MODAL.DELETE_CONFIRMATION_DESCRIPTION") : t("MODAL.DELETE_CONFIRMATION_DESCRIPTION_2");
};

const confirmDelete = async () => {
  try {
    await Promise.all(pendingDeleteIds.value.map((id) => $api(`/products/${id}`, { method: "DELETE" })));
    const products = await $api("/products");
    data.value = Array.isArray(products) ? products : [];
    filteredData.value = data.value;
    rowSelection.value = {};
    toast({
      title: t("PRODUCT.DELETE_SUCCESS"),
      description: t("PRODUCT.DELETE_SUCCESS_DESCRIPTION"),
    });
  } catch {
    toast({
      title: t("ERRORS.ERROR"),
      description: t("ERRORS.DELETE_ERROR"),
      variant: "destructive",
    });
  } finally {
    showDeleteDialog.value = false;
    pendingDeleteIds.value = [];
  }
};

// Update / Scan product
const handleScanProduct = async (eanOrProduct: string | ProductEanSubmit) => {
  try {
    if (typeof eanOrProduct === "string") {
      // Cas du scan de code-barres
      await $api(`/products/barcode/${eanOrProduct}`);
    } else {
      // Cas de la modification
      await $api(`/products/${eanOrProduct.eanCode}`, {
        method: "PATCH",
        body: eanOrProduct,
      });
    }

    // Refresh products list
    const products = await $api<Product[]>("/products");
    // Mettre à jour le statut du catalogue en fonction du stock et du prix
    const updatedProducts = products.map((product: Product) => ({
      ...product,
      catalogStatus: (product.stock <= 0 || product.price <= 0 ? "Inactif" : "Actif") as "Actif" | "Inactif",
    }));
    data.value = Array.isArray(products) ? updatedProducts : [];
    filteredData.value = data.value;

    toast({
      title: t("PRODUCT.SUCCESS"),
      description:
        typeof eanOrProduct === "string" ? t("PRODUCT.ADD_PRODUCT_SUCCESS") : t("PRODUCT.UPDATE_PRODUCT_SUCCESS"),
    });
  } catch {
    toast({
      title: t("ERRORS.ERROR"),
      description: typeof eanOrProduct === "string" ? t("ERRORS.FIND_PRODUCT_ERROR") : t("ERRORS.UPDATE_PRODUCT_ERROR"),
      variant: "destructive",
    });
  }
};

// Fonction pour mettre à jour un produit
const handleUpdateProduct = async (updatedProduct: Product | ProductEanSubmit) => {
  try {
    if ("eanCode" in updatedProduct) {
      await $api(`/products/barcode/${updatedProduct.eanCode}`);
    } else {
      const updateData = {
        name: updatedProduct.name,
        description: updatedProduct.description,
        price: Number(updatedProduct.price) || 0,
        priceBeforeTax: Number(updatedProduct.price) || 0,
        stock: Number(updatedProduct.stock) || 0,
        brand: updatedProduct.brand,
        ean: updatedProduct.barcode,
        taxRate: updatedProduct.taxRate || 0,
      };

      await $api(`/products/${updatedProduct.id}`, {
        method: "PATCH",
        body: JSON.stringify(updateData),
      });
    }

    // Rafraîchir la liste des produits
    const products = await $api("/products");
    if (Array.isArray(products)) {
      data.value = products.map((p: Product) => ({
        ...p,
        price: typeof p.price === "string" ? parseFloat(p.price) : p.price || 0,
        stock: typeof p.stock === "string" ? parseInt(p.stock) : p.stock || 0,
        catalogStatus: (p.stock <= 0 || p.price <= 0 ? "Inactif" : "Actif") as "Actif" | "Inactif",
      }));
      filteredData.value = data.value;
    }

    toast({
      title: t("PRODUCT.SUCCESS"),
      description: t("PRODUCT.UPDATE_PRODUCT_SUCCESS"),
    });
  } catch {
    toast({
      title: t("ERRORS.ERROR"),
      description: t("ERRORS.UPDATE_PRODUCT_ERROR"),
      variant: "destructive",
    });
  } finally {
    showUpdateModal.value = false;
  }
};

onMounted(async () => {
  try {
    isLoading.value = true;
    const response = await $api("/products");

    if (Array.isArray(response)) {
      data.value = response.map((p: Product) => {
        const price = typeof p.price === "string" ? parseFloat(p.price) : p.price;
        const product = {
          ...p,
          price: !isNaN(price) ? price : 0,
          catalogStatus: (p.stock <= 0 || price <= 0 ? "Inactif" : "Actif") as "Actif" | "Inactif",
        };
        return product;
      });

      filteredData.value = data.value;
      pagination.value.pageIndex = 0;
    }
  } catch {
    data.value = [];
    filteredData.value = [];
  } finally {
    isLoading.value = false;
  }
});

// Table TanStack
const rowSelection = ref({});
const sorting = ref<SortingState>([]);
const pagination = ref({
  pageIndex: 0,
  pageSize: 10,
});

// Define columns
const columns = ref<Array<ColumnDef<Product, unknown>>>(getColumns());

const table = useVueTable<Product>({
  get data() {
    return filteredData.value;
  },
  get columns() {
    return columns.value;
  },
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  state: {
    get sorting() {
      return sorting.value;
    },
    get rowSelection() {
      return rowSelection.value;
    },
    get pagination() {
      return pagination.value;
    },
  },
  enableSorting: true,
  enableRowSelection: true,
  manualPagination: true,
  onSortingChange: (updaterOrValue: Updater<SortingState>) => {
    sorting.value = typeof updaterOrValue === "function" ? updaterOrValue(sorting.value) : updaterOrValue;
  },
  onRowSelectionChange: (updaterOrValue: Updater<RowSelectionState>) => {
    rowSelection.value = typeof updaterOrValue === "function" ? updaterOrValue(rowSelection.value) : updaterOrValue;
  },
  onPaginationChange: (updaterOrValue: Updater<PaginationState>) => {
    pagination.value = typeof updaterOrValue === "function" ? updaterOrValue(pagination.value) : updaterOrValue;
  },
});

// Function to open barcode modal
const openBarcodeModal = (barcode: string) => {
  if (barcode) {
    currentBarcode.value = barcode;
    showBarcodeModal.value = true;
  }
};

// Function to open edit modal
const openEditModal = (product: Product) => {
  selectedProduct.value = product;
  showUpdateModal.value = true;
};

// Provide functions to columns
provide("openBarcodeModal", openBarcodeModal);
provide("openEditModal", openEditModal);
</script>
