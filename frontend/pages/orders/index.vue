<template>
  <div class="flex-1">
    <div class="container mx-auto px-8 py-6">
      <div class="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
        <h2 class="text-4xl font-bold text-gray-900">{{ t("ORDER.ORDERS") }}</h2>
        <div class="flex gap-4">
          <!-- Group deletion button -->
          <Button
            v-if="Object.keys(rowSelection).length > 0"
            variant="destructive"
            class="flex items-center"
            @click="handleBulkDelete"
          >
            <Trash2Icon class="mr-2 h-4 w-4" />
            {{ t("BUTTON.DELETE") }} ({{ Object.keys(rowSelection).length }})
          </Button>

          <!-- Create order button -->
          <Button variant="default" @click="showCreateModal = true">
            <PlusIcon class="mr-2 h-4 w-4" />
            {{ t("BUTTON.CREATE_ORDER") }}
          </Button>

          <!-- Filter button -->
          <Button variant="outline" @click="openFilterModal">
            <SlidersHorizontalIcon class="mr-2 h-4 w-4" />
            {{ t("BUTTON.FILTER") }} {{ activeFiltersCount > 0 ? `(${activeFiltersCount})` : "" }}
          </Button>
        </div>
      </div>

      <!-- Orders table -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <OrderDataTable :data="invoices" :columns="columns" :table="table" />
      </div>

      <!-- Deletion confirmation dialog -->
      <DeleteConfirmationDialog
        :is-open="showDeleteDialog"
        :message="deleteMessage"
        @confirm="confirmDelete"
        @update:is-open="showDeleteDialog = $event"
      />

      <!-- Filter modal (Suspense) -->
      <Suspense>
        <FilterOrderModal
          v-if="isFilterModalOpen"
          :is-open="isFilterModalOpen"
          :saved-filters="currentFilters"
          @update:is-open="updateFilterModalState"
          @filter="handleFilter"
          @reset="handleFilterReset"
        />
      </Suspense>

      <!-- Update modal -->
      <UpdateOrderModal
        v-if="isUpdateModalOpen"
        v-model:is-open="isUpdateModalOpen"
        :order="selectedOrder || undefined"
        @submit="handleUpdateSubmit"
      />

      <!-- Create order modal -->
      <CreateOrderModal v-model:is-open="showCreateModal" @refresh="fetchInvoices" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { Button } from "@/components/ui/button";
import { SlidersHorizontalIcon, Trash2Icon, PlusIcon } from "lucide-vue-next";
import { useToast } from "@/components/ui/toast/use-toast";
import OrderDataTable from "@/components/Order/data-table.vue";
import DeleteConfirmationDialog from "@/components/ui/dialog/DeleteConfirmationDialog.vue";
import FilterOrderModal from "@/components/Order/FilterOrderModal.vue";
import UpdateOrderModal from "@/components/Order/UpdateOrderModal.vue";
import CreateOrderModal from "@/components/Order/CreateOrderModal.vue";
import { $api } from "@/utils/apiService";
import { createColumns } from "@/components/Order/columns";
import {
  useVueTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
  type Updater,
} from "@tanstack/vue-table";
import type { Order, OrderFilters } from "~/types/order";

const invoices = ref<Order[]>([]);
const isLoading = ref(true);
const isFilterModalOpen = ref(false);

const { t } = useI18n();

const showDeleteDialog = ref(false);
const deleteMessage = ref("");
const rowSelection = ref<RowSelectionState>({});
const sorting = ref<SortingState>([]);

const currentFilters = ref<OrderFilters>({
  orderNumber: "",
  buyer: "",
  dateRange: {
    from: "",
    to: "",
  },
  amount: {
    min: "",
    max: "",
  },
  status: "all",
  productsCount: {
    min: "",
    max: "",
  },
});

const { toast } = useToast();

const isUpdateModalOpen = ref(false);
const selectedOrder = ref<Order | null>(null);
const showCreateModal = ref(false);

const activeFiltersCount = computed(() => {
  if (!currentFilters.value) return 0;
  let count = 0;
  if (currentFilters.value.orderNumber) count++;
  if (currentFilters.value.buyer) count++;
  if (currentFilters.value.dateRange?.from || currentFilters.value.dateRange?.to) count++;
  if (currentFilters.value.amount?.min || currentFilters.value.amount?.max) count++;
  if (currentFilters.value.status && currentFilters.value.status !== "all") count++;
  if (currentFilters.value.productsCount?.min || currentFilters.value.productsCount?.max) count++;
  return count;
});

const downloadInvoice = async (id: string) => {
  try {
    const response = await $api(`/invoices/${id}/pdf`, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response as BlobPart]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `facture_${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch {
    toast({
      title: t("ERRORS.ERROR"),
      description: t("ERRORS.DOWNLOAD_INVOICE_ERROR"),
      variant: "destructive",
    });
  }
};

const showUpdateModal = (order: Order) => {
  selectedOrder.value = order;
  isUpdateModalOpen.value = true;
};

const columns = createColumns({
  downloadInvoice,
  showUpdateModal,
}) as ColumnDef<Order>[];

const table = useVueTable<Order>({
  get data() {
    return invoices.value;
  },
  get columns() {
    return columns;
  },
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  enableRowSelection: true,
  enableMultiRowSelection: true,
  state: {
    get sorting() {
      return sorting.value;
    },
    get rowSelection() {
      return rowSelection.value;
    },
  },
  onSortingChange: (updaterOrValue: Updater<SortingState>) => {
    sorting.value = typeof updaterOrValue === "function" ? updaterOrValue(sorting.value) : updaterOrValue;
  },
  onRowSelectionChange: (updaterOrValue: Updater<RowSelectionState>) => {
    rowSelection.value = typeof updaterOrValue === "function" ? updaterOrValue(rowSelection.value) : updaterOrValue;
  },
});

const fetchInvoices = async () => {
  try {
    isLoading.value = true;
    const data = await $api("/invoices");
    invoices.value = Array.isArray(data) ? data : [];
  } catch {
    toast({
      title: t("ERRORS.ERROR"),
      description: t("ERRORS.LOAD_ORDERS_ERROR"),
      variant: "destructive",
    });
  } finally {
    isLoading.value = false;
  }
};

const resetFilters = async () => {
  try {
    isLoading.value = true;
    const data = await $api("/invoices");
    invoices.value = Array.isArray(data) ? data : [];
    currentFilters.value = {
      orderNumber: "",
      buyer: "",
      dateRange: {
        from: "",
        to: "",
      },
      amount: {
        min: "",
        max: "",
      },
      status: "all",
      productsCount: {
        min: "",
        max: "",
      },
    };
  } catch {
    toast({
      title: t("ERRORS.ERROR"),
      description: t("ERRORS.LOAD_ORDERS_ERROR"),
      variant: "destructive",
    });
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  resetFilters();
});

const openFilterModal = () => {
  isFilterModalOpen.value = true;
};

const updateFilterModalState = (value: boolean) => {
  if (!value) {
    setTimeout(() => {
      isFilterModalOpen.value = value;
    }, 100);
  } else {
    isFilterModalOpen.value = value;
  }
};

const handleFilter = (filters: OrderFilters) => {
  currentFilters.value = { ...filters };
  const filtered = invoices.value.filter((invoice) => {
    if (filters.orderNumber && !invoice.orderNumber.toLowerCase().includes(filters.orderNumber.toLowerCase())) {
      return false;
    }
    if (filters.buyer && invoice.user.id !== parseInt(filters.buyer, 10)) {
      return false;
    }
    if (filters.dateRange.from) {
      const fromDate = new Date(filters.dateRange.from);
      const invoiceDate = new Date(invoice.created_at);
      if (invoiceDate < fromDate) return false;
    }
    if (filters.dateRange.to) {
      const toDate = new Date(filters.dateRange.to);
      const invoiceDate = new Date(invoice.created_at);
      if (invoiceDate > toDate) return false;
    }
    if (filters.amount.min && invoice.amount < parseFloat(filters.amount.min)) {
      return false;
    }
    if (filters.amount.max && invoice.amount > parseFloat(filters.amount.max)) {
      return false;
    }
    if (filters.status && filters.status !== "all" && invoice.status !== filters.status) {
      return false;
    }
    const productsCount = invoice.products.length;
    if (filters.productsCount.min && productsCount < parseInt(filters.productsCount.min)) {
      return false;
    }
    if (filters.productsCount.max && productsCount > parseInt(filters.productsCount.max)) {
      return false;
    }
    return true;
  });
  invoices.value = filtered;
};

const handleFilterReset = () => {
  resetFilters();
};

const handleBulkDelete = () => {
  const count = Object.keys(rowSelection.value).length;
  deleteMessage.value = `Êtes-vous sûr de vouloir supprimer ${count} commande${count > 1 ? "s" : ""} ?`;
  showDeleteDialog.value = true;
};

const confirmDelete = async () => {
  try {
    const selectedIds = Object.keys(rowSelection.value).map((index) => {
      const row = table.getRowModel().rows[Number(index)];
      return row.original.id;
    });
    await Promise.all(selectedIds.map((id) => $api(`/invoices/${id}`, { method: "DELETE" })));
    await fetchInvoices();
    rowSelection.value = {};
    toast({
      title: t("ORDER.SUCCESS"),
      description: t("ORDER.DELETE_ORDERS_SUCCESS"),
    });
  } catch {
    toast({
      title: t("ERRORS.ERROR"),
      description: t("ERRORS.DELETE_ORDERS_ERROR"),
      variant: "destructive",
    });
  } finally {
    showDeleteDialog.value = false;
  }
};

const handleUpdateSubmit = async (updatedOrder: Order) => {
  try {
    isLoading.value = true;
    await $api(`/invoices/${updatedOrder.id}`, {
      method: "PUT",
      body: JSON.stringify(updatedOrder),
    });
    await resetFilters();
    toast({
      title: t("ORDER.SUCCESS"),
      description: t("ORDER.UPDATE_ORDER_SUCCESS"),
    });
  } catch {
    toast({
      title: t("ERRORS.ERROR"),
      description: t("ERRORS.UPDATE_ORDER_ERROR"),
      variant: "destructive",
    });
  } finally {
    isLoading.value = false;
    isUpdateModalOpen.value = false;
  }
};
</script>
