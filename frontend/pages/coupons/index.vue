<template>
  <div>
    <div class="container mx-auto px-8">
      <div class="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
        <h2 class="text-4xl font-bold text-gray-900">Gestion des coupons</h2>
        <div class="flex gap-4">
          <Button
            v-if="Object.keys(rowSelection).length > 0"
            variant="destructive"
            class="flex items-center"
            @click="handleBulkDelete"
          >
            <Trash2Icon class="mr-2 h-4 w-4" />
            Supprimer ({{ Object.keys(rowSelection).length }})
          </Button>

          <Button variant="outline" @click="showCreateModal = true">
            <PlusIcon class="mr-2 h-4 w-4" />
            Ajouter un coupon
          </Button>

          <Button variant="outline" @click="openFilterModal">
            <SlidersHorizontalIcon class="mr-2 h-4 w-4" />
            Filtrer {{ activeFiltersCount > 0 ? `(${activeFiltersCount})` : "" }}
          </Button>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div v-if="isLoading" class="p-4">
          <Skeleton class="h-4 w-[250px]" />
        </div>
        <Coupons v-else :columns="columns" :data="filteredData" :table="table" :on-update-coupon="openEditModal" />
      </div>

      <DeleteConfirmationDialog
        :is-open="showDeleteDialog"
        :message="deleteMessage"
        @confirm="confirmDelete"
        @update:is-open="showDeleteDialog = $event"
      />

      <Suspense>
        <FilterCouponModal
          v-if="isFilterModalOpen"
          :is-open="isFilterModalOpen"
          :coupons="filteredData"
          :saved-filters="currentFilters"
          @update:is-open="updateFilterModalState"
          @filter="handleFilter"
          @reset="handleFilterReset"
        />
      </Suspense>

      <UpdateCouponModal
        v-model:is-open="showUpdateModal"
        :coupon="selectedCoupon"
        :product-ids="selectedCoupon.productIds"
        :user-ids="selectedCoupon.userIds"
        @submit="handleUpdateCoupon"
        @update:is-open="
          (value) => {
            showUpdateModal = value;
            if (!value) {
              selectedCoupon = defaultCoupon;
            }
          }
        "
      />

      <CreateCouponsModal
        :is-open="showCreateModal"
        :products="products"
        :users="users"
        @update:is-open="showCreateModal = $event"
        @create="handleCreateCoupon"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import DeleteConfirmationDialog from "@/components/Client/DeleteConfirmationDialog.vue";
import { getColumns } from "@/components/Coupons/columns";
import Coupons from "@/components/Coupons/data-table.vue";
import FilterCouponModal from "@/components/Coupons/FilterCouponModal.vue";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast/use-toast";
import { $api } from "@/utils/apiService";
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
  type ColumnDef,
} from "@tanstack/vue-table";
import { PlusIcon, SlidersHorizontalIcon, Trash2Icon } from "lucide-vue-next";
import { computed, onMounted, provide, ref } from "vue";

import type { User } from "@/types/user";
import CreateCouponsModal, { type CreateCouponData } from "~/components/Coupons/CreateCouponsModal.vue";
import UpdateCouponModal from "~/components/Coupons/UpdateCouponModal.vue";
import type { Coupon, FilterOptions, UpdateCouponDto } from "~/types/coupon";
import type { Product } from "~/types/product";

// States
const data = ref<Coupon[]>([]);
const filteredData = ref<Coupon[]>([]);
const isLoading = ref(true);
const { toast } = useToast();

// Modal states
const showUpdateModal = ref(false);
const isFilterModalOpen = ref(false);
const showCreateModal = ref(false);

const defaultCoupon: UpdateCouponDto = {
  id: 0,
  code: "",
  discountType: "PERCENTAGE",
  discountValue: 0,
  isGlobal: false,
  usageLimit: 0,
  expiryDate: new Date(),
  productIds: [],
  userIds: [],
};

const selectedCoupon = ref<UpdateCouponDto>(defaultCoupon);

// Filter logic
const currentFilters = ref<FilterOptions>({
  searchQuery: "",
  code: "",
  discountType: "ALL",
  isGlobal: false,
  usageLimit: 0,
  expiryDate: "",
  products: [],
  users: [],
});

// Fonction pour gérer les filtres
const handleFilter = (filters: FilterOptions) => {
  filteredData.value = data.value.filter((coupon: Coupon) => {
    let matches = true;

    if (filters.code) {
      matches = matches && coupon.code.toLowerCase().includes(filters.code.toLowerCase());
    }

    if (filters.discountType !== "ALL") {
      matches = matches && coupon.discountType === filters.discountType;
    }

    if (filters.isGlobal !== undefined) {
      matches = matches && coupon.isGlobal === filters.isGlobal;
    }

    if (filters.usageLimit) {
      matches = matches && coupon.usageLimit === filters.usageLimit;
    }

    if (filters.expiryDate) {
      const couponDate = new Date(coupon.expiryDate).toISOString().split("T")[0];
      matches = matches && couponDate === filters.expiryDate;
    }

    return matches;
  });

  currentFilters.value = { ...filters };
  pagination.value.pageIndex = 0;
};

const handleFilterReset = () => {
  currentFilters.value = {
    searchQuery: "",
    code: "",
    discountType: "ALL",
    isGlobal: false,
    usageLimit: 0,
    expiryDate: "",
    products: [],
    users: [],
  };
  filteredData.value = data.value;
  pagination.value.pageIndex = 0;
};

const activeFiltersCount = computed(() => {
  let count = 0;
  const f = currentFilters.value;

  if (f.searchQuery) count++;
  if (f.code) count++;
  if (f.discountType) count++;
  if (f.isGlobal) count++;
  if (f.usageLimit) count++;
  if (f.expiryDate) count++;
  if (f.products) count++;
  if (f.users) count++;

  return count;
});

const updateFilterModalState = (value: boolean) => {
  if (!value) {
    setTimeout(() => {
      isFilterModalOpen.value = false;
    }, 100);
  } else {
    isFilterModalOpen.value = value;
  }
};

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
      return row.original.id;
    });
  if (!selectedRows.length) return;

  showDeleteDialog.value = true;
  pendingDeleteIds.value = selectedRows.map(String);
  deleteMessage.value =
    selectedRows.length > 1
      ? "Êtes-vous sûr de vouloir supprimer ces clients ?"
      : "Êtes-vous sûr de vouloir supprimer ce client ?";
};

const confirmDelete = async () => {
  try {
    await Promise.all(pendingDeleteIds.value.map((id) => $api(`/coupons/${id}`, { method: "DELETE" })));
    const response = await $api("/coupons");
    if (Array.isArray(response)) {
      data.value = response.map((coupon: Coupon) => ({
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        isGlobal: coupon.isGlobal,
        usageLimit: coupon.usageLimit,
        expiryDate: coupon.expiryDate,
        products: coupon.products,
        users: coupon.users,
        createdAt: coupon.createdAt,
        updatedAt: coupon.updatedAt,
      }));
    }
    filteredData.value = data.value;
    rowSelection.value = {};
    toast({
      title: "Succès",
      description: "Client(s) supprimé(s) avec succès",
    });
  } catch (error: unknown) {
    let errorMessage = "Erreur lors de la suppression";

    if (
      error &&
      typeof error === "object" &&
      "response" in error &&
      (error as { response: { status: number } }).response?.status
    ) {
      switch ((error as { response: { status: number } }).response.status) {
        case 409:
          errorMessage = "Impossible de supprimer un client ayant des commandes";
          break;
        case 404:
          errorMessage = "Client non trouvé";
          break;
        case 500:
          errorMessage = "Erreur serveur lors de la suppression";
          break;
      }
    }

    toast({
      title: "Erreur",
      description: errorMessage,
      variant: "destructive",
    });
  } finally {
    showDeleteDialog.value = false;
    pendingDeleteIds.value = [];
  }
};

// Table TanStack
const rowSelection = ref({});
const sorting = ref<{ id: string; desc: boolean }[]>([]);
const pagination = ref({
  pageIndex: 0,
  pageSize: 10,
});

// Define columns avec le bon type
const columns = ref<Array<ColumnDef<Coupon, unknown>>>(getColumns());

const table = useVueTable<Coupon>({
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
      return {
        pageIndex: pagination.value.pageIndex,
        pageSize: 10,
      };
    },
  },
  enableSorting: true,
  enableRowSelection: true,
  manualPagination: false,
  onSortingChange: (updater) => {
    sorting.value = typeof updater === "function" ? updater(sorting.value) : updater;
  },
  onRowSelectionChange: (updater) => {
    rowSelection.value = typeof updater === "function" ? updater(rowSelection.value) : updater;
  },
  onPaginationChange: (updater) => {
    pagination.value = typeof updater === "function" ? updater(pagination.value) : updater;
  },
});

// Function to open edit modal
const openEditModal = (coupon: Coupon) => {
  selectedCoupon.value = {
    id: coupon.id,
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    isGlobal: coupon.isGlobal,
    usageLimit: coupon.usageLimit,
    expiryDate: coupon.expiryDate,
    productIds: coupon.products.map((product) => product.id),
    userIds: coupon.users.map((user) => user.id),
  };
  showUpdateModal.value = true;
};

// Provide functions to columns
provide("openEditModal", openEditModal);

// Initial data load
onMounted(async () => {
  try {
    isLoading.value = true;
    const response = await $api("/coupons");

    if (Array.isArray(response)) {
      data.value = response.map((coupon: Coupon) => ({
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        isGlobal: coupon.isGlobal,
        usageLimit: coupon.usageLimit,
        expiryDate: coupon.expiryDate,
        products: coupon.products,
        users: coupon.users,
        createdAt: coupon.createdAt,
        updatedAt: coupon.updatedAt,
      }));
      filteredData.value = data.value;
      pagination.value.pageIndex = 0;
    }
  } catch {
    toast({
      title: "Erreur",
      description: "Erreur lors du chargement des clients",
      variant: "destructive",
    });
    data.value = [];
    filteredData.value = [];
  } finally {
    isLoading.value = false;
  }
});

// Ajouter la fonction de création
const handleCreateCoupon = async (couponData: CreateCouponData) => {
  try {
    await $api("/coupons", {
      method: "POST",
      body: JSON.stringify(couponData),
    });

    // Rafraîchir la liste des clients
    const response = await $api("/coupons");
    if (Array.isArray(response)) {
      data.value = response.map((coupon: Coupon) => ({
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        isGlobal: coupon.isGlobal,
        usageLimit: coupon.usageLimit,
        expiryDate: coupon.expiryDate,
        products: coupon.products,
        users: coupon.users,
        createdAt: coupon.createdAt,
        updatedAt: coupon.updatedAt,
      }));
      filteredData.value = data.value;
    }

    toast({
      title: "Succès",
      description: "Client créé avec succès",
    });

    showCreateModal.value = false;
  } catch {
    toast({
      title: "Erreur",
      description: "Erreur lors de la création du client",
      variant: "destructive",
    });
  }
};

// Update client
const handleUpdateCoupon = async (coupon: UpdateCouponDto) => {
  try {
    await $api(`/coupons/${coupon.id}`, {
      method: "PUT",
      body: JSON.stringify(coupon),
    });

    // Mettre à jour localement
    data.value = data.value.map((c) => (c.id === coupon.id ? { ...c, ...coupon } : c));
    filteredData.value = data.value;

    toast({
      title: "Succès",
      description: "Coupon modifié avec succès",
    });
    showUpdateModal.value = false;
  } catch {
    toast({
      title: "Erreur",
      description: "Erreur lors de la modification du coupon",
      variant: "destructive",
    });
  }
};

const products = ref<Product[]>([]);
const users = ref<User[]>([]);

const loadData = async () => {
  try {
    const [productsData, usersData] = await Promise.all([$api("/products"), $api("/users")]);
    products.value = productsData as Product[];
    users.value = usersData as User[];
  } catch {
    toast({
      title: "Erreur",
      description: "Erreur lors du chargement des données",
      variant: "destructive",
    });
  }
};

onMounted(loadData);
</script>
