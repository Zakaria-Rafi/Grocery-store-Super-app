<template>
  <Dialog :open="isOpen" @update:open="closeModal">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription>{{ description }}</DialogDescription>
      </DialogHeader>
      <div class="flex justify-end space-x-4">
        <Button type="button" variant="outline" @click="closeModal(false)">
          {{ t("MODALS.CANCEL") }}
        </Button>
        <Button type="button" variant="destructive" @click="confirmDelete">
          {{ t("MODALS.DELETE") }}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { computed } from "vue";

const props = defineProps<{
  isOpen: boolean;
  entityType: "CLIENT" | "ORDER" | "PRODUCT" | "COUPON"; // Type d'entité pour les traductions
}>();

const emit = defineEmits<{
  "update:isOpen": [value: boolean];
  confirm: [];
}>();

const { t } = useI18n();

const closeModal = (value: boolean): void => {
  emit("update:isOpen", value);
};

const confirmDelete = (): void => {
  emit("confirm");
  closeModal(false);
};

// Obtenir le titre et la description en fonction du type d'entité
const title = computed(() => t(`${props.entityType}.DELETE_CONFIRMATION`));
const description = computed(() => t(`${props.entityType}.DELETE_CONFIRMATION_DESC`));
</script>
