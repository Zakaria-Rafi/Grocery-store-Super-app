<script setup lang="ts">
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

const { t } = useI18n();
</script>

<template>
  <header
    class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12"
  >
    <div class="flex items-center justify-between w-full px-4">
      <div class="flex items-center gap-2">
        <SidebarTrigger />
        <Separator orientation="vertical" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem class="hidden md:block">
              <BreadcrumbLink href="/"> {{ t("NAVIGATION.HOME") }} </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div class="flex gap-4">
        <slot name="actions" />
      </div>
    </div>
  </header>
</template>
