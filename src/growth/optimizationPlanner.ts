export interface PlanStep {
  id: string;
  order: number;
  title: string;
  assignedAgent: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  expectedDays: number;
}

export interface GrowthActionPlan {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'approved' | 'active' | 'completed' | 'archived';
  steps: PlanStep[];
  successCriteria: string;
  createdAt: string;
  approvedAt?: string;
}

export class OptimizationPlanner {
  private static actionPlans: GrowthActionPlan[] = [
    {
      id: 'plan_launch_scale_01',
      title: 'Plano Estratégico de Escala de Tráfego Pago B2B',
      description: 'Estruturação de um funil otimizado de vendas B2B, integrando criativos novos, headlines de copywriting de alta conversão e suporte via WhatsApp.',
      status: 'active',
      successCriteria: 'Atingir ROI mínimo de 3.5x e capturar mais de 500 leads qualificados.',
      createdAt: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
      approvedAt: new Date(Date.now() - 410000000).toISOString(),
      steps: [
        {
          id: 'step_scale_01',
          order: 1,
          title: 'Pesquisa de referências e dores do nicho de IA Corporativa',
          assignedAgent: 'Research Agent',
          status: 'completed',
          expectedDays: 2
        },
        {
          id: 'step_scale_02',
          order: 2,
          title: 'Criação de novos criativos e headlines otimizadas',
          assignedAgent: 'Writer Agent',
          status: 'completed',
          expectedDays: 1
        },
        {
          id: 'step_scale_03',
          order: 3,
          title: 'Desenvolvimento das peças e criativos em formato carrossel',
          assignedAgent: 'Designer Agent',
          status: 'running',
          expectedDays: 2
        },
        {
          id: 'step_scale_04',
          order: 4,
          title: 'Configuração das campanhas de tráfego e pixel no Meta Ads',
          assignedAgent: 'Marketing Agent',
          status: 'pending',
          expectedDays: 1
        },
        {
          id: 'step_scale_05',
          order: 5,
          title: 'Ativação do conector de WhatsApp Business para respostas rápidas',
          assignedAgent: 'Integration Brain Agent',
          status: 'pending',
          expectedDays: 1
        }
      ]
    },
    {
      id: 'plan_retention_01',
      title: 'Melhoria Global de Retenção e Redução de Churn',
      description: 'Auditar e otimizar a experiência pós-venda para novos assinantes reduzindo reembolsos e cancelamentos precoces.',
      status: 'draft',
      successCriteria: 'Reduzir taxa de Churn mensal de 5.2% para menos de 4.0%.',
      createdAt: new Date().toISOString(),
      steps: [
        {
          id: 'step_ret_01',
          order: 1,
          title: 'Auditoria de feedbacks e pontos de desistência comuns',
          assignedAgent: 'Customer Success Agent',
          status: 'pending',
          expectedDays: 3
        },
        {
          id: 'step_ret_02',
          order: 2,
          title: 'Implementar e-mails de onboarding interativos automáticos',
          assignedAgent: 'Writer Agent',
          status: 'pending',
          expectedDays: 2
        }
      ]
    }
  ];

  public static getActionPlans(): GrowthActionPlan[] {
    return this.actionPlans;
  }

  public static createActionPlan(plan: GrowthActionPlan): void {
    this.actionPlans.push(plan);
  }

  public static approvePlan(id: string): boolean {
    const plan = this.actionPlans.find(p => p.id === id);
    if (plan) {
      plan.status = 'active';
      plan.approvedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  public static updateStepStatus(planId: string, stepId: string, status: PlanStep['status']): boolean {
    const plan = this.actionPlans.find(p => p.id === planId);
    if (plan) {
      const step = plan.steps.find(s => s.id === stepId);
      if (step) {
        step.status = status;
        
        // Se todas as etapas estiverem completas, atualiza o plano automaticamente
        const allCompleted = plan.steps.every(s => s.status === 'completed');
        if (allCompleted) {
          plan.status = 'completed';
        }
        return true;
      }
    }
    return false;
  }
}
