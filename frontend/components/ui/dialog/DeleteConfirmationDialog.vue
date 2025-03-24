<template>
  <Dialog :open="isOpen" @update:open="$emit('update:isOpen', $event)">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Confirmation de suppression</DialogTitle>
        <DialogDescription>
          {{ message }}
          Cette action est irréversible.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" @click="$emit('update:isOpen', false)">
          Annuler
        </Button>
        <Button variant="destructive" @click="$emit('confirm')">
          Supprimer
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

defineProps<{
  isOpen: boolean
  message: string
}>()

defineEmits<{
  'update:isOpen': [value: boolean]
  'confirm': []
}>()
</script> 