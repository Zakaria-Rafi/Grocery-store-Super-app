<template>
  <Dialog :open="isOpen" @update:open="$emit('update:isOpen', $event)">
    <DialogContent class="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Créer une commande</DialogTitle>
      </DialogHeader>

      <div class="grid gap-4 py-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="grid gap-2">
            <Label for="date">Date</Label>
            <Input id="date" v-model="formData.created_at" type="datetime-local" />
          </div>
          <div class="grid gap-2">
            <Label for="status">Statut</Label>
            <Select v-model="formData.status">
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">En attente</SelectItem>
                <SelectItem value="CANCELLED">Annulé</SelectItem>
                <SelectItem value="PARTIALLY_REFUNDED">Partiellement remboursé</SelectItem>
                <SelectItem value="REFUNDED">Remboursé</SelectItem>
                <SelectItem value="PAID">Payé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="grid gap-2">
          <Label>Utilisateur</Label>
          <Select v-model="formData.userId">
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un utilisateur" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="user in users" :key="user.id" :value="user.id.toString()">
                {{ user.email }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="grid gap-2">
          <Label>Produits</Label>
          <div class="border rounded-md p-4">
            <div
              :class="{
                'max-h-[250px] overflow-y-auto pr-2': formData.products.length > 3,
              }"
            >
              <div v-for="(product, index) in formData.products" :key="index" class="flex items-center gap-4 mb-2">
                <div class="flex-1">
                  <div v-if="product.product" class="px-3 py-2 border rounded-md bg-background">
                    {{ product.product.name }} - {{ formatPrice(product.product.price) }}
                  </div>
                  <div v-else style="position: relative">
                    <Input
                      v-model="product.search"
                      class="w-full"
                      placeholder="Rechercher un produit..."
                      @focus="showProductList(index)"
                    />
                    <div v-show="activeIndex === index && showingProductList" class="products-dropdown">
                      <div
                        v-for="p in availableProducts"
                        :key="p.id"
                        class="dropdown-item"
                        @mousedown="selectProduct(p, index)"
                      >
                        {{ p.name }} - {{ formatPrice(p.price) }}
                      </div>
                    </div>
                  </div>
                </div>

                <Input v-model="product.quantity" type="number" class="w-24" min="1" />
                <Button variant="destructive" size="icon" @click="removeProduct(index)">
                  <XIcon class="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button variant="outline" class="w-full mt-4" @click="addProduct">
              <PlusIcon class="mr-2 h-4 w-4" />
              Ajouter un produit
            </Button>
          </div>
        </div>

        <div class="flex justify-between items-center">
          <div>
            <p class="text-sm text-muted-foreground">Total produits: {{ totalProducts }}</p>
            <p class="text-lg font-medium">Montant total: {{ formatPrice(totalAmount) }}</p>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="$emit('update:isOpen', false)"> Annuler </Button>
        <Button type="submit" @click="handleSubmit"> Créer </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from "vue";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { XIcon, PlusIcon } from "lucide-vue-next";
import { formatPrice } from "@/utils/formatters";
import { $api } from "@/utils/apiService";
import { useToast } from "@/components/ui/toast/use-toast";
import type { User } from "~/types/user";
import type { Product } from "~/types/product";
import type { OrderProduct } from "~/types/order";

const { toast } = useToast();

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits(["update:isOpen", "refresh"]);

const users = ref<User[]>([]);
const availableProducts = ref<Product[]>([]);

const initFormData = () => ({
  created_at: new Date().toISOString().slice(0, 16),
  status: "pending",
  userId: "",
  products: [
    {
      productId: 0,
      quantity: 1,
      product: null,
      search: "",
      showList: false,
    },
  ] as OrderProduct[],
});

const formData = ref(initFormData());

const showingProductList = ref(false);
const activeIndex = ref(-1);

// Charger les utilisateurs et produits
onMounted(async () => {
  try {
    const [usersData, productsData] = await Promise.all([$api<User[]>("/users"), $api<Product[]>("/products")]);
    users.value = usersData;
    availableProducts.value = productsData;
  } catch {
    toast({
      title: "Erreur",
      description: "Impossible de charger les données",
      variant: "destructive",
    });
  }
});

// Gestion de la liste des produits
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (target.tagName === "INPUT" || target.closest(".products-dropdown")) {
    return;
  }
  showingProductList.value = false;
};

const showProductList = (index: number) => {
  nextTick(() => {
    if (activeIndex.value !== index) {
      showingProductList.value = false;
    }

    activeIndex.value = index;
    showingProductList.value = true;
  });
};

const selectProduct = (selectedProduct: Product, index: number) => {
  formData.value.products[index].productId = selectedProduct.id;
  formData.value.products[index].product = selectedProduct;
  formData.value.products[index].search = selectedProduct.name;
  showingProductList.value = false;
  activeIndex.value = -1;
};

const addProduct = () => {
  formData.value.products.push({
    productId: 0,
    quantity: 1,
    product: null,
    search: "",
    showList: false,
  });
};

const removeProduct = (index: number) => {
  if (formData.value.products.length > 1) {
    formData.value.products.splice(index, 1);
  } else {
    toast({
      title: "Attention",
      description: "Une commande doit avoir au moins un produit",
      variant: "destructive",
    });
  }
};

// Calculs des totaux
const totalProducts = computed(() => {
  return formData.value.products.reduce((sum, p) => sum + Number(p.quantity), 0);
});

const totalAmount = computed(() => {
  return formData.value.products.reduce((sum, p) => {
    const product = p.product || availableProducts.value.find((prod) => prod.id === p.productId);
    return sum + (product ? product.price * p.quantity : 0);
  }, 0);
});

// Gestion des événements de clic en dehors
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});

// Réinitialiser le formulaire quand on ouvre la modal
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      formData.value = initFormData();
    }
  },
);

const handleSubmit = async () => {
  if (formData.value.userId === "") {
    toast({
      title: "Erreur",
      description: "Veuillez sélectionner un utilisateur",
      variant: "destructive",
    });
    return;
  }

  if (!formData.value.products.every((p) => p.productId && p.quantity > 0)) {
    toast({
      title: "Erreur",
      description: "Veuillez vérifier les produits et leurs quantités",
      variant: "destructive",
    });
    return;
  }

  try {
    await $api("/invoices", {
      method: "POST",
      body: JSON.stringify({
        userId: Number(formData.value.userId),
        created_at: formData.value.created_at,
        status: formData.value.status,
        products: formData.value.products.map((p) => ({
          productId: p.productId,
          quantity: p.quantity,
        })),
      }),
    });

    toast({
      title: "Succès",
      description: "La commande a été créée",
    });

    emit("update:isOpen", false);
    formData.value = initFormData();
    emit("refresh");
  } catch {
    toast({
      title: "Erreur",
      description: "Impossible de créer la commande",
      variant: "destructive",
    });
  }
};
</script>

<style scoped>
.products-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  margin-top: 4px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  max-height: 200px;
  overflow-y: auto;
  z-index: 999;
}

.dropdown-item {
  padding: 8px 12px;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: #f7f7f7;
}

/* Personnaliser la barre de défilement */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #e2e8f0 transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #e2e8f0;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: #cbd5e1;
}
</style>
