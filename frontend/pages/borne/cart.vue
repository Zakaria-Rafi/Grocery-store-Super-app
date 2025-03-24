<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center p-8">
    <div v-if="cart && cart.items.length === 0" class="text-center">
      <p class="text-xl text-gray-600 mb-4">{{ t("KIOSK.CART_EMPTY") }}</p>
      <Button class="bg-gray-900 hover:bg-gray-800 text-white" @click="navigateTo('/borne')">
        {{ t("BUTTON.BACK_TO_SCAN") }}
      </Button>
    </div>

    <div v-else-if="cart" class="bg-white rounded-xl shadow-lg max-w-2xl w-full">
      <InvoiceSummary :cart="cart" :jwt="jwt" @update:cart="getCartItems" />
      <div v-if="isCouponApplied" class="text-green-600 mt-4 text-center">
        {{ t("KIOSK.COUPON_APPLIED") }} : {{ appliedCouponCode }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { Cart } from "~/models/borne/cart-model";
import InvoiceSummary from "../../components/Borne/invoice-summary.vue";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { ref, onMounted } from "vue";

definePageMeta({
  layout: "blank",
  auth: false,
});

const cartId = useRoute().query.cartId;
const jwt = useRoute().query.jwt;
const cart = ref(null);
const isCouponApplied = ref(false);
const appliedCouponCode = ref("");
const { toast } = useToast();
const { t } = useI18n();

const getCartItems = async () => {
  try {
    const response = await $api(`cart/${cartId}`, {
      method: "GET",
    });

    // Transformation en Cart
    cart.value = Cart.fromJson(response);

    if (cart.value.items.length === 0) {
      toast({
        title: "Panier vide",
        description: "Votre panier ne contient aucun produit",
        variant: "destructive",
      });
      navigateTo("/borne");
    }
  } catch {
    toast({
      title: "Erreur",
      description: "Impossible de charger le panier",
      variant: "destructive",
    });
    navigateTo("/borne");
  }
};

// Charger les données du panier au montage du composant
onMounted(() => {
  getCartItems();
});
</script>
