<template>
  <Dialog>
    <DialogTrigger as-child>
      <p class="text-sm text-blue-500 cursor-pointer hover:underline">Réinitialiser le mot de passe</p>
    </DialogTrigger>
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
        <DialogDescription>
          Remplissez le formulaire ci-dessous pour réinitialiser votre mot de passe.
        </DialogDescription>
      </DialogHeader>

      <form id="dialogForm" @submit="onSubmit">
        <FormField v-slot="{ componentField }" name="email">
          <FormItem>
            <FormLabel>Adresse email</FormLabel>
            <FormControl>
              <Input type="email" placeholder="john.doe@example.com" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </form>

      <DialogFooter>
        <Button type="submit" form="dialogForm" :disabled="loading" data-cy="send-reset-password-button">
          <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
          {{ loading ? "Envoi en cours..." : "Envoyer" }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toTypedSchema } from "@vee-validate/zod";
import { Loader2 } from "lucide-vue-next";
import { useForm } from "vee-validate";
import { ref } from "vue";
import { z } from "zod";

const emit = defineEmits<{
  "reset-password": [email: string];
}>();

const loading = ref(false);
const formSchema = toTypedSchema(
  z.object({
    email: z.string({ required_error: "Email requis" }).email({ message: "Email invalide" }),
  }),
);

const { handleSubmit } = useForm({
  validationSchema: formSchema,
});

const onSubmit = handleSubmit(async (values) => {
  loading.value = true;
  emit("reset-password", values.email);
  loading.value = false;
});
</script>
