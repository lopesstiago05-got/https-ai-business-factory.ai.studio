import fs from 'fs';
import path from 'path';
import { AIIncident, IncidentStatusType } from './enterpriseTypes.ts';
import { GoogleGenAI } from '@google/genai';
import { AuditService } from './auditService.ts';
import { MonitoringService } from './monitoringService.ts';
import { ModelManager } from '../kernel/ModelManager.ts';

const INCIDENTS_FILE = path.join(process.cwd(), 'incidents_db.json');

export class AlertEngine {
  private static loadIncidents(): AIIncident[] {
    try {
      if (fs.existsSync(INCIDENTS_FILE)) {
        const content = fs.readFileSync(INCIDENTS_FILE, 'utf-8');
        return JSON.parse(content) as AIIncident[];
      }
    } catch (err: any) {
      console.error('[AlertEngine] Erro ao carregar incidentes:', err.message);
    }
    return this.getInitialIncidents();
  }

  private static saveIncidents(incidents: AIIncident[]): void {
    try {
      fs.writeFileSync(INCIDENTS_FILE, JSON.stringify(incidents, null, 2), 'utf-8');
    } catch (err: any) {
      console.error('[AlertEngine] Erro ao salvar incidentes:', err.message);
    }
  }

  private static getInitialIncidents(): AIIncident[] {
    const defaultIncidents: AIIncident[] = [
      {
        id: 'inc_1',
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
        agentId: 'marketing-center',
        type: 'AGENT_FAILURE',
        description: 'Marketing Agent apresentou múltiplos erros consecutivos de timeouts com a API externa.',
        probableCause: 'Instabilidade de rede ou limite de concorrência esgotado na API do Meta/Instagram.',
        impactAnalysis: 'Campanhas publicitárias agendadas sofreram atraso de veiculação.',
        recommendedAction: 'Aumentar timeout de requisição para 15s e configurar retry exponencial de 3 tentativas.',
        status: 'OPEN'
      },
      {
        id: 'inc_2',
        timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
        type: 'SYSTEM_DEGRADATION',
        description: 'Tempo médio de resposta do Designer Agent subiu de 2.1s para 4.2s.',
        probableCause: 'Sobrecarga de geração de layouts vetoriais pesados de alta resolução.',
        impactAnalysis: 'Gargalo menor na esteira de produção criativa de peças gráficas.',
        recommendedAction: 'Habilitar cache de assets recorrentes e otimizar compressão em lote.',
        status: 'RESOLVED',
        resolvedAt: new Date(Date.now() - 3600000 * 7).toISOString()
      }
    ];
    try {
      fs.writeFileSync(INCIDENTS_FILE, JSON.stringify(defaultIncidents, null, 2), 'utf-8');
    } catch {}
    return defaultIncidents;
  }

  public static getIncidents(): AIIncident[] {
    return this.loadIncidents().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Dispara um incidente de forma inteligente
   */
  public static async raiseIncident(
    type: AIIncident['type'],
    description: string,
    agentId?: string,
    tenantId: string = 'tenant_default'
  ): Promise<AIIncident> {
    const incidents = this.loadIncidents();
    
    // Análise inteligente de causa e recomendação
    const aiAnalysis = await this.analyzeIncidentWithAI(agentId || 'sistema', type, description);

    const newIncident: AIIncident = {
      id: `inc_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      agentId,
      type,
      description,
      probableCause: aiAnalysis.probableCause,
      impactAnalysis: aiAnalysis.impact,
      recommendedAction: aiAnalysis.recommendation,
      status: 'OPEN'
    };

    incidents.push(newIncident);
    this.saveIncidents(incidents);

    // Atualiza status do agente se for uma falha de agente
    if (agentId && type === 'AGENT_FAILURE') {
      MonitoringService.setAgentStatus(agentId, 'ERROR');
    } else if (agentId && type === 'SYSTEM_DEGRADATION') {
      MonitoringService.setAgentStatus(agentId, 'DEGRADED');
    }

    // Registrar no log de auditoria
    AuditService.register(
      tenantId,
      'system',
      'incident_response@enterprise.com',
      'SECURITY_EVENT',
      'SUCCESS',
      { incidentId: newIncident.id, incidentType: type, description: newIncident.description },
      agentId
    );

    return newIncident;
  }

  public static resolveIncident(id: string): boolean {
    const incidents = this.loadIncidents();
    const idx = incidents.findIndex(i => i.id === id);
    if (idx !== -1) {
      const incident = incidents[idx];
      incident.status = 'RESOLVED';
      incident.resolvedAt = new Date().toISOString();
      this.saveIncidents(incidents);

      // Se havia um agente associado, restaurar status
      if (incident.agentId) {
        MonitoringService.setAgentStatus(incident.agentId, 'ONLINE');
      }

      // Registrar resolução
      AuditService.register(
        'tenant_default',
        'system',
        'incident_response@enterprise.com',
        'SECURITY_EVENT',
        'SUCCESS',
        { incidentId: id, status: 'RESOLVED', description: `Incidente ${id} marcado como resolvido.` },
        incident.agentId
      );

      return true;
    }
    return false;
  }

  private static async analyzeIncidentWithAI(
    target: string,
    type: string,
    description: string
  ): Promise<{ probableCause: string; impact: string; recommendation: string }> {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      // Fallback estático de regras heurísticas inteligentes
      return this.getStaticFallbackAnalysis(target, type, description);
    }

    try {
      const ai = new GoogleGenAI({ apiKey: key });
      const prompt = `Analise o seguinte incidente de IA em nosso Operations Center:
Agente/Módulo: ${target}
Tipo do Evento: ${type}
Descrição: ${description}

Retorne um objeto JSON estrito contendo:
{
  "probableCause": "string explicando a causa provável mais realista",
  "impact": "string explicando o impacto provável na operação",
  "recommendation": "string com recomendação exata passo-a-passo para mitigação"
}`;

      const response = await ModelManager.generateContent('alert_engine', ai, {
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const responseText = response.text || '';
      return JSON.parse(responseText);
    } catch (err: any) {
      console.warn('[AlertEngine] Falha ao analisar com Gemini, usando heurísticas:', err.message);
      return this.getStaticFallbackAnalysis(target, type, description);
    }
  }

  private static getStaticFallbackAnalysis(
    target: string,
    type: string,
    description: string
  ): { probableCause: string; impact: string; recommendation: string } {
    if (type === 'AGENT_FAILURE') {
      return {
        probableCause: `Falha de conexão persistente com o modelo ou timeouts na requisição do agente ${target}.`,
        impact: 'Atraso na execução do fluxo de trabalho automatizado e potenciais tarefas travadas na fila.',
        recommendation: `Reiniciar as instâncias do agente ${target}, validar chaves de API na aba Configurações e aplicar retry exponencial.`
      };
    } else if (type === 'SECURITY_ALERT') {
      return {
        probableCause: 'Múltiplas requisições originárias de fontes externas não autenticadas ou alteração suspeita de credenciais.',
        impact: 'Exposição parcial de metadados operacionais ou faturamento excedente por chamadas indesejadas.',
        recommendation: 'Ativar autenticação de dois fatores, rotacionar credenciais e bloquear IPs de origem suspeita.'
      };
    } else {
      return {
        probableCause: 'Sobrecarga de concorrência ou recursos temporariamente limitados devido a alto fluxo de dados.',
        impact: 'Aumento na latência geral das respostas percebida pelos usuários finais.',
        recommendation: 'Habilitar cache de dados persistentes, escalonar limite de recursos de backend e redefinir prioridades.'
      };
    }
  }
}
