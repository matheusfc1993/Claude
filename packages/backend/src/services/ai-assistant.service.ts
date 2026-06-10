import Anthropic from '@anthropic-ai/sdk';
import { PrismaClient } from '@prisma/client';
import metricsService from './metrics.service.js';

const prisma = new PrismaClient();
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export class AIAssistantService {
  async chat(
    clinicId: string,
    userId: string,
    userMessage: string,
    conversationHistory: ChatMessage[] = []
  ): Promise<{ message: string; tokensUsed: number }> {
    // Get clinic context and recent metrics
    const [context, metrics, recentConversations] = await Promise.all([
      this.getClinicContext(clinicId),
      metricsService.getKPISummary(clinicId, 30),
      this.getRecentConversations(clinicId, 5),
    ]);

    // Build system prompt with context
    const systemPrompt = this.buildSystemPrompt(context, metrics);

    // Prepare messages for Claude
    const messages: Anthropic.MessageParam[] = [
      ...recentConversations.slice(0, 4).map((msg) => ({
        role: msg.messageType as 'user' | 'assistant',
        content: msg.content,
      })),
      ...conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: 'user' as const,
        content: userMessage,
      },
    ];

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const assistantMessage = response.content[0].type === 'text' ? response.content[0].text : '';
    const tokensUsed = response.usage.input_tokens + response.usage.output_tokens;

    // Save conversation
    await Promise.all([
      prisma.aIConversation.create({
        data: {
          clinicId,
          userId,
          messageType: 'USER',
          content: userMessage,
          tokens: response.usage.input_tokens,
        },
      }),
      prisma.aIConversation.create({
        data: {
          clinicId,
          userId,
          messageType: 'ASSISTANT',
          content: assistantMessage,
          tokens: response.usage.output_tokens,
        },
      }),
    ]);

    // Update context if insights are relevant
    await this.updateContextIfNeeded(clinicId, userMessage, assistantMessage);

    return {
      message: assistantMessage,
      tokensUsed,
    };
  }

  async generateDailyReport(clinicId: string): Promise<any> {
    // Get metrics for the last 24 hours
    const metrics = await metricsService.getKPISummary(clinicId, 1);
    const previousMetrics = await metricsService.getKPISummary(clinicId, 8, 7);
    const context = await this.getClinicContext(clinicId);

    const systemPrompt = `You are a CFO Virtual expert analyzing clinic financial data.
Provide a concise executive report focusing on:
1. Current financial health diagnosis
2. Impact in numbers
3. Main cause/driver
4. Priority recommendation
5. Urgency level (LOW/MEDIUM/HIGH/CRITICAL)

Keep responses brief, data-driven, and actionable.`;

    const userPrompt = `Generate executive report for clinic "${context.businessInfo?.clinicName || 'Clinic'}".

Current metrics (last 24h):
- Revenue: R$ ${metrics.revenue.toLocaleString('pt-BR')}
- Expenses: R$ ${metrics.expenses.toLocaleString('pt-BR')}
- Net Income: R$ ${metrics.netIncome.toLocaleString('pt-BR')}
- Profit Margin: ${metrics.profitMargin}%
- Appointments: ${metrics.appointmentCount}

Previous period (same period last week):
- Revenue: R$ ${previousMetrics.revenue.toLocaleString('pt-BR')}
- Net Income: R$ ${previousMetrics.netIncome.toLocaleString('pt-BR')}

Business context:
- Specialization: ${context.businessInfo?.specialization || 'General'}
- Staff count: ${context.businessInfo?.numberOfProfessionals || 0}
- Services: ${context.businessInfo?.serviceTypes?.join(', ') || 'Not specified'}

Generate JSON report with: diagnosis, financialImpact, mainCause, priorityRecommendation, urgencyLevel, insights (array), alerts (array).`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '{}';

    // Parse JSON response
    let reportData: any;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      reportData = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch {
      reportData = {
        diagnosis: content,
        financialImpact: `Revenue: R$ ${metrics.revenue}, Net: R$ ${metrics.netIncome}`,
        mainCause: 'Data analysis in progress',
        priorityRecommendation: 'Review current financial metrics',
        urgencyLevel: 'MEDIUM',
      };
    }

    // Save report
    const report = await prisma.executiveReport.create({
      data: {
        clinicId,
        reportDate: new Date(),
        diagnosis: reportData.diagnosis || '',
        financialImpact: reportData.financialImpact || '',
        mainCause: reportData.mainCause || '',
        priorityRecommendation: reportData.priorityRecommendation || '',
        urgencyLevel: reportData.urgencyLevel || 'MEDIUM',
        metrics: JSON.stringify(metrics),
      },
    });

    return report;
  }

  // Private methods

  private async getClinicContext(clinicId: string): Promise<any> {
    const contexts = await prisma.aIContext.findMany({
      where: { clinicId },
      orderBy: { importance: 'desc' },
    });

    const parsed: any = {};
    contexts.forEach((ctx) => {
      try {
        parsed[ctx.contextType] = JSON.parse(ctx.content);
      } catch {
        parsed[ctx.contextType] = ctx.content;
      }
    });

    return parsed;
  }

  private async getRecentConversations(clinicId: string, limit: number): Promise<any[]> {
    return prisma.aIConversation.findMany({
      where: { clinicId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  private async updateContextIfNeeded(
    clinicId: string,
    userMessage: string,
    assistantResponse: string
  ): Promise<void> {
    // Check if response contains important business insights
    if (assistantResponse.length > 500) {
      // Store as potential insight
      const exists = await prisma.aIContext.findFirst({
        where: {
          clinicId,
          contextType: 'recent_insights',
        },
      });

      if (exists) {
        await prisma.aIContext.update({
          where: { id: exists.id },
          data: {
            content: assistantResponse,
            lastUpdated: new Date(),
          },
        });
      } else {
        await prisma.aIContext.create({
          data: {
            clinicId,
            contextType: 'recent_insights',
            content: assistantResponse,
            importance: 3,
          },
        });
      }
    }
  }

  private buildSystemPrompt(context: any, metrics: any): string {
    return `You are a specialized CFO Virtual assistant for healthcare clinics and consultories.
You provide expert financial guidance, analysis, and recommendations.

CLINIC CONTEXT:
${JSON.stringify(context, null, 2)}

CURRENT METRICS (30 days):
- Total Revenue: R$ ${metrics.revenue.toLocaleString('pt-BR')}
- Total Expenses: R$ ${metrics.expenses.toLocaleString('pt-BR')}
- Net Income: R$ ${metrics.netIncome.toLocaleString('pt-BR')}
- Profit Margin: ${metrics.profitMargin}%
- Appointment Count: ${metrics.appointmentCount}
- Active Staff: ${metrics.activeStaff}

BEHAVIORAL RULES:
1. Always be concise, direct, and data-driven
2. Focus on actionable insights
3. Identify risks, opportunities, and bottlenecks
4. Consider healthcare-specific factors (seasonality, patient patterns)
5. Provide specific, quantified recommendations
6. Consider LGPD compliance in all recommendations
7. Ask clarifying questions if data is ambiguous
8. Acknowledge limitations in analysis

RESPONSE STYLE:
- Use Portuguese (pt-BR) for responses
- Format numbers with Brazilian locale
- Use financial terminology appropriately
- Structure complex answers with bullet points
- Always cite data sources when making claims`;
  }
}

export default new AIAssistantService();
