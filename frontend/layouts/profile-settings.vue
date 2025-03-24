<template>
  <div class="flex flex-col">
    <div class="flex flex-col gap-y-2 mb-4">
      <h1 class="text-2xl font-bold">{{ $t("SETTINGS.TITLE") }}</h1>
      <h4 class="text-sm text-muted-foreground">{{ $t("SETTINGS_DESCRIPTION") }}</h4>
    </div>
    <div class="flex flex-col space-y-8 lg:flex-row lg:space-x-6 lg:space-y-0">
      <slot />
    </div>
  </div>
</template>
