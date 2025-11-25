export function saveState<T>(key: string, value: T | null) {
  if (value === null) {
    localStorage.removeItem(key)
    return
  }
  localStorage.setItem(key, JSON.stringify(value))
}

export function loadState<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function clearState(key: string) {
  localStorage.removeItem(key)
}

