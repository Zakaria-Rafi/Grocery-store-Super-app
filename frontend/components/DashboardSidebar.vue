<script setup lang="ts">
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";

import {
  BadgeCheck,
  BookOpen,
  ChevronRight,
  ChevronsUpDown,
  LayoutDashboard,
  ListCollapse,
  LogOut,
  Package,
  PercentCircle,
  Users,
} from "lucide-vue-next";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import { computed } from "vue";

const { t } = useI18n();
const { data: dataUser, signOut } = useAuth();

const defaultUser = {
  firstName: "",
  lastName: "",
  email: "",
};

type NavItem = {
  title: string;
  url: string;
  icon?: Component;
  isActive?: boolean;
  disabled?: boolean;
  items?: NavItem[] | false;
};

const user = computed(() => {
  if (!dataUser.value) return defaultUser;
  return {
    firstName: dataUser.value.firstName || "",
    lastName: dataUser.value.lastName || "",
    email: dataUser.value.email || "",
  };
});

const getUserInitials = computed(() => {
  return user.value.firstName.charAt(0) + user.value.lastName.charAt(0);
});

const navMain = computed((): NavItem[] => [
  {
    title: t("PRODUCTS.TITLE"),
    url: "/",
    icon: ListCollapse,
    isActive: false,
    items: [
      {
        title: t("SIDEBAR.LIST"),
        url: "/products",
      },
      {
        title: t("PRODUCTS.CATEGORIES"),
        url: "",
        disabled: true,
      },
    ],
  },
  {
    title: t("ORDERS.TITLE"),
    url: "/orders",
    icon: Package,
    isActive: false,
    items: false,
  },
  {
    title: t("CUSTOMERS.TITLE"),
    url: "/customers",
    icon: Users,
    isActive: false,
    items: false,
  },
  {
    title: t("DISCOUNTS.TITLE"),
    url: "/coupons",
    icon: PercentCircle,
    isActive: false,
    items: false,
  },
]);
</script>
<template>
  <Sidebar collapsible="icon">
    <SidebarHeader class="bg-white">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-default"
          >
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-semibold">Trinity</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent class="bg-white">
      <SidebarGroup>
        <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton class="text-sidebar-foreground/70" @click="navigateTo('/')">
              <LayoutDashboard class="text-sidebar-foreground/70" />
              <span>Dashboard</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <Collapsible
            v-for="item in navMain"
            :key="item.title"
            as-child
            :default-open="item.isActive"
            class="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger as-child>
                <SidebarMenuButton :tooltip="item.title" @click="item.items ? undefined : navigateTo(item.url)">
                  <component :is="item.icon" />
                  <span>{{ item.title }}</span>
                  <ChevronRight
                    v-if="item.items"
                    class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                  />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent v-if="item.items">
                <SidebarMenuSub>
                  <SidebarMenuSubItem v-for="subItem in item.items" :key="subItem.title">
                    <SidebarMenuSubButton as-child :class="{ 'opacity-50 cursor-not-allowed': subItem.disabled }">
                      <NuxtLink v-if="!subItem.disabled" v-slot="{ navigate }" :to="subItem.url" custom>
                        <button class="w-full text-left" @click="navigate">
                          <span>{{ subItem.title }}</span>
                        </button>
                      </NuxtLink>
                      <button v-else class="w-full text-left opacity-50 cursor-not-allowed" disabled>
                        <span>{{ subItem.title }}</span>
                      </button>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
    <SidebarFooter class="bg-white">
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <SidebarMenuButton
                size="lg"
                class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar class="h-8 w-8 rounded-lg">
                  <AvatarImage src="lol" :alt="user.firstName" />
                  <AvatarFallback class="rounded-lg">
                    {{ getUserInitials }}
                  </AvatarFallback>
                </Avatar>
                <div class="grid flex-1 text-left text-sm leading-tight">
                  <span class="truncate font-semibold">{{ user.firstName }} {{ user.lastName }}</span>
                  <span class="truncate text-xs">{{ user.email }}</span>
                </div>
                <ChevronsUpDown class="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              class="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side="bottom"
              align="end"
              :side-offset="4"
            >
              <DropdownMenuLabel class="p-0 font-normal">
                <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar class="h-8 w-8 rounded-lg">
                    <AvatarImage src="lol" :alt="user.firstName" />
                    <AvatarFallback class="rounded-lg">
                      {{ getUserInitials }}
                    </AvatarFallback>
                  </Avatar>
                  <div class="grid flex-1 text-left text-sm leading-tight">
                    <span class="truncate font-semibold">{{ user.firstName }} {{ user.lastName }}</span>
                    <span class="truncate text-xs">{{ user.email }}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem @click="navigateTo('/profile')">
                  <BadgeCheck />
                  {{ $t("ACCOUNT.TITLE") }}
                </DropdownMenuItem>
                <DropdownMenuItem @click="navigateTo('/releasenotes')">
                  <BookOpen />
                  {{ $t("RELEASE_NOTES.TITLE") }}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem @click="signOut({ callbackUrl: '/auth', external: true })">
                <LogOut />
                {{ $t("LOGOUT.TITLE") }}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
