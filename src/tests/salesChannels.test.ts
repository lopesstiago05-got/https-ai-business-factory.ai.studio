import { SalesChannelService } from '../salesChannels/salesChannelService.ts';

export async function runSalesChannelTests() {
  const results: { name: string; success: boolean; error?: string }[] = [];

  const runTest = async (name: string, fn: () => Promise<void> | void) => {
    try {
      await fn();
      results.push({ name, success: true });
    } catch (err: any) {
      results.push({ name, success: false, error: err.message || String(err) });
    }
  };

  // 1. Canal conectado
  await runTest('Vincular e desconectar canais oficiais', async () => {
    const channel = SalesChannelService.connectChannel('instagram', '@meu_canal_teste');
    if (channel.status !== 'CONNECTED' || channel.username !== '@meu_canal_teste') {
      throw new Error('Falha ao conectar canal do Instagram.');
    }

    const disconnectOk = SalesChannelService.disconnectChannel(channel.id);
    if (!disconnectOk) {
      throw new Error('Falha ao desconectar canal do Instagram.');
    }
  });

  // 2. Publicação de conteúdo
  await runTest('Adaptar e publicar conteúdo de mídia social', async () => {
    const post = await SalesChannelService.publishContent('instagram', 'Quer automatizar suas vendas? Veja esse método novo.');
    if (!post || post.status !== 'published') {
      throw new Error('Falha ao publicar conteúdo adaptado no feed.');
    }
    if (!post.caption || post.hashtags.length === 0) {
      throw new Error('O post publicado está com metadados ou legenda em branco.');
    }
  });

  // 3. Criação de campanha
  await runTest('Criar campanha de tráfego pago', async () => {
    const campaign = await SalesChannelService.createCampaign(
      'Campanha de Tráfego Teste',
      'meta_ads',
      250.00,
      'CONVERSION'
    );
    if (!campaign || campaign.name !== 'Campanha de Tráfego Teste' || campaign.budget !== 250.00) {
      throw new Error('Falha ao projetar ou registrar conjunto de anúncios.');
    }
  });

  // 4. Métricas recebidas e otimização
  await runTest('Mecanismo de tráfego e otimização automática de orçamento', async () => {
    const originalCampaigns = SalesChannelService.getCampaigns();
    const result = SalesChannelService.optimizeCampaigns();
    if (!result.updatedCampaigns || result.updatedCampaigns.length === 0) {
      throw new Error('Nenhuma campanha retornada após otimização.');
    }
    // Check if at least one campaign is tuned
    const optimizedCount = result.updatedCampaigns.filter(c => c.suggestedAction && c.suggestedAction !== 'NONE').length;
    if (optimizedCount === 0) {
      throw new Error('Nenhuma campanha foi qualificada para as regras de otimização automática.');
    }
  });

  // 5. WhatsApp trigger
  await runTest('Garantir funcionamento dos fluxos de WhatsApp', async () => {
    const manualMsg = await SalesChannelService.sendWhatsApp('+55 11 99999-0000', 'Mensagem manual de teste', 'manual');
    if (manualMsg.status !== 'sent' || manualMsg.to !== '+55 11 99999-0000') {
      throw new Error('Disparo manual do WhatsApp falhou.');
    }
  });

  // 6. Analytics consolidado
  await runTest('Cálculo consolidado de métricas e ROI financeiro', async () => {
    const summary = SalesChannelService.getAnalyticsSummary();
    if (summary.totalFollowers <= 0 || summary.totalReach <= 0 || summary.totalSpent <= 0 || summary.totalRevenue <= 0) {
      throw new Error('O cálculo consolidado do funil financeiro de canais retornou valores incorretos.');
    }
    if (summary.overallRoi <= 0) {
      throw new Error('O ROI consolidado é inválido.');
    }
  });

  // 7. Integração Launch Agent
  await runTest('Fluxo integrado do Launch Agent preparando canais de vendas', async () => {
    await SalesChannelService.handleLaunchPreparation(
      'proj_test_launch',
      'Curso Prático de Vendas Automatizadas',
      197.00,
      'https://kiwify.com.br/checkout/exemplo'
    );
  });

  return results;
}
