// Chuyển YYYY-MM-DD hoặc DD/MM/YYYY thành DD/MM/YYYY
export const formatDate = (dateStr) => {
  if (!dateStr) return '--/--/----'
  if (dateStr.includes('/')) return dateStr
  // Strip time portion from ISO datetime strings (e.g. "2026-05-26T00:00:00.000Z")
  const dateOnly = dateStr.includes('T') ? dateStr.slice(0, 10) : dateStr
  const parts = dateOnly.split('-')
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr
}
