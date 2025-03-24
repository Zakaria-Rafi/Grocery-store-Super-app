<script setup lang="ts">
import Button from "~/components/ui/button/Button.vue";

definePageMeta({
  alias: "/not-authorized",
  public: true,
});
</script>

<template>
  <div class="misc-wrapper">
    <ErrorHeader
      status-code="401"
      :title="$t('NOT_AUTHORIZED.TITLE')"
      :description="$t('NOT_AUTHORIZED.DESCRIPTION')"
    />

    <Button class="mb-11" to="/"> {{ $t("ERROR.BACK_TO_HOME") }} </Button>
  </div>
</template>
