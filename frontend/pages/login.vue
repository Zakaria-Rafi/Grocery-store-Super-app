<template>
  <div class="flex h-screen">
    <!-- Section gauche : Image -->
    <div
      class="w-1/2 bg-cover bg-center bg-no-repeat hidden md:block"
      style="background-image: url(&quot;/img/login.png&quot;)"
    >
      <!-- Image de fond ici -->
    </div>

    <!-- Section droite : Formulaire de connexion -->
    <div class="w-1/2 flex items-center justify-center">
      <div class="w-2/3 max-w-md">
        <h1 class="text-2xl font-bold mb-6">Connexion</h1>
        <form class="w-full space-y-6" @submit="onSubmit">
          <FormField v-slot="{ componentField }" name="email">
            <FormItem v-auto-animate>
              <FormLabel>Votre email</FormLabel>
              <FormControl>
                <Input name="email" type="email" v-bind="componentField" class="h-11" required />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <FormField v-slot="{ componentField }" name="password">
            <FormItem v-auto-animate>
              <FormLabel>Mot de passe</FormLabel>
              <FormControl>
                <div class="flex w-full items-center gap-1.5">
                  <Input
                    name="password"
                    :type="isPasswordVisible ? 'text' : 'password'"
                    v-bind="componentField"
                    class="h-11"
                    required
                  />
                  <Button type="button" variant="ghost" @click="togglePasswordVisibility">
                    <EyeIcon v-if="isPasswordVisible" />
                    <EyeOffIcon v-else />
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <SendResetPasswordDialog @reset-password="handleResetPassword" />
          <Button
            class="w-full rounded-full bg-gray-500 h-10 hover:bg-gray-400"
            type="submit"
            :disabled="loading"
            data-cy="login-button"
          >
            <Loader2Icon v-if="loading" class="animate-spin" /> Connexion
          </Button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { vAutoAnimate } from "@formkit/auto-animate/vue";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast/use-toast";
import SendResetPasswordDialog from "@/components/Dialog/SendResetPasswordDialog.vue";
import { EyeIcon, EyeOffIcon, Loader2Icon } from "lucide-vue-next";

definePageMeta({
  layout: "blank",
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: "/",
  },
});

const formSchema = toTypedSchema(
  z.object({
    email: z.string({ required_error: "Email est requis." }).email({ message: "Adresse email invalide." }),
    password: z.string({ required_error: "Mot de passe est requis." }),
  }),
);

const { handleSubmit } = useForm({
  validationSchema: formSchema,
});
const { toast } = useToast();
const { signIn } = useAuth();

const isPasswordVisible = ref(false);
const loading = ref(false);
const redirect = ref(null);

const togglePasswordVisibility = () => {
  isPasswordVisible.value = !isPasswordVisible.value;
};

const onSubmit = handleSubmit(async (values) => {
  try {
    loading.value = true;

    await signIn(
      {
        email: values.email,
        password: values.password,
      },
      { redirect: true, callbackUrl: "/" },
    );

    loading.value = false;
    toast({
      title: "Connexion réussie",
      description: "Vous êtes maintenant connecté",
      variant: "success",
    });
  } catch (error) {
    loading.value = false;
    toast({
      title: "Erreur de connexion",
      description: error?.message || "Email ou mot de passe incorrect",
      variant: "destructive",
    });
  }
});

const handleResetPassword = async (email) => {
  try {
    await $api("/auth/forgot-password", {
      method: "POST",
      body: { email },
    });
    toast({
      title: t("RESET_PASSWORD.MAIL.SENT"),
      variant: "success",
    });
  } catch {
    toast({
      title: t("RESET_PASSWORD.ERROR"),
      description: t("RESET_PASSWORD.ERROR_DESCRIPTION"),
      variant: "destructive",
    });
  }
};

onMounted(() => {
  redirect.value = new URLSearchParams(window.location.search).get("redirect");
});
</script>
