<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50">
    <div class="w-full max-w-md p-8 space-y-6 bg-white rounded shadow">
      <h2 class="text-2xl font-bold text-center">{{ $t("RESET_PASSWORD.TITLE") }}</h2>
      <form class="space-y-4" @submit="onSubmit">
        <FormField v-slot="{ componentField }" name="newPassword">
          <FormItem v-auto-animate>
            <FormLabel>{{ $t("LABEL.NEW_PASSWORD") }}</FormLabel>
            <FormControl>
              <div class="flex w-full items-center gap-1.5">
                <Input :type="isPasswordVisible ? 'text' : 'password'" v-bind="componentField" class="h-11" required />
                <Button type="button" variant="ghost" @click="toggleVisibility('password')">
                  <EyeIcon v-if="isPasswordVisible" />
                  <EyeOffIcon v-else />
                </Button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="confirmPassword">
          <FormItem v-auto-animate>
            <FormLabel>{{ $t("LABEL.CONFIRM_PASSWORD") }}</FormLabel>
            <FormControl>
              <div class="flex w-full items-center gap-1.5">
                <Input
                  :type="isConfirmPasswordVisible ? 'text' : 'password'"
                  v-bind="componentField"
                  class="h-11"
                  required
                />
                <Button type="button" variant="ghost" @click="toggleVisibility('confirmPassword')">
                  <EyeIcon v-if="isConfirmPasswordVisible" />
                  <EyeOffIcon v-else />
                </Button>
              </div>
            </FormControl>
            <FormMessage :errors="errors" />
          </FormItem>
        </FormField>

        <Button class="w-full" type="submit" :disabled="loading" data-cy="reset-password-button">
          <Loader2Icon v-if="loading" class="animate-spin" />
          {{ loading ? $t("RESET_PASSWORD.LOADING") : $t("RESET_PASSWORD.RESET") }}
        </Button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { vAutoAnimate } from "@formkit/auto-animate/vue";
import { toTypedSchema } from "@vee-validate/zod";
import { EyeIcon, EyeOffIcon, Loader2Icon } from "lucide-vue-next";
import { useForm } from "vee-validate";
import { h, ref } from "vue";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ToastAction, useToast } from "@/components/ui/toast";

definePageMeta({
  layout: "blank",
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: "/",
  },
});

const route = useRoute();
const { toast } = useToast();
const { t } = useI18n();
const isConfirmPasswordVisible = ref(false);
const isPasswordVisible = ref(false);
const loading = ref(false);

const formSchema = toTypedSchema(
  z
    .object({
      newPassword: z
        .string({ required_error: t("RESET_PASSWORD.PASSWORD_REQUIRED") })
        .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/, {
          message: t("RESET_PASSWORD.PASSWORD_REGEX"),
        })
        .min(8, {
          message: t("RESET_PASSWORD.PASSWORD_MIN_LENGTH"),
        }),
      confirmPassword: z.string({ required_error: t("RESET_PASSWORD.CONFIRM_PASSWORD_REQUIRED") }),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("RESET_PASSWORD.PASSWORDS_NOT_MATCH"),
      path: ["confirmPassword"],
    }),
);

const { handleSubmit, errors } = useForm({
  validationSchema: formSchema,
});

const onSubmit = handleSubmit(async (values) => {
  try {
    loading.value = true;
    await $api("/auth/reset-password", {
      method: "POST",
      body: {
        resetToken: route.query.token,
        newPassword: values.newPassword,
      },
    });
    toast({
      title: t("RESET_PASSWORD.SUCCESS"),
      description: t("RESET_PASSWORD.SUCCESS_DESCRIPTION"),
      variant: "success",
      action: h(
        ToastAction,
        {
          altText: t("RESET_PASSWORD.LOGIN"),
          onClick: () => navigateTo("/login"),
        },
        {
          default: () => t("RESET_PASSWORD.LOGIN"),
        },
      ),
    });
    loading.value = false;
  } catch {
    loading.value = false;
    toast({
      title: t("RESET_PASSWORD.ERROR.TITLE"),
      description: t("RESET_PASSWORD.ERROR.DESCRIPTION"),
      variant: "destructive",
    });
  }
});

const toggleVisibility = (field) => {
  if (field === "password") {
    isPasswordVisible.value = !isPasswordVisible.value;
  } else if (field === "confirmPassword") {
    isConfirmPasswordVisible.value = !isConfirmPasswordVisible.value;
  }
};
</script>
