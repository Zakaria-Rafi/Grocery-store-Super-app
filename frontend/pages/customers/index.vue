<template>
  <div>
    <div class="container mx-auto px-8">
      <div class="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
        <h2 class="text-4xl font-bold text-gray-900">Gestion des clients</h2>
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
            <UserPlusIcon class="mr-2 h-4 w-4" />
            Ajouter un client
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
        <Clients v-else :columns="columns" :data="filteredData" :table="table" />
      </div>

      <DeleteConfirmationDialog
        :is-open="showDeleteDialog"
        :message="deleteMessage"
        @confirm="confirmDelete"
        @update:is-open="showDeleteDialog = $event"
      />

      <Suspense>
        <FilterClientModal
          v-if="isFilterModalOpen"
          :is-open="isFilterModalOpen"
          :saved-filters="currentFilters"
          @update:is-open="updateFilterModalState"
          @filter="handleFilter"
          @reset="handleFilterReset"
        />
      </Suspense>

      <UpdateClientModal
        v-model:is-open="showUpdateModal"
        :client="selectedClient"
        @submit="handleUpdateClient"
        @update:is-open="
          (value) => {
            showUpdateModal = value;
            selectedClient = defaultClient;
          }
        "
      />

      <CreateClientModal
        :is-open="showCreateModal"
        @update:is-open="showCreateModal = $event"
        @create="handleCreateClient"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import CreateClientModal, { type CreateUserData } from "@/components/Client/CreateClientModal.vue";
import DeleteConfirmationDialog from "@/components/Client/DeleteConfirmationDialog.vue";
import FilterClientModal from "@/components/Client/FilterClientModal.vue";
import UpdateClientModal from "@/components/Client/UpdateClientModal.vue";
import { columns as tableColumns } from "@/components/Client/columns";
import Clients from "@/components/Client/data-table.vue";
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
import { SlidersHorizontalIcon, Trash2Icon, UserPlusIcon } from "lucide-vue-next";
import { computed, provide, ref } from "vue";

import type { FilterOptions, UpdateUserDto, User } from "@/types/user";

// States
const data = ref<User[]>([]);
const filteredData = ref<User[]>([]);
const isLoading = ref(true);
const { toast } = useToast();

// Modal states
const showUpdateModal = ref(false);
const isFilterModalOpen = ref(false);
const showCreateModal = ref(false);

const defaultClient: UpdateUserDto = {
  id: 0,
  firstName: "",
  lastName: "",
  email: "",
  role: "user" as const,
};

const selectedClient = ref<UpdateUserDto>(defaultClient);

// Filter logic
const currentFilters = ref<FilterOptions>({
  searchQuery: "",
  role: "all" as "all" | "user" | "admin",
  minOrders: "",
  maxOrders: "",
  minSpent: "",
  maxSpent: "",
  email: "",
});

// Fonction pour gérer les filtres
const handleFilter = (filters: FilterOptions) => {
  filteredData.value = data.value.filter((client: User) => {
    let matches = true;

    // Filtre par prénom
    if (filters.firstName) {
      matches = matches && client.firstName.toLowerCase().includes(filters.firstName.toLowerCase());
    }

    // Filtre par nom
    if (filters.lastName) {
      matches = matches && client.lastName.toLowerCase().includes(filters.lastName.toLowerCase());
    }

    // Filtre par email
    if (filters.email) {
      matches = matches && client.email.toLowerCase().includes(filters.email.toLowerCase());
    }

    // Filter by role
    if (filters.role && filters.role !== "all") {
      matches = matches && client.role === filters.role;
    }

    // Filter by orders count
    if (filters.minOrders) {
      matches = matches && client.orderCount >= parseInt(filters.minOrders);
    }
    if (filters.maxOrders) {
      matches = matches && client.orderCount <= parseInt(filters.maxOrders);
    }

    // Filter by total spent
    if (filters.minSpent) {
      matches = matches && client.totalSpent >= parseFloat(filters.minSpent);
    }
    if (filters.maxSpent) {
      matches = matches && client.totalSpent <= parseFloat(filters.maxSpent);
    }

    return matches;
  });

  currentFilters.value = { ...filters };
  pagination.value.pageIndex = 0;
};

const handleFilterReset = () => {
  currentFilters.value = {
    searchQuery: "",
    role: "all",
    minOrders: "",
    maxOrders: "",
    minSpent: "",
    maxSpent: "",
    email: "",
  };
  filteredData.value = data.value;
  pagination.value.pageIndex = 0;
};

const activeFiltersCount = computed(() => {
  let count = 0;
  const f = currentFilters.value;

  if (f.searchQuery) count++;
  if (f.role && f.role !== "all") count++;
  if (f.minOrders) count++;
  if (f.maxOrders) count++;
  if (f.minSpent) count++;
  if (f.maxSpent) count++;
  if (f.email) count++;

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
    await Promise.all(pendingDeleteIds.value.map((id) => $api(`/users/${id}`, { method: "DELETE" })));
    const response = await $api("/users");
    if (Array.isArray(response)) {
      data.value = response.map((user: User) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
        createdAt: user.createdAt || "",
        updatedAt: user.updatedAt || "",
        orderCount: user.orderCount || 0,
        totalSpent: user.totalSpent || 0,
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
const columns = ref<Array<ColumnDef<User, unknown>>>([...tableColumns]);

const table = useVueTable<User>({
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
  enablePagination: true,
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
const openEditModal = (client: User) => {
  selectedClient.value = {
    id: client.id,
    firstName: client.firstName,
    lastName: client.lastName,
    email: client.email,
    role: client.role,
  };
  showUpdateModal.value = true;
};

// Provide functions to columns
provide("openEditModal", openEditModal);

// Initial data load
onMounted(async () => {
  try {
    isLoading.value = true;
    const response = await $api("/users");

    if (Array.isArray(response)) {
      data.value = response.map((user: User) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
        createdAt: user.createdAt || "",
        updatedAt: user.updatedAt || "",
        orderCount: user.orderCount || 0,
        totalSpent: user.totalSpent || 0,
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
const handleCreateClient = async (userData: CreateUserData) => {
  try {
    await $api("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    // Rafraîchir la liste des clients
    const response = await $api("/users");
    if (Array.isArray(response)) {
      data.value = response.map((user: User) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
        createdAt: user.createdAt || "",
        updatedAt: user.updatedAt || "",
        orderCount: user.orderCount || 0,
        totalSpent: user.totalSpent || 0,
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
const handleUpdateClient = async (client: UpdateUserDto) => {
  try {
    await $api(`/users/${client.id}`, {
      method: "PUT",
      body: JSON.stringify(client),
    });

    // Mettre à jour localement
    data.value = data.value.map((user) => (user.id === client.id ? { ...user, ...client } : user));
    filteredData.value = data.value;

    toast({
      title: "Succès",
      description: "Client modifié avec succès",
    });
    showUpdateModal.value = false;
  } catch {
    toast({
      title: "Erreur",
      description: "Erreur lors de la modification du client",
      variant: "destructive",
    });
  }
};
</script>
