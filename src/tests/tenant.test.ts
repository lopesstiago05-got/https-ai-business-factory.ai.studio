import { TenantService, PLAN_LIMITS } from '../tenant/tenantService';
import { PlanType, UserRole } from '../tenant/tenantTypes';

export async function runTenantSaaSTests() {
  console.log('🧪 [TESTS] Iniciando Bateria de Testes SaaS Multi-Tenant & Billing...');
  const errors: string[] = [];
  const service = TenantService.getInstance();

  // Test 1: Criação de Tenant
  try {
    const tName = 'Empresa de Testes S.A.';
    const tenant = service.createTenant(tName, 'FREE');
    if (!tenant || tenant.name !== tName || tenant.currentPlan !== 'FREE') {
      errors.push('Test 1 failed: Tenant name or default plan incorrect.');
    } else {
      console.log('✅ Test 1 Passed: Criação de Tenant');
    }
  } catch (err: any) {
    errors.push('Test 1 error: ' + err.message);
  }

  // Test 2: Isolamento de Dados
  try {
    const t1 = service.createTenant('Tenant Um', 'FREE');
    const t2 = service.createTenant('Tenant Dois', 'FREE');
    
    service.inviteUser(t1.id, 'User Um', 'um@test.com', 'MEMBER');
    service.inviteUser(t2.id, 'User Dois', 'dois@test.com', 'MEMBER');

    const users1 = service.getUsers(t1.id);
    const users2 = service.getUsers(t2.id);

    if (users1.some(u => u.email === 'dois@test.com') || users2.some(u => u.email === 'um@test.com')) {
      errors.push('Test 2 failed: Data isolation breach between tenants.');
    } else {
      console.log('✅ Test 2 Passed: Isolamento de Dados (Usuários)');
    }
  } catch (err: any) {
    errors.push('Test 2 error: ' + err.message);
  }

  // Test 3: Permissões
  try {
    const isOwnerAllowed = service.checkPermission('OWNER', 'DELETE_WORKSPACE');
    const isMemberAllowed = service.checkPermission('MEMBER', 'DELETE_WORKSPACE');
    const isViewerAllowed = service.checkPermission('VIEWER', 'CREATE_AGENT');

    if (!isOwnerAllowed || isMemberAllowed || isViewerAllowed) {
      errors.push('Test 3 failed: Permission matrix check incorrect.');
    } else {
      console.log('✅ Test 3 Passed: Permissões de Usuários (OWNER, MEMBER, VIEWER)');
    }
  } catch (err: any) {
    errors.push('Test 3 error: ' + err.message);
  }

  // Test 4: Troca de Workspace
  try {
    const t = service.createTenant('Tenant Troca', 'FREE');
    const initialId = service.getCurrentTenantId();
    
    service.setCurrentTenantId(t.id);
    const currentId = service.getCurrentTenantId();

    if (currentId !== t.id) {
      errors.push('Test 4 failed: Workspace switch not recorded.');
    } else {
      service.setCurrentTenantId(initialId); // restore
      console.log('✅ Test 4 Passed: Troca de Workspace');
    }
  } catch (err: any) {
    errors.push('Test 4 error: ' + err.message);
  }

  // Test 5: Controle de Plano & Limits
  try {
    const t = service.createTenant('Tenant Plano', 'FREE');
    const limits = PLAN_LIMITS.FREE;

    // Try to invite more users than limit
    service.inviteUser(t.id, 'U1', 'u1@limit.com', 'MEMBER');
    
    let caughtLimitError = false;
    try {
      // FREE limits maxUsers to 2, we already have 1 (the one we invited above), wait, FREE maxUsers is 2.
      // Let's try to invite 2 more users to breach limit
      service.inviteUser(t.id, 'U2', 'u2@limit.com', 'MEMBER');
      service.inviteUser(t.id, 'U3', 'u3@limit.com', 'MEMBER');
    } catch (inviteErr) {
      caughtLimitError = true;
    }

    if (!caughtLimitError) {
      errors.push('Test 5 failed: Plan limit for users was not enforced.');
    } else {
      console.log('✅ Test 5 Passed: Controle de Limites do Plano');
    }
  } catch (err: any) {
    errors.push('Test 5 error: ' + err.message);
  }

  // Test 6: Usage Tracking
  try {
    const t = service.createTenant('Tenant Tracker', 'FREE');
    
    // FREE has 10 executions limit
    const use1 = service.trackUsage(t.id, 'execution', 5);
    const use2 = service.trackUsage(t.id, 'execution', 6); // goes to 11

    if (!use1.success || use2.success) {
      errors.push('Test 6 failed: Usage limit tracking or over-limit block failed.');
    } else {
      console.log('✅ Test 6 Passed: Usage Tracking & Over-Limit Blocking');
    }
  } catch (err: any) {
    errors.push('Test 6 error: ' + err.message);
  }

  // Test 7: Billing Lifecycle
  try {
    const t = service.createTenant('Tenant Lifecycle', 'FREE');
    
    service.subscribe(t.id, 'PRO');
    let updated = service.getTenantById(t.id);
    
    if (!updated || updated.currentPlan !== 'PRO' || updated.subscriptionStatus !== 'ACTIVE') {
      errors.push('Test 7 failed: Plan subscribe did not transition plan to PRO active.');
    } else {
      service.cancelSubscription(t.id);
      updated = service.getTenantById(t.id);
      if (!updated || updated.subscriptionStatus !== 'CANCELLED') {
        errors.push('Test 7 failed: Plan cancel did not transition subscription status to CANCELLED.');
      } else {
        console.log('✅ Test 7 Passed: Ciclo de Vida do Faturamento');
      }
    }
  } catch (err: any) {
    errors.push('Test 7 error: ' + err.message);
  }

  // Test 8: Marketplace integration & Admin Console Metrics
  try {
    const metrics = service.getAdminMetrics();
    if (metrics.totalTenants <= 0 || metrics.activeUsersCount <= 0) {
      errors.push('Test 8 failed: Admin Console SaaS metrics calculation incorrect.');
    } else {
      console.log('✅ Test 8 Passed: Métricas do Painel Administrativo');
    }
  } catch (err: any) {
    errors.push('Test 8 error: ' + err.message);
  }

  console.log('🏁 [TESTS] Fim da Bateria de Testes.');
  return {
    success: errors.length === 0,
    errors
  };
}
