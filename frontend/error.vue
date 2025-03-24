<script setup lang="ts">
import type { NuxtError } from "nuxt/app";
import { Button } from "@/components/ui/button";
defineOptions({
  inheritAttrs: false,
});

const props = defineProps<{
  error: NuxtError;
}>();

const { t } = useI18n();
const isDev = import.meta.dev;

const errToShow = computed(() => {
  const is404 = props.error?.statusCode === 404 || props.error.message?.includes("404");

  if (is404) {
    return {
      title: t("PAGE_NOT_FOUND.TITLE"),
      description: t("PAGE_NOT_FOUND.DESCRIPTION"),
    };
  } else if (isDev) {
    return {
      title: props.error?.statusMessage,
      description: props.error.message,
    };
  }

  return {
    title: t("ERROR.TITLE"),
    description: t("ERROR.DESCRIPTION"),
  };
});

const handleError = () => clearError({ redirect: "/" });
</script>

<template>
  <NuxtLayout name="blank">
    <div class="flex flex-col items-center justify-center h-screen">
      <ErrorHeader
        :status-code="props.error.statusCode"
        :title="errToShow.title"
        :description="errToShow.description"
      />

      <!-- eslint-disable vue/no-v-html -->
      <div v-if="isDev" style="max-inline-size: 80dvw; overflow-x: scroll" v-html="error.stack" />
      <!-- eslint-enable -->

      <Button class="mb-11" @click="handleError"> {{ $t("ERROR.BACK_TO_HOME") }} </Button>
    </div>
  </NuxtLayout>
</template>
