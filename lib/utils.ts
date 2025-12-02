/**
 * Génère un token d'invitation unique et sécurisé
 * @returns Token aléatoire de 12 caractères
 */
export function generateInviteToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 12; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

/**
 * Formate une durée en secondes vers un format lisible
 * @param seconds - Durée en secondes
 * @returns Chaîne formatée (ex: "1h 23m")
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

/**
 * Formate une distance en mètres vers kilomètres
 * @param meters - Distance en mètres
 * @returns Distance formatée en km avec 2 décimales
 */
export function formatDistance(meters: number): string {
  const km = meters / 1000
  return `${km.toFixed(2)} km`
}

/**
 * Formate l'élévation
 * @param meters - Élévation en mètres
 * @returns Élévation formatée
 */
export function formatElevation(meters: number): string {
  return `${Math.round(meters)} m`
}
