<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Product } from "~/types/product";
import type { User } from "~/types/user";
import Switch from "../ui/switch/Switch.vue";
import MultiCheckboxDropdown from "../ui/MultiCheckboxDropdown.vue";

const props = defineProps<{
  isOpen: boolean;
  coupon: {
    id: number;
    code: string;
    discountType: "PERCENTAGE" | "FIXED";
    discountValue: number;
    isGlobal: boolean;
    usageLimit: number;
    expiryDate: Date;
    productIds: number[];
    userIds: number[];
  };
}>();

const emit = defineEmits<{
  "update:isOpen": [value: boolean];
  submit: [
    coupon: {
      id: number;
      code: string;
      discountType: "PERCENTAGE" | "FIXED";
      discountValue: number;
      isGlobal: boolean;
      usageLimit: number;
      expiryDate: Date;
      productIds: number[];
      userIds: number[];
    },
  ];
}>();

const formData = ref<{
  id: number;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  isGlobal: boolean;
  usageLimit: number;
  expiryDate: string;
  productIds: string[];
  userIds: string[];
}>({
  id: 0,
  code: "",
  discountType: "PERCENTAGE",
  discountValue: 0,
  isGlobal: false,
  usageLimit: 0,
  expiryDate: new Date().toISOString().split("T")[0],
  productIds: [],
  userIds: [],
});

const { t } = useI18n();

const discountValueError = computed((): string => {
  if (!formData.value.discountValue) return "";
  return formData.value.discountValue <= 0 ? t("DISCOUNTS.DISCOUNT_VALUE_ERROR") : "";
});

const usageLimitError = computed((): string => {
  if (!formData.value.usageLimit) return "";
  return formData.value.usageLimit <= 0 ? t("DISCOUNTS.USAGE_LIMIT_ERROR") : "";
});

const expiryDateError = computed((): string => {
  if (!formData.value.expiryDate) return "";
  return formData.value.expiryDate <= new Date().toISOString().split("T")[0] ? t("DISCOUNTS.EXPIRY_DATE_ERROR") : "";
});

const isValidForm = computed(() => {
  return (
    formData.value.code &&
    formData.value.discountType &&
    formData.value.discountValue &&
    formData.value.usageLimit &&
    formData.value.expiryDate
  );
});

const products = ref<Product[]>([]);
const users = ref<User[]>([]);

const fetchProducts = async () => {
  const response = await $api<Product[]>("/products");
  products.value = response;
};

const fetchUsers = async () => {
  const response = await $api<User[]>("/users");
  users.value = response;
};

onMounted(async () => {
  await fetchProducts();
  await fetchUsers();
});

watch(
  () => props.coupon,
  (newCoupon) => {
    if (newCoupon) {
      formData.value = {
        id: newCoupon.id,
        code: newCoupon.code || "",
        discountType: newCoupon.discountType || "PERCENTAGE",
        discountValue: newCoupon.discountValue || 0,
        isGlobal: newCoupon.isGlobal || false,
        usageLimit: newCoupon.usageLimit || 0,
        expiryDate: newCoupon.expiryDate
          ? new Date(newCoupon.expiryDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        productIds: newCoupon.productIds.map(String),
        userIds: newCoupon.userIds.map(String),
      };
    }
  },
  { immediate: true },
);

const handleSubmit = () => {
  if (isValidForm.value) {
    const dataToSubmit = {
      id: formData.value.id,
      code: formData.value.code,
      discountType: formData.value.discountType,
      discountValue: formData.value.discountValue,
      isGlobal: formData.value.isGlobal,
      usageLimit: formData.value.usageLimit,
      expiryDate: new Date(formData.value.expiryDate),
      productIds: formData.value.productIds.map(Number),
      userIds: formData.value.userIds.map(Number),
    };
    emit("submit", dataToSubmit);
  }
};

const closeModal = (value: boolean) => {
  emit("update:isOpen", value);
};
</script>

<template>
  <Dialog :open="isOpen" @update:open="closeModal">
    <DialogContent class="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>{{ props.coupon ? t("DISCOUNTS.UPDATE_COUPON") : t("DISCOUNTS.ADD_COUPON") }}</DialogTitle>
      </DialogHeader>
      <div class="grid gap-6 py-4">
        <div class="space-y-4">
          <div>
            <Label>{{ t("DISCOUNTS.CODE") }}</Label>
            <Input v-model="formData.code" :placeholder="t('DISCOUNTS.CODE_PLACEHOLDER')" class="mt-2" />
          </div>

          <div>
            <Label>{{ t("DISCOUNTS.DISCOUNT_TYPE") }}</Label>
            <Select v-model="formData.discountType">
              <SelectTrigger>
                <SelectValue :placeholder="t('DISCOUNTS.SELECT_DISCOUNT_TYPE')" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PERCENTAGE">{{ t("DISCOUNTS.PERCENTAGE") }}</SelectItem>
                <SelectItem value="FIXED">{{ t("DISCOUNTS.FIXED") }}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{{ t("DISCOUNTS.DISCOUNT_VALUE") }}</Label>
            <Input
              v-model="formData.discountValue"
              type="number"
              :placeholder="t('DISCOUNTS.VALUE')"
              :class="['mt-2', discountValueError ? 'border-red-500' : '']"
            />
            <p v-if="discountValueError" class="text-sm text-red-500 mt-1">
              {{ discountValueError }}
            </p>
            <p v-else class="text-sm text-gray-500 mt-1">Format attendu : 100</p>
          </div>

          <div>
            <Label>{{ t("DISCOUNTS.USAGE_LIMIT") }}</Label>
            <Input v-model="formData.usageLimit" type="number" :placeholder="t('DISCOUNTS.LIMIT')" class="mt-2" />
            <p v-if="usageLimitError" class="text-sm text-red-500 mt-1">
              {{ usageLimitError }}
            </p>
          </div>

          <div>
            <Label class="flex items-center gap-2">
              {{ t("DISCOUNTS.GLOBAL") }}
              <Switch v-model:checked="formData.isGlobal" :default-checked="formData.isGlobal" class="ml-2" />
            </Label>
          </div>

          <div>
            <Label>{{ t("DISCOUNTS.EXPIRY_DATE") }}</Label>
            <Input v-model="formData.expiryDate" type="date" class="mt-2" />
            <p v-if="expiryDateError" class="text-sm text-red-500 mt-1">
              {{ expiryDateError }}
            </p>
          </div>

          <div>
            <Label>{{ t("DISCOUNTS.PRODUCTS") }}</Label>
            <MultiCheckboxDropdown
              v-model="formData.productIds"
              :items="products.map((p) => ({ id: p.id.toString(), label: p.name }))"
              :label="t('DISCOUNTS.PRODUCTS')"
              :placeholder="t('DISCOUNTS.SELECT_PRODUCTS')"
            />
          </div>

          <div>
            <Label>{{ t("DISCOUNTS.USERS") }}</Label>
            <MultiCheckboxDropdown
              v-model="formData.userIds"
              :items="
                users.map((u) => ({
                  id: u.id.toString(),
                  label: `${u.firstName} ${u.lastName}`,
                }))
              "
              :label="t('DISCOUNTS.USERS')"
              :placeholder="t('DISCOUNTS.SELECT_USERS')"
            />
          </div>
        </div>

        <div class="flex justify-end space-x-4">
          <Button variant="outline" @click="closeModal(false)"> {{ t("MODALS.CANCEL") }} </Button>
          <Button
            type="submit"
            :disabled="!isValidForm"
            class="bg-gray-600 hover:bg-gray-700"
            @click.prevent="handleSubmit"
          >
            {{ props.coupon ? t("MODALS.UPDATE") : t("MODALS.ADD") }}
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
