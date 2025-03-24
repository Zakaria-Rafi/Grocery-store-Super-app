<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

defineProps<{
  isOpen: boolean;
  message: string;
}>();

const emit = defineEmits<{
  "update:isOpen": [value: boolean];
  confirm: [];
}>();

const closeModal = (value: boolean) => {
  emit("update:isOpen", value);
};

const { t } = useI18n();

const handleConfirm = () => {
  emit("confirm");
};
</script>

<template>
  <Dialog :open="isOpen" @update:open="closeModal">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ t("MODALS.DELETE_CONFIRMATION") }}</DialogTitle>
        <DialogDescription>
          {{ t("MODALS.DELETE_CONFIRMATION_DESCRIPTION") }}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <div class="flex justify-end gap-4">
          <Button variant="outline" @click="closeModal(false)">
            {{ t("MODALS.CANCEL") }}
          </Button>
          <Button variant="destructive" @click="handleConfirm">
            {{ t("MODALS.DELETE") }}
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
