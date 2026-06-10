import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { api } from '@/services/api'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatInterface() {
  const clinicId = useAuthStore((state) => state.user?.clinic.id)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSend = async () => {
    if (!input.trim() || !clinicId) return

    const userMessage = input
    setInput('')
    setError('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const response = await api.post(`/ai/${clinicId}/chat`, {
        message: userMessage,
        conversationHistory: messages,
      })

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response.data.message },
      ])
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to get response')
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error processing your request.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow flex flex-col h-full max-h-[600px]">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <p className="text-lg font-semibold">🤖 CFO Virtual Assistant</p>
            <p className="text-sm mt-2">Ask financial questions about your clinic</p>
            <p className="text-xs mt-4 text-gray-400">
              Get insights on revenue, expenses, profitability, and more
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-sm px-4 py-2 rounded-lg text-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg text-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-100"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-200"></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="px-6 py-2 bg-red-50 border-t border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about revenue, expenses, profitability..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium text-sm transition"
          >
            {loading ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}
