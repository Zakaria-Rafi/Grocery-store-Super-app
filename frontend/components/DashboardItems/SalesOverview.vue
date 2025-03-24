<template>
  <AreaChart
    :data="props.value === 'revenues' ? dataSalesOverviewFormatted : itemsSold"
    :colors="['blue', 'pink']"
    :categories="['total']"
    :index="'period'"
  />
</template>

<script setup lang="ts">
import { AreaChart } from "@/components/ui/chart-area";
import { ref, watch, computed } from "vue";

// Types
interface SalesData {
  period: string;
  totalSales: string;
}

interface QuantityData {
  period: string;
  totalQuantitySold: string;
}

interface FormattedData {
  period: string;
  total: number;
}

// Props
const props = defineProps<{
  value: string;
  startDate: string | undefined;
  endDate: string | undefined;
}>();

// Reactive refs
const itemsSold = ref<FormattedData[]>([]);
const dataSalesOverviewFormatted = ref<FormattedData[]>([]);

// Computed
const startDateRef = computed(() => props.startDate);
const endDateRef = computed(() => props.endDate);

// Data transformation helpers
const formatSalesData = (data: SalesData[]): FormattedData[] =>
  data.map((item) => ({
    period: item.period,
    total: parseFloat(item.totalSales),
  }));

const formatQuantityData = (data: QuantityData[]): FormattedData[] =>
  data.map((item) => ({
    period: item.period,
    total: parseFloat(item.totalQuantitySold),
  }));

// API calls
const fetchSalesData = async (startDate: string, endDate: string): Promise<SalesData[]> =>
  await $api("/reports/total-sales", {
    query: { startDate, endDate },
  });

const fetchQuantityData = async (startDate: string, endDate: string): Promise<QuantityData[]> =>
  await $api("/reports/total-quantity-sold", {
    query: { startDate, endDate },
  });

// Main data fetching function
async function fetchData(startDate: string, endDate: string) {
  const [salesData, quantityData] = await Promise.all([
    fetchSalesData(startDate, endDate),
    fetchQuantityData(startDate, endDate),
  ]);

  dataSalesOverviewFormatted.value = formatSalesData(salesData);
  itemsSold.value = formatQuantityData(quantityData);
}

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
