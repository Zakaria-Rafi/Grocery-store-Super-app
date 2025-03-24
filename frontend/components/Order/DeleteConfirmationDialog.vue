<template>
  <Dialog :open="isOpen" @update:open="$emit('update:isOpen', $event)">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogDescription>
          Êtes-vous sûr de vouloir supprimer {{ selectedCount }} commande(s) ?
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

defineProps<{
  isOpen: boolean
  selectedCount: number
}>()

defineEmits<{
  'update:isOpen': [value: boolean]
  'confirm': []
}>()
</script> 