<template>
  <div class="min-h-screen w-full bg-gray-100 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative">
      <!-- Icône de chargement -->
      <div class="w-16 h-16 mx-auto mb-4">
        <div class="w-full h-full border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"/>
      </div>

      <!-- Message -->
      <h3 class="text-xl font-bold text-center mb-2">
        Traitement du paiement
      </h3>
      <p class="text-gray-600 text-center">
        Veuillez patienter pendant que nous validons votre paiement...
      </p>
    </div>
  </div>
</template>

<script setup>
import { useToast } from "@/components/ui/toast"

definePageMeta({
  layout: 'blank',
  auth: false
})

const { toast } = useToast()

onMounted(async () => {
  const route = useRoute()
  const token = route.query.token
  const PayerID = route.query.PayerID
  
  // Vérifier si on a une erreur dans les paramètres PayPal
  if (route.query.error || !token || !PayerID) {
    toast({
      title: "Erreur de paiement",
      description: "Le paiement PayPal a échoué. Veuillez réessayer.",
      variant: "destructive"
    })
    navigateTo('/auth')
    return
  }

  try {
    // Capturer le paiement PayPal
    const response = await $api('cart/capturePaypal', {
      method: 'POST',
      body: {
        orderId: token
      }
    })

    if (response) {
      // Si la capture est réussie, rediriger vers la page de succès
      navigateTo(`/borne/payment-success?token=${token}&PayerID=${PayerID}`)
    }
  } catch (error) {
    // En cas d'erreur lors de la capture
    toast({
      title: "Erreur de paiement",
      description: error.message || "Une erreur est survenue lors de la validation du paiement.",
      variant: "destructive"
    })
    navigateTo('/auth')
  }
})
</script>

<style scoped>
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style> 