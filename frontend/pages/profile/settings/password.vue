<!-- eslint-disable max-len -->
<!-- eslint-disable vue/html-self-closing -->
<template>
  <NuxtLayout name="profile-settings">
    <div class="flex-1 lg:max-w-2xl">
      <div class="shadow-base rounded-lg border bg-card text-card-foreground">
        <div class="p-6 pt-6">
          <form class="space-y-8" @submit="onSubmit">
            <FormField v-slot="{ componentField }" name="oldPassword" class="space-y-2">
              <FormItem v-auto-animate>
                <FormLabel>{{ $t("CURRENT_PASSWORD") }}</FormLabel>
                <FormControl>
                  <div class="flex w-full items-center gap-1.5">
                    <Input
                      :type="isOldPasswordVisible ? 'text' : 'password'"
                      data-cy="old-password-input"
                      v-bind="componentField"
                      class="h-11"
                      required
                    />
                    <Button type="button" variant="ghost" @click="toggleVisibility('oldPassword')">
                      <EyeIcon v-if="isOldPasswordVisible" />
                      <EyeOffIcon v-else />
                    </Button>
                  </div>
                </FormControl>
                <FormMessage :errors="errors" />
              </FormItem>
            </FormField>
            <FormField v-slot="{ componentField }" name="newPassword" class="space-y-2">
              <FormItem v-auto-animate>
                <FormLabel>{{ $t("NEW_PASSWORD") }}</FormLabel>
                <FormControl>
                  <div class="flex w-full items-center gap-1.5">
                    <Input
                      :type="isPasswordVisible ? 'text' : 'password'"
                      v-bind="componentField"
                      data-cy="new-password-input"
                      class="h-11"
                      required
                    />
                    <Button type="button" variant="ghost" @click="toggleVisibility('password')">
                      <EyeIcon v-if="isPasswordVisible" />
                      <EyeOffIcon v-else />
                    </Button>
                  </div>
                </FormControl>
                <FormMessage :errors="errors" />
              </FormItem>
            </FormField>
            <FormField v-slot="{ componentField }" name="confirmPassword" class="space-y-2">
              <FormItem v-auto-animate>
                <FormLabel>{{ $t("CONFIRM_PASSWORD") }}</FormLabel>
                <FormControl>
                  <div class="flex w-full items-center gap-1.5">
                    <Input
                      :type="isConfirmPasswordVisible ? 'text' : 'password'"
                      v-bind="componentField"
                      class="h-11"
                      required
                      data-cy="confirm-password-input"
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
              class="inline-flex items-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:text-accent-foreground h-10 px-4 py-2 hover:bg-muted justify-start"
              href="/profile/settings"
              data-cy="settings-button"
            >
              {{ $t("PROFILE") }}
            </NuxtLink>
            <NuxtLink
              class="inline-flex items-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:text-accent-foreground h-10 px-4 py-2 bg-muted hover:bg-muted justify-start"
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
import { useToast } from "@/components/ui/toast";
import { toTypedSchema } from "@vee-validate/zod";
import { EyeIcon, EyeOffIcon } from "lucide-vue-next";
import { useForm } from "vee-validate";
import { computed, ref } from "vue";
import { z } from "zod";
import FormControl from "~/components/ui/form/FormControl.vue";
import FormMessage from "~/components/ui/form/FormMessage.vue";
import Input from "~/components/ui/input/Input.vue";

const { toast } = useToast();

const isPasswordVisible = ref(false);
const isConfirmPasswordVisible = ref(false);
const isOldPasswordVisible = ref(false);
const toggleVisibility = (field: string) => {
  if (field === "oldPassword") {
    isOldPasswordVisible.value = !isOldPasswordVisible.value;
  } else if (field === "password") {
    isPasswordVisible.value = !isPasswordVisible.value;
  } else if (field === "confirmPassword") {
    isConfirmPasswordVisible.value = !isConfirmPasswordVisible.value;
  }
};

const formSchema = toTypedSchema(
  z
    .object({
      oldPassword: z.string({ required_error: "Le mot de passe est requis." }).min(1, {
        message: "Le mot de passe est requis.",
      }),
      newPassword: z
        .string({ required_error: "Le mot de passe est requis." })
        .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/, {
          message:
            "Le mot de passe doit contenir au moins 8 caractères dont une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial.",
        })
        .min(8, {
          message: "Le mot de passe doit contenir au moins 8 caractères.",
        }),
      confirmPassword: z.string({ required_error: "La confirmation du mot de passe est requise." }),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Les mots de passe ne correspondent pas.",
      path: ["confirmPassword"],
    }),
);

const { handleSubmit, errors, resetForm, isFieldValid, setErrors } = useForm({
  validationSchema: formSchema,
});

const loading = ref(false);

const isSubmitDisabled = computed(() => {
  return (
    !isFieldValid("oldPassword") || !isFieldValid("newPassword") || !isFieldValid("confirmPassword") || loading.value
  );
});

const onSubmit = handleSubmit(async (values) => {
  loading.value = true;
  try {
    await $api("/users/me/password", {
      method: "PUT",
      body: {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      },
    });
    resetForm();
    toast({
      title: "Password updated successfully",
      variant: "success",
    });
  } catch (error) {
    if ((error as { status?: number }).status === 401) {
      setErrors({
        oldPassword: "Wrong password",
      });
      toast({
        title: "Error",
        description: "Wrong password",
        variant: "destructive",
        duration: 5000,
      });
    } else {
      toast({
        title: "Error",
        description: "An error occurred while updating your password",
        variant: "destructive",
        duration: 5000,
      });
    }
  } finally {
    loading.value = false;
  }
});
</script>
