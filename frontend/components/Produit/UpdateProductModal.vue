<template>
  <Dialog :open="isOpen" @update:open="$emit('update:isOpen', $event)">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{{ product ? t("PRODUCT.UPDATE_PRODUCT") : t("PRODUCT.SCAN_BARCODE") }}</DialogTitle>
        <DialogDescription>
          {{ product ? t("PRODUCT.UPDATE_PRODUCT_INFO") : t("PRODUCT.SCAN_BARCODE_INFO") }}
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-4 py-4">
        <div v-if="!product" class="space-y-2">
          <Label>{{ t("PRODUCT.EAN") }}</Label>
          <Input v-model="eanCode" placeholder="Ex: 12345678" :min-length="8" />
        </div>

        <div v-if="product" class="grid gap-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>{{ t("PRODUCT.STOCK") }}</Label>
              <Input v-model="formData.stock" type="number" min="0" />
            </div>
            <div class="space-y-2">
              <Label>{{ t("PRODUCT.TAX_RATE") }}</Label>
              <Input v-model="formData.taxRate" type="number" step="0.1" placeholder="TVA" />
            </div>
          </div>

          <div class="grid gap-2">
            <Label>{{ t("PRODUCT.PRICE_BEFORE_TAX") }}</Label>
            <Input v-model="formData.priceBeforeTax" type="number" step="0.01" placeholder="Prix HT" />
            <Label>{{ t("PRODUCT.FINAL_PRICE") }}</Label>
            <Input
              v-model="formData.price"
              type="number"
              step="0.01"
              :disabled="true"
              class="bg-gray-100 text-gray-600"
              placeholder="Prix TTC"
            />
          </div>

          <div class="space-y-2">
            <Label>{{ t("PRODUCT.CATALOG_STATUS") }}</Label>
            <Select
              v-model="formData.userSetStatus"
              :disabled="formData.stock <= 0 || formData.priceBeforeTax <= 0"
              :class="{
                'opacity-50': formData.stock <= 0 || formData.priceBeforeTax <= 0,
              }"
            >
              <SelectTrigger>
                <SelectValue :placeholder="formData.catalogStatus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Actif">{{ t("PRODUCT.ACTIVE") }}</SelectItem>
                <SelectItem value="Inactif">{{ t("PRODUCT.INACTIVE") }}</SelectItem>
              </SelectContent>
            </Select>
            <span class="text-xs text-gray-500 mt-1">
              {{
                formData.stock <= 0 || formData.priceBeforeTax <= 0
                  ? t("PRODUCT.CATALOG_STATUS_DESCRIPTION")
                  : t("PRODUCT.CATALOG_STATUS_DESCRIPTION_2")
              }}
            </span>
          </div>

          <div class="space-y-2">
            <Label>{{ t("PRODUCT.DESCRIPTION") }}</Label>
            <Textarea v-model="formData.description" :placeholder="t('PRODUCT.DESCRIPTION_PLACEHOLDER')" />
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="$emit('update:isOpen', false)"> {{ t("BUTTON.CANCEL") }} </Button>
        <Button type="submit" :disabled="!isValidForm" @click="handleSubmit">
          {{ product ? t("BUTTON.SAVE") : t("BUTTON.SEARCH") }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import type { Product, ProductEanSubmit } from "@/types/product";

const props = defineProps<{
  product: Product | null;
  isOpen: boolean;
}>();

const { t } = useI18n();

const emit = defineEmits<{
  "update:isOpen": [value: boolean];
  submit: [product: Product | ProductEanSubmit];
}>();

const eanCode = ref("");
const formData = ref({
  name: "",
  description: "",
  price: "",
  stock: 0,
  barcode: "",
  brand: "",
  ingredients: "",
  allergens: "",
  nutritionalValues: "",
  priceBeforeTax: 0,
  taxRate: 0,
  catalogStatus: "Actif",
  userSetStatus: "Actif",
});

watch(
  () => props.product,
  (newProduct) => {
    if (newProduct) {
      formData.value = {
        name: newProduct.name || "",
        description: newProduct.description || "",
        price: newProduct.price ? newProduct.price.toString() : "",
        stock: newProduct.stock || 0,
        barcode: newProduct.ean || "",
        brand: newProduct.brand || "",
        ingredients: newProduct.ingredients || "",
        allergens: newProduct.allergens || "",
        nutritionalValues: newProduct.nutritionalValues || "",
        priceBeforeTax: newProduct.taxRate
          ? Number((newProduct.price / (1 + newProduct.taxRate / 100)).toFixed(2))
          : Number(newProduct.price) || 0,
        taxRate: Number(newProduct.taxRate) || 0,
        catalogStatus: newProduct.stock <= 0 || newProduct.price <= 0 ? "Inactif" : newProduct.catalogStatus || "Actif",
        userSetStatus: newProduct.stock <= 0 || newProduct.price <= 0 ? "Inactif" : newProduct.userSetStatus || "Actif",
      };
    }
  },
  { immediate: true },
);

watch([() => formData.value.stock, () => formData.value.priceBeforeTax], ([stock, price]) => {
  const isForceInactive = Number(stock) <= 0 || Number(price) <= 0;
  formData.value.catalogStatus = isForceInactive ? "Inactif" : formData.value.userSetStatus;
});

watch([() => formData.value.priceBeforeTax, () => formData.value.taxRate], ([newPriceBeforeTax, newTaxRate]) => {
  if (newPriceBeforeTax) {
    const priceBeforeTax = Number(newPriceBeforeTax);
    const taxRate = Number(newTaxRate);
    if (!isNaN(priceBeforeTax)) {
      const totalPrice = priceBeforeTax * (1 + taxRate / 100);
      formData.value.price = totalPrice.toFixed(2);
    }
  }
});

const isValidEAN = computed(() => {
  return /^\d{8,}$/.test(eanCode.value);
});

const isValidForm = computed(() => {
  if (!props.product) {
    return isValidEAN.value;
  }
  return formData.value.stock >= 0 && formData.value.priceBeforeTax > 0 && formData.value.taxRate >= 0;
});

const handleSubmit = () => {
  if (!props.product && isValidEAN.value) {
    emit("submit", {
      eanCode: eanCode.value,
      catalogStatus: "Actif" as const,
      userSetStatus: "Actif" as const,
    });
    eanCode.value = "";
  } else if (props.product && isValidForm.value) {
    const { ...rest } = formData.value;

    const dataToSubmit = {
      ...props.product,
      id: props.product.id,
      description: rest.description,
      stock: rest.stock ? parseInt(rest.stock.toString()) : 0,
      priceBeforeTax: rest.priceBeforeTax ? parseFloat(rest.priceBeforeTax.toString()) : 0,
      taxRate: rest.taxRate ? parseFloat(rest.taxRate.toString()) : 0,
      name: rest.name,
      brand: rest.brand,
      barcode: rest.barcode,
      ingredients: rest.ingredients,
      allergens: rest.allergens,
      nutritionalValues: rest.nutritionalValues,
      price: Number(rest.price),
      catalogStatus: rest.catalogStatus as "Actif" | "Inactif",
      userSetStatus: rest.userSetStatus as "Actif" | "Inactif",
    };

    emit("submit", dataToSubmit);
  }
  emit("update:isOpen", false);
};
</script>
