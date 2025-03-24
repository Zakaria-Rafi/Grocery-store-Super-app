<template>
  <div class="flex h-screen items-center justify-center">
    <div class="text-center">
      <div class="flex justify-center mb-4">
        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle class="w-14 h-14 text-green-600" />
        </div>
      </div>
      <h1 class="text-2xl font-bold mb-4">{{ t("PAYMENT.PAYMENT_SUCCESS") }}</h1>
      <p class="mb-6">{{ t("PAYMENT.PAYMENT_SUCCESS_DESCRIPTION") }}</p>
      <Button class="bg-gray-900 text-white" @click="goToHome">
        {{ t("BUTTON.BACK_TO_HOME") }}
      </Button>
    </div>
  </div>
</template>

<script setup>
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-vue-next";

const goToHome = () => {
  navigateTo("/auth");
};

definePageMeta({
  layout: "blank",
  auth: false,
});
</script>
