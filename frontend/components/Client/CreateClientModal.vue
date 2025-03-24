<script setup lang="ts">
import { ref, computed } from "vue";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
const { $i18n } = useNuxtApp();
export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "admin" | "user";
}

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  "update:isOpen": [value: boolean];
  create: [userData: CreateUserData];
}>();

const formData = ref<CreateUserData>({
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  role: "user",
});

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const emailError = computed((): string => {
  if (!formData.value.email) return "";
  return !isValidEmail(formData.value.email) ? "Format d'email invalide" : "";
});

const passwordError = computed((): string => {
  if (!formData.value.password) return "";
  return formData.value.password.length < 6 ? "Le mot de passe doit contenir au moins 6 caractères" : "";
});

const isValidForm = computed((): boolean => {
  const firstName = !!formData.value.firstName.trim();
  const lastName = !!formData.value.lastName.trim();
  const email = !!formData.value.email.trim() && !emailError.value;
  const password = formData.value.password.trim().length >= 6;
  const role = !!formData.value.role;

  return firstName && lastName && email && password && role;
});

const handleSubmit = (): void => {
  if (!isValidForm.value) return;
  emit("create", formData.value);
  closeModal(false);
};

const closeModal = (value: boolean): void => {
  emit("update:isOpen", value);
};
</script>

<template>
  <Dialog :open="isOpen" @update:open="closeModal">
    <DialogContent class="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>{{ $i18n.t("CLIENT.ADD_CLIENT") }}</DialogTitle>
        <DialogDescription>{{ $i18n.t("CLIENT.FILL_INFO") }}</DialogDescription>
      </DialogHeader>
      <form @submit.prevent="handleSubmit">
        <div class="grid gap-6 py-4">
          <div class="space-y-4">
            <div>
              <Label>{{ $i18n.t("CLIENT.FIRST_NAME") }}</Label>
              <Input v-model="formData.firstName" placeholder="Prénom du client" class="mt-2" />
              <p class="text-sm text-gray-500 mt-1">Champ obligatoire</p>
            </div>

            <div>
              <Label>{{ $i18n.t("CLIENT.LAST_NAME") }}</Label>
              <Input v-model="formData.lastName" placeholder="Nom du client" class="mt-2" />
              <p class="text-sm text-gray-500 mt-1">Champ obligatoire</p>
            </div>

            <div>
              <Label>Email</Label>
              <Input
                v-model="formData.email"
                type="email"
                placeholder="Email du client"
                :class="['mt-2', emailError ? 'border-red-500' : '']"
              />
              <p v-if="emailError" class="text-sm text-red-500 mt-1">
                {{ emailError }}
              </p>
              <p v-else class="text-sm text-gray-500 mt-1">Format attendu : exemple@domaine.com</p>
            </div>

            <div>
              <Label>Mot de passe</Label>
              <Input
                v-model="formData.password"
                type="password"
                placeholder="Mot de passe"
                :class="['mt-2', passwordError ? 'border-red-500' : '']"
              />
              <p v-if="passwordError" class="text-sm text-red-500 mt-1">
                {{ passwordError }}
              </p>
              <p v-else class="text-sm text-gray-500 mt-1">Minimum 6 caractères</p>
            </div>

            <div>
              <Label>Rôle</Label>
              <Select v-model="formData.role" default-value="user">
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">Utilisateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div class="flex justify-end space-x-4">
            <Button type="button" variant="outline" @click="closeModal(false)">
              {{ $i18n.t("BUTTON.CANCEL") }}
            </Button>
            <Button type="submit" :disabled="!isValidForm" class="bg-gray-600 hover:bg-gray-700">
              {{ $i18n.t("BUTTON.ADD") }}
            </Button>
          </div>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
