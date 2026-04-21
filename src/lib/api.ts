export async function fetchHello() {
  const response = await fetch('/api/hello')
  if (!response.ok) {
    throw new Error(`API falhou com status ${response.status}`)
  }
  return response.json()
}
