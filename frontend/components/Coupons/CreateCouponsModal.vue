<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MultiCheckboxDropdown from "@/components/ui/MultiCheckboxDropdown.vue";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { computed, ref } from "vue";
import type { Product } from "~/types/product";
import type { User } from "~/types/user";

export interface CreateCouponData {
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  isGlobal: boolean;
  usageLimit: number;
  expiryDate: string;
  products: string[];
  users: string[];
}
const { $i18n } = useNuxtApp();

const props = defineProps<{
  isOpen: boolean;
  products: Product[];
  users: User[];
}>();

const emit = defineEmits<{
  "update:isOpen": [value: boolean];
  create: [couponData: CreateCouponData];
}>();

const formData = ref<CreateCouponData>({
  code: "",
  discountType: "PERCENTAGE",
  discountValue: 0,
  isGlobal: false,
  usageLimit: 1,
  expiryDate: "",
  products: [],
  users: [],
});
const discountValueError = computed((): string => {
  if (!formData.value.discountValue) return "";
  return formData.value.discountValue <= 0 ? $i18n.t("ERRORS.POSITIVE_NUMBER") : "";
});

const usageLimitError = computed((): string => {
  if (!formData.value.usageLimit) return "";
  return formData.value.usageLimit <= 0 ? $i18n.t("ERRORS.POSITIVE_NUMBER") : "";
});

const expiryDateError = computed((): string => {
  if (!formData.value.expiryDate) return "";
  return formData.value.expiryDate <= new Date().toISOString() ? $i18n.t("ERRORS.EXPIRATION_DATE") : "";
});

const isValidForm = computed((): boolean => {
  const code = !!formData.value.code.trim();
  const discountType = !!formData.value.discountType;
  const discountValue = formData.value.discountValue > 0;
  const usageLimit = formData.value.usageLimit >= 0;
  const isGlobal = formData.value.isGlobal;
  const expiryDate = formData.value.expiryDate > new Date().toISOString();
  const products = formData.value.products.length >= 0;
  const users = formData.value.users.length >= 0;

  return code && discountType && discountValue && usageLimit && expiryDate && products && users && isGlobal;
});

const handleSubmit = (): void => {
  if (!isValidForm.value) return;
  emit("create", formData.value);
  closeModal(false);
};

const closeModal = (value: boolean): void => {
  emit("update:isOpen", value);
};

const productsForDropdown = computed(() =>
  props.products.map((product) => ({
    id: product.id.toString(),
    label: product.name,
  })),
);

const usersForDropdown = computed(() =>
  props.users.map((user) => ({
    id: user.id.toString(),
    label: `${user.firstName} ${user.lastName}`,
  })),
);
</script>

<template>
  <Dialog :open="isOpen" @update:open="closeModal">
    <DialogContent class="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>{{ $i18n.t("DISCOUNTS.ADD_COUPON") }}</DialogTitle>
        <DialogDescription> {{ $i18n.t("DISCOUNTS.FILL_INFO") }} </DialogDescription>
      </DialogHeader>
      <form @submit.prevent="handleSubmit">
        <div class="grid gap-6 py-4">
          <div class="space-y-4">
            <div>
              <Label>{{ $i18n.t("DISCOUNTS.CODE") }}</Label>
              <Input v-model="formData.code" :placeholder="$i18n.t('DISCOUNTS.CODE_PLACEHOLDER')" class="mt-2" />
              <p class="text-sm text-gray-500 mt-1">{{ $i18n.t("ERRORS.REQUIRED_FIELD") }}</p>
            </div>

            <div>
              <Label>{{ $i18n.t("DISCOUNTS.DISCOUNT_TYPE") }}</Label>
              <Select v-model="formData.discountType" default-value="PERCENTAGE">
                <SelectTrigger>
                  <SelectValue :placeholder="$i18n.t('DISCOUNTS.SELECT_DISCOUNT_TYPE')" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">{{ $i18n.t("DISCOUNTS.PERCENTAGE") }}</SelectItem>
                  <SelectItem value="FIXED">{{ $i18n.t("DISCOUNTS.FIXED") }}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{{ $i18n.t("DISCOUNTS.DISCOUNT_VALUE") }}</Label>
              <Input
                v-model="formData.discountValue"
                type="number"
                :placeholder="$i18n.t('DISCOUNTS.DISCOUNT_VALUE_PLACEHOLDER')"
                :class="['mt-2', discountValueError ? 'border-red-500' : '']"
              />
              <p v-if="discountValueError" class="text-sm text-red-500 mt-1">
                {{ discountValueError }}
              </p>
              <p v-else class="text-sm text-gray-500 mt-1">{{ $i18n.t("DISCOUNTS.EXPECTED_FORMAT") }}</p>
            </div>

            <div class="flex items-center gap-2">
              <Label>{{ $i18n.t("DISCOUNTS.IS_GLOBAL") }}</Label>
              <Switch v-model:checked="formData.isGlobal" class="mt-2" />
            </div>

            <div>
              <Label>{{ $i18n.t("DISCOUNTS.USAGE_LIMIT") }}</Label>
              <Input
                v-model="formData.usageLimit"
                type="number"
                :placeholder="$i18n.t('DISCOUNTS.USAGE_LIMIT_PLACEHOLDER')"
                :class="['mt-2', usageLimitError ? 'border-red-500' : '']"
              />
              <p v-if="usageLimitError" class="text-sm text-red-500 mt-1">
                {{ usageLimitError }}
              </p>
              <p v-else class="text-sm text-gray-500 mt-1">{{ $i18n.t("DISCOUNTS.EXPECTED_FORMAT") }}</p>
            </div>

            <div>
              <Label>{{ $i18n.t("DISCOUNTS.EXPIRATION_DATE") }}</Label>
              <Input
                v-model="formData.expiryDate"
                type="date"
                :placeholder="$i18n.t('DISCOUNTS.EXPIRATION_DATE_PLACEHOLDER')"
                :class="['mt-2', expiryDateError ? 'border-red-500' : '']"
              />
              <p v-if="expiryDateError" class="text-sm text-red-500 mt-1">
                {{ expiryDateError }}
              </p>
              <p v-else class="text-sm text-gray-500 mt-1">{{ $i18n.t("DISCOUNTS.EXPECTED_FORMAT") }}</p>
            </div>

            <div v-if="!formData.isGlobal">
              <Label>{{ $i18n.t("DISCOUNTS.PRODUCTS") }}</Label>
              <MultiCheckboxDropdown
                v-model="formData.products"
                :items="productsForDropdown"
                :label="$i18n.t('DISCOUNTS.PRODUCTS')"
                :placeholder="$i18n.t('DISCOUNTS.SELECT_PRODUCTS')"
              />
            </div>

            <div v-if="!formData.isGlobal">
              <Label>{{ $i18n.t("DISCOUNTS.USERS") }}</Label>
              <MultiCheckboxDropdown
                v-model="formData.users"
                :items="usersForDropdown"
                :label="$i18n.t('DISCOUNTS.USERS')"
                :placeholder="$i18n.t('DISCOUNTS.SELECT_USERS')"
              />
            </div>
          </div>

          <div class="flex justify-end space-x-4">
            <Button type="button" variant="outline" @click="closeModal(false)"> {{ $i18n.t("BUTTON.CANCEL") }} </Button>
            <Button type="submit" :disabled="!isValidForm" class="bg-gray-600 hover:bg-gray-700">
              {{ $i18n.t("BUTTON.ADD") }}
            </Button>
          </div>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
