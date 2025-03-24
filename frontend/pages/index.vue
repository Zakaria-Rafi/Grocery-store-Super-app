<template>
  <div class="flex-1 space-y-4 p-8 pt-6">
    <div class="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between">
      <h2 class="text-3xl font-bold tracking-tight">Dashboard</h2>
      <div class="flex items-center space-x-2">
        <Popover>
          <PopoverTrigger as-child>
            <Button
              variant="outline"
              :class="cn('w-[280px] justify-start text-left font-normal', !value && 'text-muted-foreground')"
            >
              <CalendarIcon class="mr-2 h-4 w-4" />
              <template v-if="value.start">
                <template v-if="value.end">
                  {{
                    formatter.custom(toDate(value.start), {
                      dateStyle: "medium",
                    })
                  }}
                  -
                  {{
                    formatter.custom(toDate(value.end), {
                      dateStyle: "medium",
                    })
                  }}
                </template>

                <template v-else>
                  {{
                    formatter.custom(toDate(value.start), {
                      dateStyle: "medium",
                    })
                  }}
                </template>
              </template>
              <template v-else> Pick a date </template>
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-auto p-0">
            <RangeCalendarRoot v-slot="{ weekDays }" v-model="value" v-model:placeholder="placeholder" class="p-3">
              <div class="flex flex-col gap-y-4 mt-4 sm:flex-row sm:gap-x-4 sm:gap-y-0">
                <div class="flex flex-col gap-4">
                  <div class="flex items-center justify-between">
                    <button
                      :class="
                        cn(
                          buttonVariants({ variant: 'outline' }),
                          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
                        )
                      "
                      @click="updateMonth('first', -1)"
                    >
                      <ChevronLeft class="h-4 w-4" />
                    </button>
                    <div :class="cn('text-sm font-medium')">
                      {{ formatter.fullMonthAndYear(toDate(firstMonth.value)) }}
                    </div>
                    <button
                      :class="
                        cn(
                          buttonVariants({ variant: 'outline' }),
                          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
                        )
                      "
                      @click="updateMonth('first', 1)"
                    >
                      <ChevronRight class="h-4 w-4" />
                    </button>
                  </div>
                  <RangeCalendarGrid>
                    <RangeCalendarGridHead>
                      <RangeCalendarGridRow>
                        <RangeCalendarHeadCell v-for="day in weekDays" :key="day" class="w-full">
                          {{ day }}
                        </RangeCalendarHeadCell>
                      </RangeCalendarGridRow>
                    </RangeCalendarGridHead>
                    <RangeCalendarGridBody>
                      <RangeCalendarGridRow
                        v-for="(weekDates, index) in firstMonth.rows"
                        :key="`weekDate-${index}`"
                        class="mt-2 w-full"
                      >
                        <RangeCalendarCell v-for="weekDate in weekDates" :key="weekDate.toString()" :date="weekDate">
                          <RangeCalendarCellTrigger :day="weekDate" :month="firstMonth.value" />
                        </RangeCalendarCell>
                      </RangeCalendarGridRow>
                    </RangeCalendarGridBody>
                  </RangeCalendarGrid>
                </div>
                <div class="flex flex-col gap-4">
                  <div class="flex items-center justify-between">
                    <button
                      :class="
                        cn(
                          buttonVariants({ variant: 'outline' }),
                          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
                        )
                      "
                      @click="updateMonth('second', -1)"
                    >
                      <ChevronLeft class="h-4 w-4" />
                    </button>
                    <div :class="cn('text-sm font-medium')">
                      {{ formatter.fullMonthAndYear(toDate(secondMonth.value)) }}
                    </div>

                    <button
                      :class="
                        cn(
                          buttonVariants({ variant: 'outline' }),
                          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
                        )
                      "
                      @click="updateMonth('second', 1)"
                    >
                      <ChevronRight class="h-4 w-4" />
                    </button>
                  </div>
                  <RangeCalendarGrid>
                    <RangeCalendarGridHead>
                      <RangeCalendarGridRow>
                        <RangeCalendarHeadCell v-for="day in weekDays" :key="day" class="w-full">
                          {{ day }}
                        </RangeCalendarHeadCell>
                      </RangeCalendarGridRow>
                    </RangeCalendarGridHead>
                    <RangeCalendarGridBody>
                      <RangeCalendarGridRow
                        v-for="(weekDates, index) in secondMonth.rows"
                        :key="`weekDate-${index}`"
                        class="mt-2 w-full"
                      >
                        <RangeCalendarCell v-for="weekDate in weekDates" :key="weekDate.toString()" :date="weekDate">
                          <RangeCalendarCellTrigger :day="weekDate" :month="secondMonth.value" />
                        </RangeCalendarCell>
                      </RangeCalendarGridRow>
                    </RangeCalendarGridBody>
                  </RangeCalendarGrid>
                </div>
              </div>
            </RangeCalendarRoot>
          </PopoverContent>
        </Popover>
      </div>
    </div>
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card class="rounded-xl">
        <CardHeader class="flex flex-row items-center justify-between space-y-0 border-b border-gray-200 px-2">
          <CardTitle class="text-sm font-medium"> {{ $t("STATS.BEST_SELLER_WEEK") }} </CardTitle>
          <ChartBarIcon class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent class="pt-3">
          <BestSellerWeek />
        </CardContent>
      </Card>
      <Card class="rounded-xl">
        <CardHeader class="flex flex-row items-center justify-between space-y-0 border-b border-gray-200 px-2">
          <CardTitle class="text-sm font-medium"> {{ $t("STATS.SOON_OUT_OF_STOCK") }} </CardTitle>
          <PackageMinusIcon class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent class="pt-3">
          <OutOfStock />
        </CardContent>
      </Card>
      <Card class="rounded-xl">
        <CardHeader class="flex flex-row items-center justify-between space-y-0 border-b border-gray-200 px-2">
          <CardTitle class="text-sm font-medium"> {{ $t("STATS.ORDER_OF_THE_DAY") }} </CardTitle>
          <PackageIcon class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent class="pt-3">
          <OrdersOfTheDay />
        </CardContent>
      </Card>
    </div>
    <div class="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
      <Card class="col-span-4 rounded-xl">
        <CardHeader>
          <CardTitle class="text-md font-medium sm:flex sm:items-center sm:justify-between">
            {{ $t("STATS.SALES_OVERVIEW") }}
            <Tabs v-model="tabs" default-value="revenues">
              <TabsList>
                <TabsTrigger value="revenues">Revenues</TabsTrigger>
                <TabsTrigger value="items-sold">Items Sold</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardTitle>
        </CardHeader>
        <CardContent class="pl-2 pt-3">
          <SalesOverview :value="tabs" :start-date="value.start?.toString()" :end-date="value.end?.toString()" />
        </CardContent>
      </Card>
      <Card class="col-span-3 rounded-xl">
        <CardHeader>
          <CardTitle class="text-md font-medium">{{ $t("STATS.SALES_OVERVIEW_BY_CATEGORY") }}</CardTitle>
        </CardHeader>
        <CardContent>
          <SalesOverviewByCategory :start-date="value.start?.toString()" :end-date="value.end?.toString()" />
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button, buttonVariants } from "@/components/ui/button";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import {
  RangeCalendarCell,
  RangeCalendarCellTrigger,
  RangeCalendarGrid,
  RangeCalendarGridBody,
  RangeCalendarGridHead,
  RangeCalendarGridRow,
  RangeCalendarHeadCell,
} from "@/components/ui/range-calendar";
import { CalendarIcon, ChartBarIcon, ChevronLeft, ChevronRight, PackageIcon, PackageMinusIcon } from "lucide-vue-next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import BestSellerWeek from "@/components/DashboardItems/BestSellerWeek.vue";
import OrdersOfTheDay from "@/components/DashboardItems/OrdersOfTheDay.vue";
import OutOfStock from "@/components/DashboardItems/OutOfStock.vue";
import SalesOverview from "@/components/DashboardItems/SalesOverview.vue";
import SalesOverviewByCategory from "@/components/DashboardItems/SalesOverviewByCategory.vue";
import { cn } from "@/lib/utils";
import { CalendarDate, type DateValue, isEqualMonth } from "@internationalized/date";
import { type DateRange, RangeCalendarRoot, useDateFormatter } from "radix-vue";
import { createMonth, type Grid, toDate } from "radix-vue/date";
import { type Ref, ref, watch } from "vue";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const date = new Date();
const value = ref({
  start: new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate() - 20),
  end: new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate() + 1),
}) as Ref<DateRange>;

const { locale } = useI18n();

const formatter = useDateFormatter(locale.value);

const placeholder = ref(value.value.start) as Ref<DateValue>;
const secondMonthPlaceholder = ref(value.value.end) as Ref<DateValue>;

const tabs = ref("revenues");

const firstMonth = ref(
  createMonth({
    dateObj: placeholder.value,
    locale: locale.value,
    fixedWeeks: true,
    weekStartsOn: 0,
  }),
) as Ref<Grid<DateValue>>;
const secondMonth = ref(
  createMonth({
    dateObj: secondMonthPlaceholder.value,
    locale: locale.value,
    fixedWeeks: true,
    weekStartsOn: 0,
  }),
) as Ref<Grid<DateValue>>;

function updateMonth(reference: "first" | "second", months: number) {
  if (reference === "first") {
    placeholder.value = placeholder.value.add({ months });
  } else {
    secondMonthPlaceholder.value = secondMonthPlaceholder.value.add({
      months,
    });
  }
}

watch(tabs, (_tabs) => {
  tabs.value = _tabs;
});

watch(value, (_value) => {
  value.value = _value;
});

watch(placeholder, (_placeholder) => {
  firstMonth.value = createMonth({
    dateObj: _placeholder,
    weekStartsOn: 0,
    fixedWeeks: false,
    locale: locale.value,
  });
  if (isEqualMonth(secondMonthPlaceholder.value, _placeholder)) {
    secondMonthPlaceholder.value = secondMonthPlaceholder.value.add({
      months: 1,
    });
  }
});

watch(secondMonthPlaceholder, (_secondMonthPlaceholder) => {
  secondMonth.value = createMonth({
    dateObj: _secondMonthPlaceholder,
    weekStartsOn: 0,
    fixedWeeks: false,
    locale: locale.value,
  });
  if (isEqualMonth(_secondMonthPlaceholder, placeholder.value))
    placeholder.value = placeholder.value.subtract({ months: 1 });
});
</script>
