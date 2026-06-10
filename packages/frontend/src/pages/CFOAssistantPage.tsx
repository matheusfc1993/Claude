import MainLayout from '@/components/layout/MainLayout'
import ChatInterface from '@/components/cfo-assistant/ChatInterface'

export default function CFOAssistantPage() {
  return (
    <MainLayout>
      <div className="h-full space-y-6">
        <h1 className="text-3xl font-bold">CFO Virtual Assistant</h1>
        <ChatInterface />
      </div>
    </MainLayout>
  )
}
