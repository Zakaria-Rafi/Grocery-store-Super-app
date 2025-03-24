<template>
  <SidebarProvider>
    <DashboardSidebar />
    <SidebarInset>
      <DashboardHeader />
      <div class="flex flex-1 flex-col gap-4 p-4 pt-0">
        <slot />
      </div>
    </SidebarInset>
    <Toaster />
  </SidebarProvider>
</template>

<script setup lang="ts">
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from '@/components/ui/toast'
</script>
