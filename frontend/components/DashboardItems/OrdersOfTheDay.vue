<!-- eslint-disable vue/html-self-closing -->
<template>
  <div class="flex flex-col gap-4">
    <div
      v-for="(order, index) in formattedOrders"
      :key="order.id"
      class="flex flex-row items-center sm:gap-7 gap-24"
      :class="{ 'border-b border-gray-200 pb-2': index !== orders.length - 1 }"
    >
      <div class="flex flex-row gap-2 items-center">
        <img src="https://placehold.co/30x30" alt="Best Seller Week" class="w-10 mr-3 hidden sm:block" />
        <div class="flex flex-col">
          <p class="text-xs font-medium">N° {{ order.id }}</p>
          <p class="text-sm">{{ order.user.firstName }} {{ order.user.lastName }}</p>
          <p class="text-xs text-muted-foreground font-light">
            {{ $parseCreatedAtAgo(order.created_at.toISOString()) }}
          </p>
        </div>
      </div>
      <div class="flex flex-row items-center gap-10">
        <div class="flex flex-col">
          <p class="text-xs font-medium">Qte:</p>
          <p class="text-md text-muted-foreground font-light">
            {{ order.quantity || 0 }}
          </p>
        </div>
        <div class="flex flex-col">
          <p class="text-xs font-medium">Total:</p>
          <p class="text-md text-muted-foreground font-light">{{ $localizePrice(Number(order.amount)) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface OrderResponse {
  invoice_created_at: string;
  invoice_id: number;
  totalamount: string;
  totalquantity: string;
  user_firstName: string;
  user_lastName: string;
}
const orders = await $api<OrderResponse[]>("/reports/orders-today");

const formattedOrders = orders.map((order: OrderResponse) => ({
  id: order.invoice_id,
  created_at: new Date(order.invoice_created_at),
  amount: order.totalamount,
  quantity: order.totalquantity,
  user: {
    firstName: order.user_firstName,
    lastName: order.user_lastName,
  },
}));
</script>
