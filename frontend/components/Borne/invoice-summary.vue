<!-- eslint-disable vue/html-self-closing -->
<template>
  <div class="bg-white rounded-lg p-6 shadow-sm">
    <h2 class="text-xl font-bold mb-4">{{ t("KIOSK.INVOICE_SUMMARY") }}</h2>

    <div v-if="!cart" class="flex items-center justify-center h-[400px]">
      <div class="animate-spin h-8 w-8 border-4 border-gray-900 rounded-full border-t-transparent" />
    </div>

    <template v-else>
      <!-- Cart Items -->
      <div class="h-[300px] overflow-y-auto mb-6 pr-2">
        <div class="space-y-2">
          <!-- Header row for column titles -->
          <div
            class="flex justify-between items-center w-full border-b-2 border-gray-300 py-2 text-sm font-semibold text-gray-600"
          >
            <div class="flex-1">Produit</div>
            <div class="w-28 text-center">Prix</div>
            <div class="w-16 text-center">Quantité</div>
            <div class="w-28 text-right">Total</div>
          </div>

          <div v-for="(item, index) in cart.items" :key="index">
            <div class="flex justify-between items-start w-full border-b border-gray-200 py-[12px]">
              <div class="flex gap-4 flex-1 min-w-0">
                <div
                  class="w-[45px] h-[45px] bg-gray-100 rounded flex-shrink-0 flex items-center justify-center overflow-hidden"
                >
                  <img
                    v-if="getFirstImage(item.product.imagesUrl)"
                    :src="getFirstImage(item.product.imagesUrl)"
                    class="w-full h-full object-cover"
                    :alt="item.product.name"
                  />
                  <PackageIcon v-else class="w-6 h-6 text-gray-400" />
                </div>
                <div class="flex flex-col gap-1 min-w-0">
                  <p class="text-[14px] font-bold truncate">{{ item.product.name }}</p>
                  <p v-if="item.product.variant" class="text-[12px] text-gray-500">{{ item.product.variant }}</p>
                </div>
              </div>

              <!-- Unit price with tax details -->
              <div class="w-28 text-center flex flex-col">
                <p class="text-[12px] text-gray-500">HT: {{ formatPrice(getPriceBeforeTax(item.product.price)) }} €</p>
                <p class="text-[12px] text-gray-500">TVA: {{ formatPrice(getTaxAmount(item.product.price)) }} €</p>
                <p class="text-[14px]">TTC: {{ formatPrice(item.product.price) }} €</p>
              </div>

              <!-- Quantity -->
              <div class="w-16 text-center">
                <p class="text-[14px]">{{ item.quantity }}</p>
              </div>

              <!-- Total price for this item with tax details -->
              <div class="w-28 text-right flex flex-col items-end">
                <div v-if="item.discountAmount && parseFloat(item.discountAmount) > 0">
                  <p class="text-[14px] line-through text-gray-500">{{ formatPrice(item.priceBeforeDiscount) }} €</p>
                  <p class="text-[14px] font-bold">{{ formatPrice(item.totalPrice) }} €</p>
                  <p class="text-[12px] text-green-600">-{{ formatPrice(item.discountAmount) }} €</p>
                </div>
                <div v-else>
                  <p class="text-[14px] font-bold">{{ formatPrice(item.totalPrice) }} €</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Coupon section -->
      <div class="flex gap-2 mb-4">
        <Input v-model="couponCode" placeholder="Code promo" :disabled="isCouponApplied" class="flex-1" />
        <Button v-if="isCouponApplied" variant="destructive" size="icon" @click="removeCoupon">
          <XIcon class="h-4 w-4" />
        </Button>
        <Button v-else class="bg-gray-900 text-white" @click="onCouponApply"> Appliquer </Button>
      </div>

      <!-- Order summary -->
      <div class="space-y-4 pt-4 border-t border-gray-200">
        <div class="flex justify-between">
          <span class="text-gray-600">{{ t("KIOSK.SUBTOTAL") }}</span>
          <span>{{ formatPrice(subtotalBeforeTax) }} €</span>
        </div>

        <div class="flex justify-between">
          <span class="text-gray-600">{{ t("KIOSK.TAX") }}</span>
          <span>{{ formatPrice(totalTax) }} €</span>
        </div>

        <div class="flex justify-between">
          <span class="text-gray-600">{{ t("KIOSK.SUBTOTAL") }}</span>
          <span>{{ formatPrice(subtotalBeforeDiscount) }} €</span>
        </div>

        <div v-if="totalDiscount > 0" class="flex justify-between text-green-600">
          <span>{{ t("KIOSK.DISCOUNT") }} {{ cart.coupon ? ` (${cart.coupon.code})` : "" }}</span>
          <span>-{{ formatPrice(totalDiscount) }} €</span>
        </div>

        <!-- Add shipping costs if applicable -->
        <div v-if="shippingCost > 0" class="flex justify-between">
          <span class="text-gray-600">Frais de livraison</span>
          <span>{{ formatPrice(shippingCost) }} €</span>
        </div>

        <div class="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
          <span>{{ t("KIOSK.TOTAL_AMOUNT") }}</span>
          <span>{{ formatPrice(cart.totalPrice) }} €</span>
        </div>
      </div>

      <!-- Payment buttons -->
      <div class="mt-6 space-y-3">
        <Button class="w-full bg-blue-400 hover:bg-blue-500 text-white h-12" @click="payWithPaypal">
          {{ t("KIOSK.PAYMENT_METHOD") }}
        </Button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { XIcon, PackageIcon } from "lucide-vue-next";
import { useToast } from "@/components/ui/toast";
import { watch, onMounted, ref, computed } from "vue";

import type { CartItem } from "~/models/borne/cart-item";

const { toast } = useToast();
const { t } = useI18n();

const emit = defineEmits(["update:cart"]);

const props = defineProps({
  cart: {
    type: Object,
    required: true,
  },
  jwt: {
    type: String,
    required: true,
  },
});

// Taux de TVA (20% par défaut)
const VAT_RATE = 0.2;

const couponCode = ref("");
const isCouponApplied = ref(false);
const shippingCost = ref(0); // Add shipping cost if needed

// Format price to always show 2 decimal places
const formatPrice = (price: number) => {
  const numericPrice = Number(price);
  return isNaN(numericPrice) ? "0.00" : numericPrice.toFixed(2);
};
// Calculer le prix HT à partir du prix TTC
const getPriceBeforeTax = (priceWithTax: number) => {
  return priceWithTax / (1 + VAT_RATE);
};

// Calculer le montant de la TVA
const getTaxAmount = (priceWithTax: number) => {
  return priceWithTax - getPriceBeforeTax(priceWithTax);
};

// Vérifier si un coupon est appliqué lors du montage du composant
onMounted(() => {
  checkAppliedCoupon();
});

const checkAppliedCoupon = () => {
  if (props.cart && props.cart.items) {
    // Vérifier si le panier a un coupon global
    if (props.cart.coupon) {
      isCouponApplied.value = true;
      couponCode.value = props.cart.coupon.code;
    }

    // Vérifier les articles avec des coupons
    const itemsWithCoupon = props.cart.items.filter(
      (item: CartItem) =>
        item.appliedCouponCode !== null && item.appliedCouponCode !== undefined && item.appliedCouponCode !== "",
    );

    if (itemsWithCoupon.length > 0 && !props.cart.coupon) {
      isCouponApplied.value = true;
      couponCode.value = itemsWithCoupon[0].appliedCouponCode;
    } else if (!props.cart.coupon) {
      // Réinitialiser si aucun coupon n'est trouvé
      isCouponApplied.value = false;
      couponCode.value = "";
    }
  }
};

watch(
  () => props.cart,
  () => {
    checkAppliedCoupon();
  },
  { immediate: true, deep: true },
);

// Calcul du sous-total HT
const subtotalBeforeTax = computed(() => {
  if (!props.cart?.items) return 0;
  return props.cart.items.reduce((sum: number, item: CartItem) => {
    const itemTotal = parseFloat(item.totalPrice);
    return sum + itemTotal / (1 + VAT_RATE);
  }, 0);
});

// Calcul de la TVA totale
const totalTax = computed(() => {
  if (!props.cart?.items) return 0;
  return props.cart.items.reduce((sum: number, item: CartItem) => {
    const itemTotal = parseFloat(item.totalPrice);
    return sum + (itemTotal - itemTotal / (1 + VAT_RATE));
  }, 0);
});

// Calcul du sous-total avant réduction
const subtotalBeforeDiscount = computed(() => {
  if (!props.cart?.items) return 0;
  return props.cart.items.reduce((sum: number, item: CartItem) => {
    const priceBeforeDiscount = item.priceBeforeDiscount
      ? typeof item.priceBeforeDiscount === "string"
        ? parseFloat(item.priceBeforeDiscount)
        : item.priceBeforeDiscount
      : Number(item.product.price) * item.quantity;
    return sum + priceBeforeDiscount;
  }, 0);
});

// Calcul de la réduction totale
const totalDiscount = computed(() => {
  if (!props.cart?.items) return 0;
  return props.cart.items.reduce((sum: number, item: CartItem) => {
    const discountAmount = item.discountAmount
      ? typeof item.discountAmount === "string"
        ? parseFloat(item.discountAmount)
        : item.discountAmount
      : 0;
    return sum + discountAmount;
  }, 0);
});

const getFirstImage = (imagesUrl: string | string[]) => {
  if (!imagesUrl) return null;
  if (typeof imagesUrl === "string" && imagesUrl.startsWith("[")) {
    try {
      const parsed = JSON.parse(imagesUrl);
      return parsed[0] || null;
    } catch {
      return null;
    }
  }
  if (Array.isArray(imagesUrl)) {
    return imagesUrl[0] || null;
  }
  if (typeof imagesUrl === "string") {
    return imagesUrl;
  }
  return null;
};

const onCouponApply = async () => {
  try {
    if (!couponCode.value || !props.jwt) {
      toast({
        title: "Erreur",
        description: "Code coupon manquant",
        variant: "destructive",
      });
      return;
    }

    const response = await $api("/cart/apply-coupon", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + props.jwt,
      },
      body: {
        couponCode: couponCode.value,
      },
    });

    // Mise à jour du panier - correction du problème
    if (response) {
      // Émettre l'événement pour mettre à jour le panier dans le composant parent
      emit("update:cart", response);

      // Mise à jour de l'état local
      isCouponApplied.value = true;

      toast({
        title: "Succès",
        description: "Coupon appliqué avec succès",
        variant: "success",
      });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    toast({
      title: "Erreur",
      description: error?.response?.data?.message || "Impossible d'appliquer le coupon",
      variant: "destructive",
    });
  }
};

const removeCoupon = async () => {
  try {
    if (!props.jwt) {
      toast({
        title: "Erreur",
        description: "Authentification manquante",
        variant: "destructive",
      });
      return;
    }

    const response = await $api("cart/remove-coupon", {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + props.jwt,
      },
    });

    // Mise à jour du panier - correction du problème
    if (response) {
      // Émettre l'événement pour mettre à jour le panier dans le composant parent
      emit("update:cart", response);

      // Mise à jour de l'état local
      isCouponApplied.value = false;
      couponCode.value = "";

      toast({
        title: "Succès",
        description: "Coupon supprimé avec succès",
        variant: "success",
      });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    toast({
      title: "Erreur",
      description: error?.response?.data?.message || "Impossible de supprimer le coupon",
      variant: "destructive",
    });
  }
};

const payWithPaypal = async () => {
  try {
    const result = await $api<{ approvalUrl: string }>("cart/checkout", {
      method: "POST",
      body: {
        paymentMethod: "paypal",
      },
      headers: {
        Authorization: "Bearer " + props.jwt,
      },
    });

    if (result.approvalUrl) {
      window.location.href = result.approvalUrl;
    }
  } catch (error) {
    toast({
      title: "Erreur",
      description: "Impossible de procéder au paiement : " + error,
      variant: "destructive",
    });
  }
};
</script>

<style scoped>
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #e5e7eb transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 2px;
}

.overflow-y-auto:not(:hover)::-webkit-scrollbar-thumb {
  background-color: transparent;
}
</style>
