<script setup lang="ts">
import { ref, watch } from "vue";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Checkbox from "./checkbox/Checkbox.vue";

interface Item {
  id: string | number;
  label: string;
}

const props = defineProps<{
  items: Item[];
  modelValue: string[];
  label: string;
  placeholder?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string[]];
}>();

const selectedItems = ref<Set<string>>(new Set(props.modelValue));

watch(selectedItems, (newValue) => {
  emit("update:modelValue", Array.from(newValue));
});

const toggleItem = (itemId: string) => {
  const newSet = new Set(selectedItems.value);
  if (newSet.has(itemId)) {
    newSet.delete(itemId);
  } else {
    newSet.add(itemId);
  }
  selectedItems.value = newSet;
};

const getSelectedLabel = () => {
  if (selectedItems.value.size === 0) return props.placeholder || "Sélectionner...";
  return `${selectedItems.value.size} sélectionné${selectedItems.value.size > 1 ? "s" : ""}`;
};
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="outline" class="w-full justify-between">
        {{ getSelectedLabel() }}
        <ChevronDown class="ml-2 h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent class="w-56">
      <DropdownMenuLabel>{{ label }}</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <div class="max-h-[300px] overflow-y-auto">
        <div
          v-for="item in items"
          :key="item.id"
          class="relative flex cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
          @click="toggleItem(item.id.toString())"
        >
          <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
            <Checkbox :checked="selectedItems.has(item.id.toString())" />
          </span>
          <span class="pl-6">{{ item.label }}</span>
        </div>
      </div>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
