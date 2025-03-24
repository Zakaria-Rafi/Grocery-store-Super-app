<script setup lang="ts">
import { DonutChart } from "@/components/ui/chart-donut";
import { ref, watch, computed } from "vue";

// Types
interface CategorySalesData {
  category: string;
  totalQuantity: string;
}

interface FormattedData {
  name: string;
  total: number;
}

interface ApiResponse {
  totalSold: string;
  categories: CategorySalesData[];
}

// Props
const props = defineProps<{
  startDate: string | undefined;
  endDate: string | undefined;
}>();

// Reactive refs
const categoryData = ref<FormattedData[]>([]);

// Computed
const startDateRef = computed(() => props.startDate);
const endDateRef = computed(() => props.endDate);
const blueShades = ["700", "600", "500", "400", "300"];

// Data transformation helpers
const formatCategoryData = (data: CategorySalesData[]): FormattedData[] =>
  data.map((item) => ({
    name: item.category,
    total: parseFloat(item.totalQuantity),
  }));

// API calls
const fetchCategorySalesData = async (startDate: string, endDate: string): Promise<ApiResponse> =>
  await $api<ApiResponse>("/reports/total-quantity-sold-by-category", {
    query: { startDate, endDate },
  });

// Main data fetching function
async function fetchData(startDate: string, endDate: string) {
  const data = await fetchCategorySalesData(startDate, endDate);
  const totalQuantity = parseFloat(data.totalSold);
  if (totalQuantity > 0) {
    categoryData.value = formatCategoryData(data.categories);
  }
}

const sortedData = computed(() => {
  return [...categoryData.value].sort((a, b) => {
    const percentageA = a.total;
    const percentageB = b.total;
    return percentageB - percentageA;
  });
});

// Watchers
watch([startDateRef, endDateRef], async ([newStartDate, newEndDate]) => {
  if (newStartDate && newEndDate) {
    await fetchData(newStartDate, newEndDate);
  }
});

// Initial data fetch
if (startDateRef.value && endDateRef.value) {
  await fetchData(startDateRef.value, endDateRef.value);
}
</script>

<template>
  <DonutChart index="name" :category="'total'" :data="sortedData" />

  <!--
  Show legend manually cards with percentage
  -->

  <div class="grid grid-cols-2 gap-2 mt-2">
    <div
      v-for="(item, index) in sortedData.slice(0, 5)"
      :key="index"
      class="bg-white text-center rounded-lg p-3 shadow-xl"
    >
      <p class="text-lg flex flex-row justify-center gap-2">
        <span :class="`text-blue-${blueShades[index]}`">{{ item.name }}</span>
      </p>
    </div>
  </div>
</template>
