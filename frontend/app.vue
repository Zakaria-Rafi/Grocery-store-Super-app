<template>
  <ClientOnly>
    <template #fallback>
      <div class="text-center animate-pulse mt-[20%] w-64 flex-col m-auto items-center flex">
        <p>Loading...</p>
      </div>
    </template>
    <NuxtLayout>
      <Toaster />
      <NuxtPage />
    </NuxtLayout>
  </ClientOnly>
</template>

<script setup>
import Toaster from "@/components/ui/toast/Toaster.vue";
</script>

<style>
body {
  margin: 0;
  font-family: "Poppins", sans-serif;
}
</style>
