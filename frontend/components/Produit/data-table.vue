<script setup lang="ts" generic="T">
// Import types and components for table functionality
import type { ColumnDef, Table as TableType } from "@tanstack/vue-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-vue-next";

// Import table utilities from TanStack Table
import { FlexRender } from "@tanstack/vue-table";

const props = defineProps<{
  columns: ColumnDef<T>[];
  data: T[];
  table: TableType<T>;
}>();
const { t } = useI18n();
</script>

<template>
  <div>
    <!-- Main table container -->
    <div class="rounded-md border">
      <Table>
        <!-- Table header section -->
        <TableHeader>
          <TableRow>
            <TableHead v-for="header in props.table.getHeaderGroups()[0].headers" :key="header.id">
              <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
            </TableHead>
          </TableRow>
        </TableHeader>

        <!-- Table body section -->
        <TableBody>
          <TableRow
            v-for="row in props.table.getRowModel().rows"
            :key="row.id"
            :data-state="row.getIsSelected() && 'selected'"
          >
            <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
              <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- Pagination section -->
    <div class="flex items-center justify-betw een px-2 py-4">
      <div class="flex-1 text-sm text-muted-foreground">
        {{ props.table.getFilteredRowModel().rows.length }} {{ t("PRODUCT.RESULTS") }}
      </div>
      <div class="flex items-center space-x-6 lg:space-x-8">
        <div class="flex items-center space-x-2">
          <Button
            variant="outline"
            class="hidden h-8 w-8 p-0 lg:flex"
            :disabled="!props.table.getCanPreviousPage()"
            @click="props.table.setPageIndex(0)"
          >
            <span class="sr-only">{{ t("BUTTON.FIRST_PAGE") }}</span>
            <ChevronsLeft class="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            class="h-8 w-8 p-0"
            :disabled="!props.table.getCanPreviousPage()"
            @click="props.table.previousPage"
          >
            <span class="sr-only">{{ t("BUTTON.PREVIOUS_PAGE") }}</span>
            <ChevronLeft class="h-4 w-4" />
          </Button>
        </div>
        <div class="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {{ props.table.getState().pagination.pageIndex + 1 }} sur {{ Math.max(props.table.getPageCount(), 1) }}
        </div>
        <div class="flex items-center space-x-2">
          <Button
            variant="outline"
            class="h-8 w-8 p-0"
            :disabled="!props.table.getCanNextPage()"
            @click="props.table.nextPage"
          >
            <span class="sr-only">{{ t("BUTTON.NEXT_PAGE") }}</span>
            <ChevronRight class="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            class="hidden h-8 w-8 p-0 lg:flex"
            :disabled="!props.table.getCanNextPage()"
            @click="props.table.setPageIndex(props.table.getPageCount() - 1)"
          >
            <span class="sr-only">{{ t("BUTTON.LAST_PAGE") }}</span>
            <ChevronsRight class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
