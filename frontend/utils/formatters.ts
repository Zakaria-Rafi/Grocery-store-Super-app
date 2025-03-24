export const formatDate = (dateString: string): string => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  
  // Vérifier si la date est valide
  if (isNaN(date.getTime())) {
    return dateString // Retourner la chaîne originale si la date est invalide
  }

  // Options de formatage
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }

  // Formatter la date en français
  return new Intl.DateTimeFormat('fr-FR', options).format(date)
}

// Vous pouvez ajouter d'autres fonctions de formatage ici
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

export const formatNumber = (number: number): string => {
  return new Intl.NumberFormat('fr-FR').format(number)
}

// Format pour le statut
export const formatStatus = (status: string): string => {
  if (!status) return 'N/A'
  
  const statusMap: { [key: string]: string } = {
    'pending': 'En attente',
    'processing': 'En cours',
    'shipped': 'Expédié',
    'delivered': 'Livré',
    'cancelled': 'Annulé',
    'payment_pending': 'En attente',
    'payment_success': 'Payé',
    'payment_failed': 'Échec',
  }
  
  return statusMap[status.toLowerCase()] || status || 'N/A'
} 