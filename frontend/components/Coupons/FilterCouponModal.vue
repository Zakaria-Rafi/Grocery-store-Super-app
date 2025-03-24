<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import Switch from "../ui/switch/Switch.vue";
import type { Coupon } from "~/types/coupon";

const props = defineProps<{
  isOpen: boolean;
  coupons: Coupon[];
  savedFilters: {
    code?: string;
    discountType?: "ALL" | "PERCENTAGE" | "FIXED";
    discountValue?: number;
    isGlobal?: boolean;
    usageLimit?: number;
    expiryDate?: string;
  };
}>();

const emit = defineEmits<{
  "update:isOpen": [value: boolean];
  filter: [
    filters: {
      code?: string;
      discountType?: "ALL" | "PERCENTAGE" | "FIXED";
      discountValue?: number;
      isGlobal?: boolean;
      usageLimit?: number;
      expiryDate?: string;
    },
  ];
  reset: [];
}>();

const filters = ref<{
  code?: string;
  discountType?: "ALL" | "PERCENTAGE" | "FIXED";
  discountValue?: number;
  isGlobal?: boolean;
  usageLimit?: number;
  expiryDate?: string;
}>({
  code: "",
  discountType: "ALL",
  discountValue: 0,
  isGlobal: false,
  usageLimit: 0,
  expiryDate: "",
});

// États pour l'autocomplétion
const codeSuggestions = ref<string[]>([]);
const showCodeSuggestions = ref(false);

const onCodeInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  filters.value.code = value;
  codeSuggestions.value = props.coupons
    .filter((coupon) => coupon.code.toLowerCase().includes(value.toLowerCase()))
    .map((coupon) => coupon.code);
};

const selectCode = (name: string) => {
  filters.value.code = name;
  showCodeSuggestions.value = false;
};

watch(
  () => props.savedFilters,
  (newFilters) => {
    if (newFilters) {
      filters.value = { ...newFilters };
    }
  },
  { immediate: true },
);

const handleSubmit = () => {
  const formattedFilters = Object.entries(filters.value).reduce(
    (acc, [key, value]) => {
      if (value !== "" && value !== undefined && (key === "isGlobal" || value !== 0)) {
        if (key === "expiryDate" && typeof value === "string") {
          acc[key] = new Date(value).toISOString().split("T")[0];
        } else {
          acc[key] = value;
        }
      }
      return acc;
    },
    {} as { [key: string]: string | number | boolean | undefined },
  );

  emit("filter", formattedFilters);
  emit("update:isOpen", false);
};

const handleReset = () => {
  filters.value = {
    code: "",
    discountType: undefined,
    discountValue: undefined,
    isGlobal: undefined,
    usageLimit: undefined,
    expiryDate: "",
  };
  emit("reset");
};

const { t } = useI18n();

const closeModal = (value: boolean) => {
  const target = event?.target as HTMLElement;
  const isResetButton = target?.closest("button")?.textContent?.includes(t("MODALS.RESET"));

  if (!isResetButton) {
    emit("update:isOpen", value);
  }
};

const activeFiltersCount = computed(() => {
  let count = 0;
  const f = filters.value;

  if (f.code) count++;
  if (f.discountType) count++;
  if (f.discountValue) count++;
  if (f.isGlobal !== undefined) count++;
  if (f.usageLimit) count++;
  if (f.expiryDate) count++;

  return count;
});
</script>

<template>
  <Dialog :open="isOpen" :modal="true" @update:open="closeModal">
    <DialogContent class="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>{{ t("DISCOUNTS.FILTER_COUPONS") }}</DialogTitle>
      </DialogHeader>
      <div class="grid gap-6 py-4">
        <div class="space-y-4">
          <div class="relative">
            <Label>{{ t("DISCOUNTS.CODE") }}</Label>
            <Input
              v-model="filters.code"
              :placeholder="t('DISCOUNTS.CODE_PLACEHOLDER')"
              class="mt-2"
              @input="onCodeInput"
              @focus="showCodeSuggestions = true"
            />
            <div
              v-if="showCodeSuggestions && codeSuggestions.length > 0"
              class="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg"
            >
              <div
                v-for="suggestion in codeSuggestions"
                :key="suggestion"
                class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                @click="selectCode(suggestion)"
              >
                {{ suggestion }}
              </div>
            </div>
          </div>

          <div>
            <Label>{{ t("DISCOUNTS.DISCOUNT_TYPE") }}</Label>
            <Select v-model="filters.discountType">
              <SelectTrigger>
                <SelectValue :placeholder="t('DISCOUNTS.DISCOUNT_TYPE_PLACEHOLDER')" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{{ t("DISCOUNTS.ALL") }}</SelectItem>
                <SelectItem value="PERCENTAGE">{{ t("DISCOUNTS.PERCENTAGE") }}</SelectItem>
                <SelectItem value="FIXED">{{ t("DISCOUNTS.FIXED") }}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{{ t("DISCOUNTS.DISCOUNT_VALUE") }}</Label>
            <Input
              v-model="filters.discountValue"
              type="number"
              :placeholder="t('DISCOUNTS.DISCOUNT_VALUE_PLACEHOLDER')"
              class="mt-2"
            />
          </div>

          <div>
            <Label>{{ t("DISCOUNTS.IS_GLOBAL") }}</Label>
            <Switch v-model="filters.isGlobal" class="ml-2" />
          </div>

          <div>
            <Label>{{ t("DISCOUNTS.USAGE_LIMIT") }}</Label>
            <Input v-model="filters.usageLimit" type="number" :placeholder="t('DISCOUNTS.LIMIT')" class="mt-2" />
          </div>

          <div>
            <Label>{{ t("DISCOUNTS.EXPIRATION_DATE") }}</Label>
            <Input v-model="filters.expiryDate" type="date" class="mt-2" :value="filters.expiryDate || ''" />
          </div>
        </div>

        <div class="flex justify-end space-x-4">
          <Button variant="outline" @click="handleReset"> {{ t("BUTTON.RESET") }} </Button>
          <Button @click="handleSubmit">
            {{ t("BUTTON.FILTER") }}
            <span v-if="activeFiltersCount > 0" class="ml-1 text-xs"> ({{ activeFiltersCount }}) </span>
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
.suggestions-list {
  max-height: 200px;
  overflow-y: auto;
}
</style>
