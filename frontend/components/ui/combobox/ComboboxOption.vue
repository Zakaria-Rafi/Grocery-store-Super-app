<template>
  <div
    @click="select"
    :class="[
      'relative cursor-default select-none py-2 pl-3 pr-9',
      isSelected || isActive ? 'bg-primary text-primary-foreground' : 'text-gray-900'
    ]"
  >
    <slot :selected="isSelected" :active="isActive"></slot>
  </div>
</template>

<script setup lang="ts">
import { inject, ref, computed } from 'vue'

const props = defineProps<{
  value: any
}>()

const selectedValue = inject('selectedValue') as any
const updateValue = inject('updateValue') as (value: any) => void

const isActive = ref(false)
const isSelected = computed(() => selectedValue.value === props.value)

const select = () => {
  updateValue(props.value)
}
</script> 