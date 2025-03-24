<template>
  <Dialog :open="isOpen" @update:open="$emit('update:is-open', $event)">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{{ t("PRODUCT.ADD_PRODUCT") }}</DialogTitle>
        <DialogDescription>{{ t("PRODUCT.ADD_PRODUCT_DESCRIPTION") }}</DialogDescription>
      </DialogHeader>

      <!-- Nouveaux boutons de sélection -->
      <div v-if="!selectedMethod" class="grid gap-4 py-4">
        <Button @click="selectedMethod = 'scanner'">{{ t("SCANNER.SCAN_BARCODE") }}</Button>
        <Button @click="selectedMethod = 'manual'">{{ t("SCANNER.ENTER_MANUALLY") }}</Button>
      </div>

      <!-- Scanner QR -->
      <div v-if="selectedMethod === 'scanner'" class="grid gap-4 py-4">
        <QrcodeStream :constraints="selectedConstraints" :formats="['ean_8', 'ean_13']" @detect="onDetect" />
        <Button variant="outline" @click="selectedMethod = null">{{ t("SCANNER.BACK") }}</Button>
      </div>

      <!-- Input manuel -->
      <div v-if="selectedMethod === 'manual'" class="grid gap-4 py-4">
        <div class="space-y-2">
          <Label>{{ t("SCANNER.EAN_CODE") }}</Label>
          <Input v-model="eanCode" placeholder="Ex: 12345678" :min-length="8" />
        </div>
        <Button variant="outline" @click="selectedMethod = null">{{ t("SCANNER.BACK") }}</Button>
      </div>

      <DialogFooter v-if="selectedMethod === 'manual'">
        <Button variant="outline" @click="$emit('update:is-open', false)">{{ t("BUTTON.CANCEL") }}</Button>
        <Button type="submit" :disabled="!isValidEAN" @click="handleSubmit">{{ t("BUTTON.SEARCH") }}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import JsBarcode from "jsbarcode";
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
import { useToast } from "@/components/ui/toast";
import { QrcodeStream, type DetectedBarcode } from "vue-qrcode-reader";
const { toast } = useToast();
const { t } = useI18n();
defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  "update:is-open": [value: boolean];
  scan: [ean: string];
}>();

const eanCode = ref("");
const barcodeRef = ref<HTMLCanvasElement | null>(null);
const selectedMethod = ref<"scanner" | "manual" | null>(null);

const isValidEAN = computed(() => {
  return /^\d{8,}$/.test(eanCode.value);
});

watch([eanCode, isValidEAN], ([newEan, isValid]) => {
  if (isValid && barcodeRef.value) {
    try {
      JsBarcode(barcodeRef.value, newEan, {
        format: "EAN13",
        width: 2,
        height: 100,
        displayValue: true,
        font: "monospace",
        fontSize: 14,
        margin: 10,
      });
    } catch {
      toast({
        title: t("ERRORS.BARCODE_GENERATION_ERROR"),
        description: t("ERRORS.BARCODE_GENERATION_ERROR_DESCRIPTION"),
        variant: "destructive",
      });
    }
  }
});

const handleSubmit = () => {
  if (isValidEAN.value) {
    emit("scan", eanCode.value);
    eanCode.value = "";
    emit("update:is-open", false);
  }
};
const selectedConstraints = ref({ facingMode: "environment" });
// Ajout de la fonction pour gérer le scan
function onDetect(detectedCodes: DetectedBarcode[]) {
  emit("scan", detectedCodes[0].rawValue);
  emit("update:is-open", false);
}
</script>
