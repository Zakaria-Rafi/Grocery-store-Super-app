<template>
  <div class="w-full">
    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead v-for="header in table.getHeaderGroups()[0].headers" :key="header.id">
              <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
            v-for="row in table.getRowModel().rows"
            :key="row.id"
            :data-state="row.getIsSelected() && 'selected'"
          >
            <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
              <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <!-- Pagination section -->
      <div class="flex items-center justify-between px-2 py-4">
        <div class="flex-1 text-sm text-muted-foreground">
          {{ table.getFilteredRowModel().rows.length }} résultat(s)
        </div>
        <div class="flex items-center space-x-6 lg:space-x-8">
          <div class="flex items-center space-x-2">
            <Button
              variant="outline"
              class="hidden h-8 w-8 p-0 lg:flex"
              :disabled="!table.getCanPreviousPage()"
              @click="table.setPageIndex(0)"
            >
              <span class="sr-only">Go to first page</span>
              <ChevronsLeft class="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              class="h-8 w-8 p-0"
              :disabled="!table.getCanPreviousPage()"
              @click="table.previousPage()"
            >
              <span class="sr-only">Go to previous page</span>
              <ChevronLeft class="h-4 w-4" />
            </Button>
          </div>
          <div class="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {{ table.getState().pagination.pageIndex + 1 }} sur {{ Math.max(table.getPageCount(), 1) }}
          </div>
          <div class="flex items-center space-x-2">
            <Button variant="outline" class="h-8 w-8 p-0" :disabled="!table.getCanNextPage()" @click="table.nextPage()">
              <span class="sr-only">Go to next page</span>
              <ChevronRight class="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              class="hidden h-8 w-8 p-0 lg:flex"
              :disabled="!table.getCanNextPage()"
              @click="table.setPageIndex(table.getPageCount() - 1)"
            >
              <span class="sr-only">Go to last page</span>
              <ChevronsRight class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FlexRender } from "@tanstack/vue-table";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-vue-next";
import type { Table as TableType } from "@tanstack/vue-table";
import type { Order } from "~/types/order";

defineProps<{
  table: TableType<Order>;
}>();
</script>

<style>
.selected {
  background-color: rgb(var(--color-muted) / 0.3);
}
</style>
