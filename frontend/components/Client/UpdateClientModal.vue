<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const props = defineProps<{
  isOpen: boolean;
  client: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: "admin" | "user";
  };
}>();

const { $i18n } = useNuxtApp();

const emit = defineEmits<{
  "update:isOpen": [value: boolean];
  submit: [
    client: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
      role: "admin" | "user";
    },
  ];
}>();

const formData = ref({
  id: 0,
  firstName: "",
  lastName: "",
  email: "",
  role: "user" as "user" | "admin",
});

// Fonction de validation d'email
const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const emailError = computed(() => {
  if (!formData.value.email) return "";
  return !isValidEmail(formData.value.email) ? $i18n.t("CLIENT.INVALID_EMAIL") : "";
});

const isValidForm = computed(() => {
  return (
    formData.value.firstName &&
    formData.value.lastName &&
    formData.value.email &&
    isValidEmail(formData.value.email) &&
    formData.value.role
  );
});

watch(
  () => props.client,
  (newClient) => {
    if (newClient) {
      formData.value = {
        id: newClient.id,
        firstName: newClient.firstName || "",
        lastName: newClient.lastName || "",
        email: newClient.email || "",
        role: newClient.role || "user",
      };
    }
  },
  { immediate: true },
);

const handleSubmit = () => {
  if (isValidForm.value) {
    const dataToSubmit = {
      id: formData.value.id,
      firstName: formData.value.firstName,
      lastName: formData.value.lastName,
      email: formData.value.email,
      role: formData.value.role,
    };
    emit("submit", dataToSubmit);
    closeModal(false);
  }
};

const closeModal = (value: boolean) => {
  emit("update:isOpen", value);
};
</script>

<template>
  <Dialog :open="isOpen" @update:open="closeModal">
    <DialogContent class="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>{{ props.client ? $i18n.t("CLIENT.UPDATE_CLIENT") : $i18n.t("CLIENT.ADD_CLIENT") }}</DialogTitle>
      </DialogHeader>
      <div class="grid gap-6 py-4">
        <div class="space-y-4">
          <div>
            <Label>{{ $i18n.t("CLIENT.FIRST_NAME") }}</Label>
            <Input v-model="formData.firstName" :placeholder="$i18n.t('CLIENT.FIRST_NAME_PLACEHOLDER')" class="mt-2" />
          </div>

          <div>
            <Label>{{ $i18n.t("CLIENT.LAST_NAME") }}</Label>
            <Input v-model="formData.lastName" :placeholder="$i18n.t('CLIENT.LAST_NAME_PLACEHOLDER')" class="mt-2" />
          </div>

          <div>
            <Label>{{ $i18n.t("CLIENT.EMAIL") }}</Label>
            <Input
              v-model="formData.email"
              type="email"
              :placeholder="$i18n.t('CLIENT.EMAIL_PLACEHOLDER')"
              :class="['mt-2', emailError ? 'border-red-500' : '']"
            />
            <p v-if="emailError" class="text-sm text-red-500 mt-1">
              {{ emailError }}
            </p>
            <p v-else class="text-sm text-gray-500 mt-1">
              {{ $i18n.t("CLIENT.EMAIL_FORMAT_EXPECTED") }}
            </p>
          </div>

          <div>
            <Label>{{ $i18n.t("CLIENT.ROLE") }}</Label>
            <Select v-model="formData.role">
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">{{ $i18n.t("CLIENT.ADMIN") }}</SelectItem>
                <SelectItem value="user">{{ $i18n.t("CLIENT.USER") }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="flex justify-end space-x-4">
          <Button variant="outline" @click="closeModal(false)"> {{ $i18n.t("BUTTON.CANCEL") }} </Button>
          <Button
            type="submit"
            :disabled="!isValidForm"
            class="bg-gray-600 hover:bg-gray-700"
            @click.prevent="handleSubmit"
          >
            {{ props.client ? $i18n.t("BUTTON.UPDATE") : $i18n.t("BUTTON.ADD") }}
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
