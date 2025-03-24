<template>
  <Teleport to="body">
    <Dialog :open="isOpen" @update:open="$emit('update:is-open', $event)">
      <DialogContent class="sm:max-w-[425px]" @close="closeModal(false)">
        <DialogHeader>
          <DialogTitle>Filtrer les commandes</DialogTitle>
          <DialogDescription> Appliquez des filtres pour affiner votre recherche </DialogDescription>
        </DialogHeader>

        <div class="grid gap-4 py-4">
          <!-- Filtre numéro de commande -->
          <div class="space-y-2">
            <Label>Numéro de commande</Label>
            <div class="relative">
              <Input
                v-model="orderSearch"
                placeholder="Rechercher un numéro..."
                @focus="showOrderResults = true"
                @blur="handleBlur('order')"
              />
              <div
                v-if="showOrderResults && filteredOrders.length > 0"
                class="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg"
              >
                <div
                  v-for="order in filteredOrders"
                  :key="order.id"
                  class="px-4 py-2 cursor-pointer hover:bg-gray-100"
                  @mousedown="selectOrder(order)"
                >
                  {{ order.orderNumber }}
                </div>
              </div>
            </div>
          </div>

          <!-- Filtre acheteur -->
          <div class="grid gap-2">
            <Label>Acheteur</Label>
            <div class="relative">
              <Input
                v-model="buyerSearch"
                placeholder="Rechercher un acheteur..."
                @focus="showBuyerResults = true"
                @blur="handleBlur('buyer')"
              />
              <div
                v-if="showBuyerResults && filteredBuyers.length > 0"
                class="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg"
              >
                <div
                  v-for="buyer in filteredBuyers"
                  :key="buyer.id"
                  class="px-4 py-2 cursor-pointer hover:bg-gray-100"
                  @mousedown="selectBuyer(buyer as User)"
                >
                  {{ buyer.firstName }} {{ buyer.lastName }}
                </div>
              </div>
            </div>
          </div>

          <!-- Période (Dates) -->
          <div class="grid gap-2">
            <Label>Période</Label>
            <div class="flex gap-2">
              <Popover>
                <PopoverTrigger as-child>
                  <Button variant="outline" class="w-full justify-start text-left font-normal">
                    <CalendarIcon class="mr-2 h-4 w-4" />
                    {{
                      filters.dateRange?.from
                        ? format(new Date(filters.dateRange.from.toString()), "yyyy-MM-dd")
                        : "Du..."
                    }}
                  </Button>
                </PopoverTrigger>
                <PopoverContent class="w-auto p-0" align="start">
                  <Calendar
                    v-model="dateFrom"
                    mode="single"
                    :selected="dateFrom"
                    @update:model-value="
                      (date) => {
                        dateFrom = date;
                        filters.dateRange.from = date?.toString();
                      }
                    "
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger as-child>
                  <Button variant="outline" class="w-full justify-start text-left font-normal">
                    <CalendarIcon class="mr-2 h-4 w-4" />
                    {{
                      filters.dateRange?.to ? format(new Date(filters.dateRange.to.toString()), "yyyy-MM-dd") : "Au..."
                    }}
                  </Button>
                </PopoverTrigger>
                <PopoverContent class="w-auto p-0" align="start">
                  <Calendar
                    v-model="dateTo"
                    mode="single"
                    :selected="dateTo"
                    @update:model-value="
                      (date) => {
                        dateTo = date;
                        filters.dateRange.to = date?.toString();
                      }
                    "
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <!-- Montant -->
          <div class="grid gap-2">
            <Label>Montant</Label>
            <div class="flex gap-2">
              <Input v-model="filters.amount.min" type="number" placeholder="Min" />
              <Input v-model="filters.amount.max" type="number" placeholder="Max" />
            </div>
          </div>

          <!-- Statut -->
          <div class="grid gap-2">
            <Label>Statut</Label>
            <div class="relative">
              <Input
                v-model="statusSearch"
                placeholder="Rechercher un statut..."
                @focus="showStatusResults = true"
                @blur="handleBlur('status')"
              />
              <div
                v-if="showStatusResults && filteredStatuses.length > 0"
                class="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg"
              >
                <div
                  v-for="status in filteredStatuses"
                  :key="status"
                  class="px-4 py-2 cursor-pointer hover:bg-gray-100"
                  @mousedown="selectStatus(status)"
                >
                  {{ status }}
                </div>
              </div>
            </div>
          </div>

          <!-- Nombre de produits -->
          <div class="grid gap-2">
            <Label>Nombre de produits</Label>
            <div class="flex gap-2">
              <Input v-model="filters.productsCount.min" type="number" placeholder="Min" />
              <Input v-model="filters.productsCount.max" type="number" placeholder="Max" />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="handleReset"> Réinitialiser </Button>
          <Button @click="handleApply">
            Filtrer
            <span v-if="activeFiltersCount > 0" class="ml-1 text-xs"> ({{ activeFiltersCount }}) </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from "vue";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-vue-next";
import { format } from "date-fns";
import { useToast } from "@/components/ui/toast/use-toast";
import debounce from "lodash/debounce";
import { $api } from "@/utils/apiService";
import type { Order, OrderFilters, OrderFiltersForm } from "~/types/order";
import type { User } from "~/types/user";

/**
 * PROPS ET EVENTS
 */
const props = defineProps<{
  isOpen: boolean;
  savedFilters: OrderFilters;
}>();

const emit = defineEmits<{
  "update:is-open": [value: boolean];
  filter: [filters: OrderFilters];
  reset: [];
}>();

const { toast } = useToast();

/**
 * ÉTAT LOCAL DES FILTRES
 */
// Déclaration temporaire
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DateValue = any;

const orderSearch = ref("");
const buyerSearch = ref("");
const dateFrom = ref<DateValue>(undefined);
const dateTo = ref<DateValue>(undefined);

const filters = ref<OrderFiltersForm>({
  orderNumber: props.savedFilters.orderNumber || "",
  buyer: "",
  dateRange: {
    from: props.savedFilters.dateRange?.from || undefined,
    to: props.savedFilters.dateRange?.to || undefined,
  },
  amount: { min: "", max: "" },
  status: "Tous les statuts",
  productsCount: { min: "", max: "" },
});

// Données et listes filtrées
const orders = ref<Order[]>([]);
const filteredOrders = ref<Order[]>([]);

const buyers = ref<User[]>([]);
const filteredBuyers = ref<User[]>([]);

// Indique si buyers est chargé
const buyersAreLoaded = ref(false);

// Contrôle d'affichage des listes de suggestions
const showOrderResults = ref(false);
const showBuyerResults = ref(false);

// Ajouter les refs pour la recherche de statut
const statusSearch = ref("");
const showStatusResults = ref(false);
const filteredStatuses = ref<string[]>([]);
const availableStatuses = computed(() => {
  // Extraire les statuts uniques des commandes
  const uniqueStatuses = new Set(orders.value.map((order) => order.status));
  return Array.from(uniqueStatuses);
});

/**
 * FERMETURE DE LA MODAL
 */
const closeModal = (value: boolean) => {
  emit("update:is-open", value);
};

/**
 * RÉINITIALISER LES FILTRES
 */
const resetLocalFilters = () => {
  filters.value = {
    orderNumber: "",
    buyer: "",
    dateRange: { from: undefined, to: undefined },
    amount: { min: "", max: "" },
    status: "all",
    productsCount: { min: "", max: "" },
  };
  orderSearch.value = "";
  buyerSearch.value = "";
  statusSearch.value = "";
  showOrderResults.value = false;
  showBuyerResults.value = false;
  showStatusResults.value = false;
};

/**
 * WATCH MULTIPLE : On attend ET savedFilters, ET buyersAreLoaded
 */
watch(
  () => props.savedFilters,
  (newFilters) => {
    if (newFilters) {
      filters.value = {
        orderNumber: newFilters.orderNumber || "",
        buyer: newFilters.buyer || "",
        dateRange: {
          from: newFilters.dateRange.from || undefined,
          to: newFilters.dateRange.to || undefined,
        },
        amount: {
          min: newFilters.amount.min || "",
          max: newFilters.amount.max || "",
        },
        status: newFilters.status || "all",
        productsCount: {
          min: newFilters.productsCount.min || "",
          max: newFilters.productsCount.max || "",
        },
      };
      orderSearch.value = newFilters.orderNumber || "";
      statusSearch.value = newFilters.status || "";
    }
  },
  { immediate: true, deep: true },
);

/**
 * CHARGEMENT INITIAL (API) : Récupérer les commandes et acheteurs
 */
onMounted(async () => {
  try {
    // Charger la liste de commandes
    const allOrders = await fetchOrders();
    orders.value = allOrders;

    // Charger la liste des acheteurs
    const users = await fetchUsers();
    buyers.value = users;

    // On signale que buyers est prêt
    buyersAreLoaded.value = true;

    // Initialiser les statuts filtrés avec tous les statuts disponibles
    filteredStatuses.value = availableStatuses.value;
  } catch {
    toast({
      title: "Erreur lors du chargement des données",
      description: "Veuillez réessayer plus tard",
      variant: "destructive",
    });
  }
});

async function fetchOrders() {
  // Appel API réel
  const data = await $api("/invoices");
  return Array.isArray(data) ? data : [];
}

async function fetchUsers() {
  const data = await $api("/users");
  return Array.isArray(data) ? data : [];
}

/**
 * GESTION DE LA RECHERCHE PAR "orderSearch"
 */
watch(
  orderSearch,
  debounce((search: string) => {
    if (!search) {
      filteredOrders.value = [];
    } else {
      const lowerSearch = search.toLowerCase();
      filteredOrders.value = orders.value.filter((o) => String(o.orderNumber).toLowerCase().includes(lowerSearch));
    }
    filters.value.orderNumber = search;
  }, 200),
);

/**
 * GESTION DE LA RECHERCHE PAR "buyerSearch"
 */
watch(
  buyerSearch,
  debounce((search: string) => {
    if (!search) {
      filteredBuyers.value = [];
    } else {
      const lowerSearch = search.toLowerCase();
      filteredBuyers.value = buyers.value.filter((b) =>
        `${b.firstName} ${b.lastName}`.toLowerCase().includes(lowerSearch),
      );
    }
  }, 200),
);

/**
 * GESTION DE LA RECHERCHE PAR "statusSearch"
 */
watch(
  statusSearch,
  debounce((search: string) => {
    // Toujours montrer tous les statuts disponibles quand on commence à taper
    filteredStatuses.value = availableStatuses.value.filter((status) => {
      if (!search) return true;
      return status.toLowerCase().includes(search.toLowerCase());
    });

    filters.value.status = search;
  }, 200),
);

/**
 * SÉLECTIONNER UN RÉSULTAT
 */
const selectOrder = (order: Order) => {
  orderSearch.value = order.orderNumber;
  filters.value.orderNumber = order.orderNumber;
  showOrderResults.value = false;
};

const selectBuyer = (buyer: User) => {
  buyerSearch.value = buyer.firstName + " " + buyer.lastName;
  filters.value.buyer = buyer.id;
  showBuyerResults.value = false;
};

const selectStatus = (status: string) => {
  statusSearch.value = status;
  filters.value.status = status;
  // Réinitialiser la liste filtrée avec tous les statuts disponibles
  filteredStatuses.value = availableStatuses.value;
  showStatusResults.value = false;
};

/**
 * GÉRER LE BLUR (laisser le clic se faire avant de cacher la liste)
 */
const handleBlur = (field: "order" | "buyer" | "status") => {
  setTimeout(() => {
    if (field === "order") {
      showOrderResults.value = false;
    } else if (field === "buyer") {
      showBuyerResults.value = false;
    } else if (field === "status") {
      showStatusResults.value = false;
    }
  }, 200);
};

/**
 * COMPTER LES FILTRES ACTIFS
 */
const activeFiltersCount = computed(() => {
  let count = 0;
  if (filters.value.orderNumber) count++;
  if (filters.value.buyer) count++;
  if (filters.value.dateRange.from || filters.value.dateRange.to) count++;
  if (filters.value.amount.min || filters.value.amount.max) count++;
  if (filters.value.status && filters.value.status !== "all") count++;
  if (filters.value.productsCount.min || filters.value.productsCount.max) count++;
  return count;
});

/**
 * GÉRER LES BOUTONS
 */
const handleReset = () => {
  resetLocalFilters();
  emit("reset");
};

const handleApply = () => {
  try {
    const formattedFilters = {
      orderNumber: filters.value.orderNumber,
      buyer: String(filters.value.buyer),
      dateRange: {
        from: filters.value.dateRange.from?.toString() || "",
        to: filters.value.dateRange.to?.toString() || "",
      },
      amount: {
        min: filters.value.amount.min,
        max: filters.value.amount.max,
      },
      status: filters.value.status,
      productsCount: {
        min: filters.value.productsCount.min,
        max: filters.value.productsCount.max,
      },
    };
    emit("filter", formattedFilters);
    closeModal(false);
  } catch (error) {
    toast({
      title: "Erreur :" + error,
      description: "Veuillez réessayer plus tard",
      variant: "destructive",
    });
  }
};
</script>

<style scoped>
:deep(.dialog-overlay) {
  z-index: 50;
}
:deep(.dialog-content) {
  z-index: 51;
}
</style>
