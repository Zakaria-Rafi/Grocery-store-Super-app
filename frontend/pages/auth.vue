<template>
  <div class="min-h-screen flex">
    <div
      class="w-1/2 bg-cover bg-center bg-no-repeat hidden md:block"
      style="background-image: url(&quot;/img/login.png&quot;)"
    />

    <div class="w-1/2 flex items-center justify-center bg-gray-50">
      <div class="w-full max-w-md px-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold mb-2">{{ t("AUTH.WELCOME") }}</h1>
          <p class="text-gray-600">{{ t("AUTH.CHOOSE_AUTH_MODE") }}</p>
        </div>
        <div class="space-y-4">
          <Button
            class="w-full h-14 text-lg bg-gray-900 hover:bg-gray-800 text-white flex items-center justify-center"
            @click="() => navigateTo('/login')"
          >
            <UserIcon class="mr-2 h-5 w-5" />
            {{ t("AUTH.LOGIN") }}
          </Button>

          <Button
            variant="outline"
            class="w-full h-14 text-lg border-2 flex items-center justify-center"
            @click="() => navigateTo('/borne')"
          >
            <ShoppingCartIcon class="mr-2 h-5 w-5" />
            {{ t("AUTH.PAY_CART") }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Button } from "@/components/ui/button";
import { UserIcon, ShoppingCartIcon } from "lucide-vue-next";

const { t } = useI18n();

definePageMeta({
  layout: "blank",
  auth: false,
});
</script>
