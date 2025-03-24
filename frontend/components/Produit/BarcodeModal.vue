<template>
  <Dialog :open="isOpen" @update:open="$emit('update:isOpen', $event)">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{{ t("PRODUCT.BARCODE") }}</DialogTitle>
        <DialogDescription> {{ t("PRODUCT.BARCODE_DESCRIPTION") }} </DialogDescription>
      </DialogHeader>
      <div class="flex flex-col items-center gap-4 py-4">
        <p class="text-center text-xl font-mono">{{ props.barcode }}</p>
        <div v-if="barcode" class="flex flex-col items-center gap-2">
          <canvas ref="barcodeRef" />
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import JsBarcode from "jsbarcode";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const props = defineProps<{
  isOpen: boolean;
  barcode: string;
}>();

const { t } = useI18n();

const barcodeRef = ref<HTMLCanvasElement | null>(null);

// Fonction pour générer le code-barres
const generateBarcode = () => {
  if (barcodeRef.value && props.barcode) {
    JsBarcode(barcodeRef.value, props.barcode, {
      format: "CODE128",
      width: 2,
      height: 100,
      displayValue: true,
      font: "monospace",
      fontSize: 14,
      margin: 10,
    });
  }
};

// Observer les changements de barcode et isOpen
watch(
  () => [props.barcode, props.isOpen],
  () => {
    // Attendre le prochain tick pour s'assurer que le canvas est monté
    nextTick(() => {
      generateBarcode();
    });
  },
  { immediate: true },
);

defineEmits(["update:isOpen"]);
</script>
