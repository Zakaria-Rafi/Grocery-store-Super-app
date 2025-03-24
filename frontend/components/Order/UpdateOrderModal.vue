<template>
  <Dialog :open="isOpen" @update:open="$emit('update:isOpen', $event)">
    <DialogContent class="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Modifier la commande</DialogTitle>
        <DialogDescription> Modifier les détails de la commande {{ order?.orderNumber }} </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="grid gap-2">
            <Label for="date">Date</Label>
            <Input id="date" v-model="formData.created_at" type="datetime-local" />
          </div>
          <div class="grid gap-2">
            <Label for="status">Statut</Label>
            <Select :v-model="formData.status.toUpperCase()">
              <SelectTrigger>
                <SelectValue :placeholder="order?.status" />
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
          <Label>Produits</Label>
          <div class="border rounded-md p-4">
            <div :class="{ 'max-h-[300px]': totalProducts >= 5 }">
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
        <div class="flex justify-between items-center border-t pt-4">
          <div>
            <p class="text-sm text-muted-foreground">Total produits: {{ totalProducts }}</p>
            <p class="text-lg font-medium">Montant total: {{ formatPrice(totalAmount) }}</p>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="$emit('update:isOpen', false)"> Annuler </Button>
        <Button type="submit" @click="handleSubmit"> Enregistrer </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { XIcon, PlusIcon } from "lucide-vue-next";
import { formatPrice } from "@/utils/formatters";
import { $api } from "@/utils/apiService";
import { useToast } from "@/components/ui/toast/use-toast";
import type { Product, Product as ProductType } from "~/types/product";
import type { Order } from "~/types/order";

interface OrderProduct {
  productId: string;
  quantity: number;
  product?: ProductType | null;
  search?: string;
  showList?: boolean;
}

interface FormData {
  created_at: string;
  status: string;
  products: OrderProduct[];
}

const { toast } = useToast();

const props = defineProps<{
  isOpen: boolean;
  order?: Order;
}>();

const emit = defineEmits(["update:isOpen", "submit"]);

const availableProducts = ref<Product[]>([]);
const formData = ref<FormData>({
  created_at: "",
  status: "",
  products: [],
});

const filteredProducts = ref<Product[]>([]);

const fetchProducts = async () => {
  try {
    const products = await $api<Product[]>("/products");
    availableProducts.value = products;
    filteredProducts.value = products;
  } catch {
    toast({
      title: "Erreur",
      description: "Impossible de charger la liste des produits",
      variant: "destructive",
    });
  }
};

watch(
  () => props.order,
  (newOrder) => {
    if (newOrder) {
      formData.value = {
        created_at: new Date(newOrder.created_at).toISOString().slice(0, 19).replace("T", " "),
        status: newOrder.status,
        products: newOrder.products.map((p: OrderProduct) => ({
          productId: p.product?.id.toString() || "",
          quantity: p.quantity,
          product: p.product,
        })),
      };
    }
  },
  { immediate: true },
);

watch(
  () => props.isOpen,
  async (isOpen) => {
    if (isOpen && availableProducts.value.length === 0) {
      await fetchProducts();
    }
  },
);

const addProduct = () => {
  formData.value.products.push({
    productId: "",
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

const totalProducts = computed(() => formData.value.products.reduce((sum, p) => sum + Number(p.quantity), 0));

const totalAmount = computed(() =>
  formData.value.products.reduce((sum, p) => {
    const product = p.product || availableProducts.value.find((prod) => prod.id === Number(p.productId));
    return sum + (product ? product.price * p.quantity : 0);
  }, 0),
);

const showingProductList = ref(false);
const activeIndex = ref(-1);

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
    if (availableProducts.value.length === 0) {
      fetchProducts();
    }
  });
};

const selectProduct = (selectedProduct: ProductType, index: number) => {
  formData.value.products[index].productId = String(selectedProduct.id);
  formData.value.products[index].product = selectedProduct;
  formData.value.products[index].search = selectedProduct.name;
  showingProductList.value = false;
  activeIndex.value = -1;
};

const handleSubmit = () => {
  if (!formData.value.products.every((p) => p.productId && p.quantity > 0)) {
    toast({
      title: "Erreur",
      description: "Veuillez vérifier les produits et leurs quantités",
      variant: "destructive",
    });
    return;
  }
  emit("submit", {
    id: props.order?.id,
    ...formData.value,
    amount: totalAmount.value,
  });
  emit("update:isOpen", false);
};

watch(
  () => formData.value.products,
  (products) => {
    products.forEach((p: OrderProduct) => {
      if (p.productId && !p.product) {
        p.product = availableProducts.value.find((prod: ProductType) => prod.id === Number(p.productId));
      }
    });
  },
  { deep: true },
);

watch(
  () => availableProducts.value,
  (products) => {
    filteredProducts.value = products;
  },
  { immediate: true },
);

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});
onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
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
</style>
