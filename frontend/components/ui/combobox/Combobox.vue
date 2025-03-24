<template>
  <div class="relative">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { provide, ref } from 'vue'

const props = defineProps<{
  modelValue: any
}>()

const emit = defineEmits<{
  'update:modelValue': [value: any]
}>()

const selectedValue = ref(props.modelValue)

provide('selectedValue', selectedValue)
provide('updateValue', (value: any) => {
  selectedValue.value = value
  emit('update:modelValue', value)
})
</script> 