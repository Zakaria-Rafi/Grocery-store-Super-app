<!-- eslint-disable vue/html-self-closing -->
<template>
  <div class="flex flex-col">
    <div class="flex justify-between">
      <h1>Profile</h1>
      <Button variant="outline" data-cy="settings-button" @click="navigateTo('/profile/settings')"
        ><Settings />Settings</Button
      >
    </div>
    <div class="grid lg:grid-cols-3 gap-4">
      <div class="space-y-4 lg:col-span-1">
        <div class="shadow-base rounded-lg border bg-card text-card-foreground">
          <div class="p-6 relative pt-6 lg:pt-12">
            <div class="space-y-3">
              <div class="flex flex-col items-center space-y-4">
                <span class="relative flex shrink-0 overflow-hidden rounded-full h-20 w-20"
                  ><img
                    class="aspect-square h-full w-full"
                    alt="@shadcn"
                    src="https://dashboard.shadcnuikit.com/images/avatars/10.png"
                /></span>
                <div class="text-center">
                  <h5 class="text-lg font-semibold">{{ data?.firstName }} {{ data?.lastName }}</h5>
                  <div class="text-sm text-muted-foreground">{{ data?.role }}</div>
                </div>
              </div>
              <div class="flex flex-col gap-y-4">
                <div class="flex items-center gap-3">
                  <Mail />
                  {{ data?.email }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Mail, Settings } from "lucide-vue-next";
const { data } = useAuth();
</script>
