<!-- eslint-disable max-len -->
<template>
  <div class="flex h-screen">
    <div
      class="w-1/2 bg-cover bg-center bg-no-repeat hidden md:block"
      style="background-image: url(&quot;/img/login.png&quot;)"
    />

    <div class="w-1/2 flex items-center justify-center">
      <div class="w-full px-20 text-center">
        <h1 class="text-2xl font-bold mb-6">{{ t("SCANNER.SCAN_BARCODE") }}</h1>

        <div class="w-96 mx-auto mb-8">
          <div
            v-if="!isScanning"
            class="aspect-square w-full bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer flex flex-col items-center justify-center transition-colors duration-200 border-2 border-dashed border-gray-300"
            @click="startScanning"
          >
            <QrCode class="w-20 h-20 text-gray-400 mb-4" />
            <span class="text-gray-600 font-medium">{{ t("SCANNER.CLICK_TO_SCAN") }}</span>
          </div>

          <div v-else class="aspect-square w-full rounded-xl overflow-hidden relative">
            <QrcodeStream @detect="onDetect" />
            <Button
              class="absolute top-2 right-2 bg-white/80 hover:bg-white"
              size="icon"
              variant="ghost"
              @click="stopScanning"
            >
              <XIcon class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Button } from "@/components/ui/button";
import { QrcodeStream } from "vue-qrcode-reader";
import { ref } from "vue";
import { useToast } from "@/components/ui/toast";
import { QrCode, XIcon } from "lucide-vue-next";

const codeBarcode = ref("");
const isScanning = ref(false);
const { toast } = useToast();
const { t } = useI18n();

const startScanning = () => {
  isScanning.value = true;
};

const onDetect = async (result) => {
  try {
    const { cartId, token } = JSON.parse(result[0].rawValue);
    codeBarcode.value = result;
    isScanning.value = false;

    // Utiliser $api pour effectuer la requête
    const isCorrespondingCart = await $api(`/cart/${cartId}/verify`, {
      method: "GET",
      params: {
        jwt: token,
      },
    });

    if (isCorrespondingCart) {
      navigateTo(`/borne/cart?cartId=${cartId}&jwt=${token}`);
    } else {
      toast({
        title: "Le panier n'est pas associé à l'utilisateur",
        variant: "destructive",
      });
    }
  } catch (error) {
    toast({
      title: "Une erreur s'est produite lors de la vérification du panier : " + error,
      variant: "destructive",
    });
  }
};

const stopScanning = () => {
  isScanning.value = false;
};

definePageMeta({
  layout: "blank",
  auth: false,
});
</script>

<style scoped>
/* Style pour la caméra */
.qrcode-stream {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
