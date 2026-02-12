import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export async function sendMessageToAI(question: string): Promise<string> {
  try {
    const response = await api.post('/chat/ask/', { question })
    return response.data.answer
  } catch (error) {
    console.error('Error sending message to AI:', error)
    throw new Error("Erreur lors de la communication avec l'API")
  }
}
