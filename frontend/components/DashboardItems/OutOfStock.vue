<!-- eslint-disable vue/html-self-closing -->
<template>
  <div class="flex flex-col gap-4">
    <div
      v-for="(product, index) in products"
      :key="product.id"
      class="flex flex-row gap-4 justify-between items-center"
      :class="{ 'border-b border-gray-200 pb-2': index !== products.length - 1 }"
    >
      <div class="flex flex-row gap-2 items-center">
        <img v-if="product.imagesUrl" :src="product.imagesUrl[0]" alt="Best Seller Week" class="h-10 hidden sm:block" />
        <p class="text-sm">
          <Tooltip>
            <TooltipTrigger>{{ $cutName(product.name) }}</TooltipTrigger>
            <TooltipContent>{{ product.name }}</TooltipContent>
          </Tooltip>
        </p>
      </div>
      <p class="text-md text-muted-foreground font-light">{{ $localizeQuantity(product.stock) }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const products = await $api("/reports/soon-out-of-stock");
</script>
