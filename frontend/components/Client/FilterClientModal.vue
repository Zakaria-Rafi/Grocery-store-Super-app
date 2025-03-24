<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { $api } from "@/utils/apiService";
import { useToast } from "../ui/toast";

const props = defineProps<{
  isOpen: boolean;
  savedFilters: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: "all" | "admin" | "user";
    minOrders?: string;
    maxOrders?: string;
    minSpent?: string;
    maxSpent?: string;
  };
}>();

const { toast } = useToast();

const emit = defineEmits<{
  "update:isOpen": [value: boolean];
  filter: [
    filters: {
      firstName?: string;
      lastName?: string;
      email?: string;
      role?: "all" | "admin" | "user";
      minOrders?: string;
      maxOrders?: string;
      minSpent?: string;
      maxSpent?: string;
    },
  ];
  reset: [];
}>();

const filters = ref<{
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: "all" | "admin" | "user";
  minOrders?: string;
  maxOrders?: string;
  minSpent?: string;
  maxSpent?: string;
}>({
  firstName: "",
  lastName: "",
  email: "",
  role: "all",
  minOrders: "",
  maxOrders: "",
  minSpent: "",
  maxSpent: "",
});

const { $i18n } = useNuxtApp();

// États pour l'autocomplétion
const firstNameSuggestions = ref<string[]>([]);
const lastNameSuggestions = ref<string[]>([]);
const showFirstNameSuggestions = ref(false);
const showLastNameSuggestions = ref(false);
const allUsers = ref<
  {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: "admin" | "user";
  }[]
>([]);

const emailSuggestions = ref<string[]>([]);
const showEmailSuggestions = ref(false);

const loadUsers = async () => {
  try {
    const response = await $api("/users");
    if (Array.isArray(response)) {
      allUsers.value = response;
    }
  } catch {
    toast({
      title: "Erreur lors du chargement des utilisateurs",
      description: "Veuillez réessayer plus tard",
    });
  }
};

const updateFirstNameSuggestions = (query: string) => {
  if (!query) {
    firstNameSuggestions.value = [];
    showFirstNameSuggestions.value = false;
    return;
  }

  const suggestions = [
    ...new Set(
      allUsers.value
        .map((user) => user.firstName)
        .filter((name) => name && name.toLowerCase().includes(query.toLowerCase())),
    ),
  ];
  firstNameSuggestions.value = suggestions;
  showFirstNameSuggestions.value = suggestions.length > 0;
};

const updateLastNameSuggestions = (query: string) => {
  if (!query) {
    lastNameSuggestions.value = [];
    showLastNameSuggestions.value = false;
    return;
  }

  const suggestions = [
    ...new Set(
      allUsers.value
        .map((user) => user.lastName)
        .filter((name) => name && name.toLowerCase().includes(query.toLowerCase())),
    ),
  ];
  lastNameSuggestions.value = suggestions;
  showLastNameSuggestions.value = suggestions.length > 0;
};

const updateEmailSuggestions = (query: string) => {
  if (!query) {
    emailSuggestions.value = [];
    showEmailSuggestions.value = false;
    return;
  }

  const suggestions = [
    ...new Set(
      allUsers.value
        .map((user) => user.email)
        .filter((email) => email && email.toLowerCase().includes(query.toLowerCase())),
    ),
  ];
  emailSuggestions.value = suggestions;
  showEmailSuggestions.value = suggestions.length > 0;
};

const onFirstNameInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  filters.value.firstName = value;
  updateFirstNameSuggestions(value);
};

const onLastNameInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  filters.value.lastName = value;
  updateLastNameSuggestions(value);
};

const onEmailInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  filters.value.email = value;
  updateEmailSuggestions(value);
};

const selectFirstName = (name: string) => {
  filters.value.firstName = name;
  showFirstNameSuggestions.value = false;
};

const selectLastName = (name: string) => {
  filters.value.lastName = name;
  showLastNameSuggestions.value = false;
};

const selectEmail = (email: string) => {
  filters.value.email = email;
  showEmailSuggestions.value = false;
};

watch(
  () => props.savedFilters,
  (newFilters) => {
    if (newFilters) {
      filters.value = { ...newFilters };
    }
  },
  { immediate: true },
);

const handleSubmit = () => {
  emit("filter", filters.value);
  emit("update:isOpen", false);
};

const handleReset = () => {
  filters.value = {
    firstName: "",
    lastName: "",
    email: "",
    role: "all",
    minOrders: "",
    maxOrders: "",
    minSpent: "",
    maxSpent: "",
  };
  emit("reset");
};

const closeModal = (value: boolean) => {
  const target = event?.target as HTMLElement;
  const isResetButton = target?.closest("button")?.textContent?.includes("Réinitialiser");

  if (!isResetButton) {
    emit("update:isOpen", value);
  }
};

onMounted(loadUsers);

const activeFiltersCount = computed(() => {
  let count = 0;
  const f = filters.value;

  if (f.firstName) count++;
  if (f.lastName) count++;
  if (f.email) count++;
  if (f.role && f.role !== "all") count++;
  if (f.minOrders) count++;
  if (f.maxOrders) count++;
  if (f.minSpent) count++;
  if (f.maxSpent) count++;

  return count;
});
</script>

<template>
  <Dialog :open="isOpen" :modal="true" @update:open="closeModal">
    <DialogContent class="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>{{ $i18n.t("CLIENT.FILTER_CLIENTS") }}</DialogTitle>
      </DialogHeader>
      <div class="grid gap-6 py-4">
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="relative">
              <Label>{{ $i18n.t("CLIENT.FIRST_NAME") }}</Label>
              <Input
                v-model="filters.firstName"
                :placeholder="$i18n.t('CLIENT.FIRST_NAME_PLACEHOLDER')"
                class="mt-2"
                @input="onFirstNameInput"
                @focus="showFirstNameSuggestions = true"
              />
              <div
                v-if="showFirstNameSuggestions && firstNameSuggestions.length > 0"
                class="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg"
              >
                <div
                  v-for="suggestion in firstNameSuggestions"
                  :key="suggestion"
                  class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  @click="selectFirstName(suggestion)"
                >
                  {{ suggestion }}
                </div>
              </div>
            </div>

            <div class="relative">
              <Label>{{ $i18n.t("CLIENT.LAST_NAME") }}</Label>
              <Input
                v-model="filters.lastName"
                :placeholder="$i18n.t('CLIENT.LAST_NAME_PLACEHOLDER')"
                class="mt-2"
                @input="onLastNameInput"
                @focus="showLastNameSuggestions = true"
              />

              <div
                v-if="showLastNameSuggestions && lastNameSuggestions.length > 0"
                class="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg"
              >
                <div
                  v-for="suggestion in lastNameSuggestions"
                  :key="suggestion"
                  class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  @click="selectLastName(suggestion)"
                >
                  {{ suggestion }}
                </div>
              </div>
            </div>
          </div>

          <div class="relative">
            <Label>{{ $i18n.t("CLIENT.EMAIL") }}</Label>
            <Input
              v-model="filters.email"
              :placeholder="$i18n.t('CLIENT.EMAIL_PLACEHOLDER')"
              class="mt-2"
              @input="onEmailInput"
              @focus="showEmailSuggestions = true"
            />
            <div
              v-if="showEmailSuggestions && emailSuggestions.length > 0"
              class="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg"
            >
              <div
                v-for="suggestion in emailSuggestions"
                :key="suggestion"
                class="px-4 py-2 hover:bg-gray-100 cursor-pointer truncate"
                @click="selectEmail(suggestion)"
              >
                {{ suggestion }}
              </div>
            </div>
          </div>

          <div>
            <Label>{{ $i18n.t("CLIENT.ROLE") }}</Label>
            <Select v-model="filters.role">
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{{ $i18n.t("CLIENT.ALL") }}</SelectItem>
                <SelectItem value="admin">{{ $i18n.t("CLIENT.ADMIN") }}</SelectItem>
                <SelectItem value="user">{{ $i18n.t("CLIENT.USER") }}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label>{{ $i18n.t("CLIENT.MIN_ORDERS") }}</Label>
              <Input v-model="filters.minOrders" type="number" placeholder="Min" class="mt-2" />
            </div>
            <div>
              <Label>{{ $i18n.t("CLIENT.MAX_ORDERS") }}</Label>
              <Input v-model="filters.maxOrders" type="number" placeholder="Max" class="mt-2" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label>{{ $i18n.t("CLIENT.MIN_SPENT") }}</Label>
              <Input v-model="filters.minSpent" type="number" placeholder="Min" class="mt-2" />
            </div>
            <div>
              <Label>{{ $i18n.t("CLIENT.MAX_SPENT") }}</Label>
              <Input v-model="filters.maxSpent" type="number" placeholder="Max" class="mt-2" />
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-4">
          <Button variant="outline" @click="handleReset"> {{ $i18n.t("BUTTON.RESET") }} </Button>
          <Button @click="handleSubmit">
            {{ $i18n.t("BUTTON.FILTER") }}
            <span v-if="activeFiltersCount > 0" class="ml-1 text-xs"> ({{ activeFiltersCount }}) </span>
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
.suggestions-list {
  max-height: 200px;
  overflow-y: auto;
}
</style>
