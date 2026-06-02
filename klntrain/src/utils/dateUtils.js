// Chuyển YYYY-MM-DD hoặc DD/MM/YYYY thành DD/MM/YYYY
export const formatDate = (dateStr) => {
  if (!dateStr) return '--/--/----'
  if (dateStr.includes('/')) return dateStr
  const parts = dateStr.split('-')
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr
}
