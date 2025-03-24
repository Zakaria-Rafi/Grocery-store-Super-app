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

const { $i18n } = useNuxtApp();

const closeModal = (value: boolean) => {
  emit("update:isOpen", value);
};

const handleConfirm = () => {
  emit("confirm");
};
</script>

<template>
  <Dialog :open="isOpen" @update:open="closeModal">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ $i18n.t("MODAL.DELETE_CONFIRMATION_TITLE") }}</DialogTitle>
        <DialogDescription>
          {{ message }}
          {{ $i18n.t("MODAL.DELETE_CONFIRMATION_DESCRIPTION") }}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <div class="flex justify-end gap-4">
          <Button variant="outline" @click="closeModal(false)"> {{ $i18n.t("BUTTON.CANCEL") }} </Button>
          <Button variant="destructive" @click="handleConfirm"> {{ $i18n.t("BUTTON.DELETE") }} </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
