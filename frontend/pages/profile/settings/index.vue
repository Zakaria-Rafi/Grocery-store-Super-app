<!-- eslint-disable max-len -->
<!-- eslint-disable vue/html-self-closing -->
<template>
  <NuxtLayout name="profile-settings">
    <div class="flex-1 lg:max-w-2xl">
      <div class="shadow-base rounded-lg border bg-card text-card-foreground">
        <div class="p-6 pt-6">
          <form class="space-y-8" @submit="onSubmit">
            <FormField v-slot="{ componentField }" name="language" class="space-y-2">
              <FormItem v-auto-animate>
                <FormLabel>{{ $t("LANGUAGE.TITLE") }}</FormLabel>
                <Select v-bind="componentField" :default-value="locale">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem v-for="language in localeCodes" :key="language" :value="language">
                        {{ $t(`LANGUAGE.${language.toUpperCase()}`) }}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormItem>
            </FormField>

            <Button
              class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              type="submit"
              :disabled="isSubmitDisabled"
              data-cy="update-button"
            >
              {{ $t("BUTTON.UPDATE") }}
            </Button>
          </form>
        </div>
      </div>
    </div>
    <aside class="lg:w-1/5">
      <div class="shadow-base rounded-lg border bg-card text-card-foreground">
        <div class="p-6 pt-6">
          <nav class="flex space-x-2 lg:flex-col lg:space-x-0">
            <NuxtLink
              class="inline-flex items-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:text-accent-foreground h-10 px-4 py-2 bg-muted hover:bg-muted justify-start"
              href="/profile/settings"
              data-cy="settings-button"
            >
              {{ $t("PROFILE") }}
            </NuxtLink>
            <NuxtLink
              class="inline-flex items-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:text-accent-foreground h-10 px-4 py-2 hover:bg-muted justify-start"
              href="/profile/settings/password"
              data-cy="password-button"
            >
              {{ $t("PASSWORD") }}
            </NuxtLink>
          </nav>
        </div>
      </div>
    </aside>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { computed, ref, watch } from "vue";
import { z } from "zod";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const { locale, localeCodes, setLocaleCookie } = useI18n();

const formSchema = toTypedSchema(
  z.object({
    language: z.string(),
  }),
);

const { handleSubmit, isFieldDirty, resetForm } = useForm({
  validationSchema: formSchema,
  initialValues: {
    language: locale.value,
  },
});

const loading = ref(false);

const isSubmitDisabled = computed(() => !isFieldDirty("language") && !loading.value);

const onSubmit = handleSubmit(async (values) => {
  loading.value = true;
  locale.value = values.language as "fr" | "en";
  setLocaleCookie(locale.value);
  resetForm();
  loading.value = false;
});

watch(locale, (newLocale) => {
  resetForm({
    values: {
      language: newLocale,
    },
  });
});
</script>
