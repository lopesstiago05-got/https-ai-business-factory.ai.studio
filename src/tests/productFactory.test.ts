import { ProductFactoryService } from '../productFactory/productFactoryService.ts';

export async function runProductFactoryTests(): Promise<string[]> {
  console.log('🧪 [TESTS] Iniciando Bateria de Testes para ETAPA 23 — AI Product Factory Engine...');
  const errors: string[] = [];

  let projectId = '';

  // 1. Ideia de produto
  try {
    const project = await ProductFactoryService.createProject('tenant_default', {
      niche: 'Fintech e Automações de Cobrança',
      audience: 'Pequenos consultórios de saúde e clínicas',
      goal: 'Reduzir inadimplência de pacientes usando IA',
      experience: 'Atuo no financeiro de clínicas médicas há 5 anos'
    });

    if (!project || !project.id || !project.idea) {
      errors.push('Teste 1 falhou: Projeto de produto não gerado ou sem proposta de ideia.');
    } else {
      projectId = project.id;
      console.log(`✅ Teste 1 Passou: Ideia de produto criada ("${project.idea.name}")`);
    }
  } catch (err: any) {
    errors.push('Teste 1 erro: ' + err.message);
  }

  // 2. Validação de mercado
  try {
    if (projectId) {
      const project = await ProductFactoryService.validateMarket(projectId);
      if (!project.validation || typeof project.validation.score !== 'number') {
        errors.push('Teste 2 falhou: Validação de mercado não executada ou sem score.');
      } else {
        console.log(`✅ Teste 2 Passou: Validação de mercado executada (Score: ${project.validation.score}/100)`);
      }
    } else {
      errors.push('Teste 2 falhou: projectId inexistente de etapa anterior.');
    }
  } catch (err: any) {
    errors.push('Teste 2 erro: ' + err.message);
  }

  // 3. Blueprint
  try {
    if (projectId) {
      const project = await ProductFactoryService.generateBlueprint(projectId);
      if (!project.blueprint || project.blueprint.items.length === 0) {
        errors.push('Teste 3 falhou: Blueprint didático não estruturado.');
      } else {
        console.log(`✅ Teste 3 Passou: Blueprint didático gerado com ${project.blueprint.items.length} módulos.`);
      }
    } else {
      errors.push('Teste 3 falhou: projectId inexistente de etapa anterior.');
    }
  } catch (err: any) {
    errors.push('Teste 3 erro: ' + err.message);
  }

  // 4. Pipeline de conteúdo
  try {
    if (projectId) {
      const project = await ProductFactoryService.generateContentPipeline(projectId);
      if (!project.content || project.content.texts.length === 0 || !project.content.imagePrompt) {
        errors.push('Teste 4 falhou: Ativos de conteúdo e criativos não gerados pelo pipeline.');
      } else {
        console.log('✅ Teste 4 Passou: Pipeline de conteúdo executado com redação e criativos prontos.');
      }
    } else {
      errors.push('Teste 4 falhou: projectId inexistente de etapa anterior.');
    }
  } catch (err: any) {
    errors.push('Teste 4 erro: ' + err.message);
  }

  // 5. Oferta & Score IA
  try {
    if (projectId) {
      const project = await ProductFactoryService.createOffer(projectId);
      if (!project.offer || !project.score) {
        errors.push('Teste 5 e 6 falhou: Estruturação de oferta ou Score do produto nulo.');
      } else {
        console.log(`✅ Teste 5 Passou: Oferta estruturada (Preço recomendado: R$ ${project.offer.suggestedPrice})`);
        console.log(`✅ Teste 6 Passou: AI Product Score calculado (${project.score.overallScore}/100)`);
      }
    } else {
      errors.push('Teste 5 e 6 falhou: projectId inexistente de etapa anterior.');
    }
  } catch (err: any) {
    errors.push('Teste 5/6 erro: ' + err.message);
  }

  // 7. Integração Launch Agent
  try {
    if (projectId) {
      const project = await ProductFactoryService.launchProduct(projectId);
      if (project.status !== 'LAUNCHED' || project.currentStep !== 'LANCAMENTO') {
        errors.push('Teste 7 falhou: Status do projeto não atualizado para LAUNCHED.');
      } else {
        console.log('✅ Teste 7 Passou: Integração Launch Agent & Lançamento comercial bem-sucedidos.');
      }
    } else {
      errors.push('Teste 7 falhou: projectId inexistente de etapa anterior.');
    }
  } catch (err: any) {
    errors.push('Teste 7 erro: ' + err.message);
  }

  console.log(`[TESTS] Finalizado bateria de testes do Product Factory. Erros: ${errors.length}`);
  return errors;
}
