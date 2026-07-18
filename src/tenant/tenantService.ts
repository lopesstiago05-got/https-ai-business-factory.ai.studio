import fs from 'fs';
import path from 'path';
import { 
  Tenant, 
  TenantUser, 
  PlanType, 
  SubscriptionStatus, 
  UserRole, 
  UsageReport, 
  SaaSAdminMetrics 
} from './tenantTypes';
import { Kernel } from '../kernel/index';

// Plan Limits Definition
export const PLAN_LIMITS: Record<PlanType, {
  maxAgents: number;
  maxUsers: number;
  maxExecutions: number;
  creditsIA: number;
  cost: number;
}> = {
  FREE: {
    maxAgents: 2,
    maxUsers: 2,
    maxExecutions: 10,
    creditsIA: 50,
    cost: 0
  },
  PRO: {
    maxAgents: 6,
    maxUsers: 10,
    maxExecutions: 200,
    creditsIA: 1000,
    cost: 97
  },
  BUSINESS: {
    maxAgents: 12,
    maxUsers: 30,
    maxExecutions: 1000,
    creditsIA: 5000,
    cost: 297
  },
  ENTERPRISE: {
    maxAgents: 99,
    maxUsers: 999,
    maxExecutions: 99999,
    creditsIA: 50000,
    cost: 997
  }
};

const DB_PATH = path.join(process.cwd(), 'tenant_db.json');

interface TenantDB {
  tenants: Tenant[];
  users: TenantUser[];
  currentTenantId: string;
}

export class TenantService {
  private static instance: TenantService;
  private db: TenantDB = { tenants: [], users: [], currentTenantId: '' };

  private constructor() {
    this.loadDatabase();
  }

  public static getInstance(): TenantService {
    if (!TenantService.instance) {
      TenantService.instance = new TenantService();
    }
    return TenantService.instance;
  }

  private loadDatabase() {
    try {
      if (fs.existsSync(DB_PATH)) {
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        this.db = JSON.parse(data);
      } else {
        this.seedInitialData();
      }
    } catch (err) {
      console.error('Erro ao carregar banco do Tenant, utilizando memória', err);
      this.seedInitialData();
    }
  }

  private saveDatabase() {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.db, null, 2), 'utf-8');
    } catch (err) {
      console.error('Erro ao persistir banco do Tenant:', err);
    }
  }

  private seedInitialData() {
    const defaultTenantId = 'tenant-standard-id';
    
    const standardTenant: Tenant = {
      id: defaultTenantId,
      name: 'Empresa Padrão S.A.',
      currentPlan: 'FREE',
      subscriptionStatus: 'TRIAL',
      maxAgents: PLAN_LIMITS.FREE.maxAgents,
      maxUsers: PLAN_LIMITS.FREE.maxUsers,
      maxExecutions: PLAN_LIMITS.FREE.maxExecutions,
      usedExecutions: 3,
      usedCredits: 12,
      availableCredits: PLAN_LIMITS.FREE.creditsIA - 12,
      storageMbUsed: 4.2,
      createdAt: new Date().toISOString()
    };

    const users: TenantUser[] = [
      {
        id: 'user-owner-id',
        name: 'Administrador Principal',
        email: 'lopess.tiago05@gmail.com',
        role: 'OWNER',
        tenantId: defaultTenantId,
        status: 'active'
      },
      {
        id: 'user-member-id',
        name: 'Operador Comercial',
        email: 'membro@empresa.com',
        role: 'MEMBER',
        tenantId: defaultTenantId,
        status: 'active'
      }
    ];

    this.db = {
      tenants: [standardTenant],
      users,
      currentTenantId: defaultTenantId
    };
    this.saveDatabase();
  }

  // --- Core SaaS APIs ---

  public getTenants(): Tenant[] {
    return this.db.tenants;
  }

  public getUsers(tenantId: string): TenantUser[] {
    return this.db.users.filter(u => u.tenantId === tenantId);
  }

  public getCurrentTenantId(): string {
    if (!this.db.currentTenantId && this.db.tenants.length > 0) {
      this.db.currentTenantId = this.db.tenants[0].id;
      this.saveDatabase();
    }
    return this.db.currentTenantId;
  }

  public setCurrentTenantId(id: string): boolean {
    const tenant = this.db.tenants.find(t => t.id === id);
    if (tenant) {
      this.db.currentTenantId = id;
      this.saveDatabase();
      this.triggerEvent('WORKSPACE_SWITCHED', id, { tenantName: tenant.name });
      return true;
    }
    return false;
  }

  public getTenantById(id: string): Tenant | undefined {
    return this.db.tenants.find(t => t.id === id);
  }

  public createTenant(name: string, plan: PlanType = 'FREE'): Tenant {
    const id = `tenant-${Math.random().toString(36).substr(2, 9)}`;
    const limit = PLAN_LIMITS[plan];
    
    const newTenant: Tenant = {
      id,
      name,
      currentPlan: plan,
      subscriptionStatus: 'TRIAL',
      maxAgents: limit.maxAgents,
      maxUsers: limit.maxUsers,
      maxExecutions: limit.maxExecutions,
      usedExecutions: 0,
      usedCredits: 0,
      availableCredits: limit.creditsIA,
      storageMbUsed: 0,
      createdAt: new Date().toISOString()
    };

    this.db.tenants.push(newTenant);
    this.saveDatabase();

    // Trigger Customer Success Event
    this.triggerEvent('TENANT_CREATED', id, { name, plan });

    return newTenant;
  }

  public inviteUser(tenantId: string, name: string, email: string, role: UserRole): TenantUser {
    const tenant = this.getTenantById(tenantId);
    if (!tenant) {
      throw new Error('Tenant não encontrado.');
    }

    const currentUsers = this.getUsers(tenantId);
    if (currentUsers.length >= tenant.maxUsers) {
      throw new Error(`Limite de usuários excedido para o plano ${tenant.currentPlan}. Faça um upgrade para convidar mais.`);
    }

    const newUser: TenantUser = {
      id: `user-${Math.random().toString(36).substr(2, 9)}`,
      name,
      email,
      role,
      tenantId,
      status: 'invited'
    };

    this.db.users.push(newUser);
    this.saveDatabase();

    this.triggerEvent('USER_INVITED', tenantId, { email, role });
    return newUser;
  }

  // --- Permissions Engine ---

  public checkPermission(role: UserRole, action: string): boolean {
    // OWNER: can do everything
    if (role === 'OWNER') return true;

    // ADMIN: can do everything except delete workspace or cancel subscription
    if (role === 'ADMIN') {
      const forbidden = ['DELETE_WORKSPACE', 'CANCEL_SUBSCRIPTION'];
      return !forbidden.includes(action);
    }

    // MEMBER: can create agents, execute automations, view logs. Cannot manage workspace, invite users, or change billing
    if (role === 'MEMBER') {
      const allowed = ['CREATE_AGENT', 'EXECUTE_AUTOMATION', 'VIEW_REPORTS', 'USE_MARKETPLACE'];
      return allowed.includes(action);
    }

    // VIEWER: Read-only
    if (role === 'VIEWER') {
      const allowed = ['VIEW_REPORTS'];
      return allowed.includes(action);
    }

    return false;
  }

  // --- Usage Tracker Engine ---

  public trackUsage(tenantId: string, type: 'credits' | 'execution', amount: number): { success: boolean; message?: string } {
    const tenant = this.db.tenants.find(t => t.id === tenantId);
    if (!tenant) {
      return { success: false, message: 'Tenant não encontrado.' };
    }

    if (type === 'execution') {
      if (tenant.usedExecutions + amount > tenant.maxExecutions) {
        this.triggerEvent('USAGE_LIMIT_REACHED', tenantId, { limitType: 'execution', current: tenant.usedExecutions, limit: tenant.maxExecutions });
        this.triggerEvent('UPGRADE_REQUIRED', tenantId, { reason: 'Executions limit reached' });
        return { success: false, message: `Limite de execuções mensais atingido para o plano ${tenant.currentPlan}.` };
      }
      tenant.usedExecutions += amount;
    } else if (type === 'credits') {
      if (tenant.availableCredits < amount) {
        this.triggerEvent('USAGE_LIMIT_REACHED', tenantId, { limitType: 'credits', current: tenant.usedCredits, limit: tenant.availableCredits + tenant.usedCredits });
        this.triggerEvent('UPGRADE_REQUIRED', tenantId, { reason: 'AI credits exhausted' });
        return { success: false, message: 'Créditos IA (Gemini) esgotados para este período.' };
      }
      tenant.usedCredits += amount;
      tenant.availableCredits -= amount;
    }

    this.saveDatabase();
    return { success: true };
  }

  public getUsage(tenantId: string): UsageReport {
    const tenant = this.getTenantById(tenantId);
    if (!tenant) {
      throw new Error('Tenant não encontrado');
    }

    const totalCredits = tenant.usedCredits + tenant.availableCredits;
    return {
      usedExecutions: tenant.usedExecutions,
      maxExecutions: tenant.maxExecutions,
      usedCredits: tenant.usedCredits,
      availableCredits: tenant.availableCredits,
      storageMbUsed: tenant.storageMbUsed,
      percentageExecutions: Math.min(100, Math.round((tenant.usedExecutions / tenant.maxExecutions) * 100)),
      percentageCredits: Math.min(100, Math.round((tenant.usedCredits / (totalCredits || 1)) * 100))
    };
  }

  // --- Subscription Lifecycle ---

  public subscribe(tenantId: string, plan: PlanType): Tenant {
    const tenant = this.db.tenants.find(t => t.id === tenantId);
    if (!tenant) {
      throw new Error('Tenant não encontrado');
    }

    const limits = PLAN_LIMITS[plan];
    const oldPlan = tenant.currentPlan;

    tenant.currentPlan = plan;
    tenant.subscriptionStatus = 'ACTIVE';
    tenant.maxAgents = limits.maxAgents;
    tenant.maxUsers = limits.maxUsers;
    tenant.maxExecutions = limits.maxExecutions;
    // reset/add credits on plan change
    tenant.availableCredits = limits.creditsIA;
    tenant.usedCredits = 0;
    tenant.usedExecutions = 0;

    this.saveDatabase();

    this.triggerEvent('PLAN_CHANGED', tenantId, { oldPlan, newPlan: plan });
    return tenant;
  }

  public cancelSubscription(tenantId: string): Tenant {
    const tenant = this.db.tenants.find(t => t.id === tenantId);
    if (!tenant) {
      throw new Error('Tenant não encontrado');
    }

    tenant.subscriptionStatus = 'CANCELLED';
    this.saveDatabase();

    this.triggerEvent('PLAN_CHANGED', tenantId, { plan: tenant.currentPlan, status: 'CANCELLED' });
    return tenant;
  }

  // --- Admin metrics ---

  public getAdminMetrics(): SaaSAdminMetrics {
    const totalTenants = this.db.tenants.length;
    const activeUsersCount = this.db.users.length;
    
    // Estimated Revenue
    const estimatedMonthlyRevenue = this.db.tenants.reduce((sum, tenant) => {
      const planCost = PLAN_LIMITS[tenant.currentPlan]?.cost || 0;
      return tenant.subscriptionStatus === 'ACTIVE' ? sum + planCost : sum;
    }, 0);

    // Plan distribution
    const planDistribution: Record<PlanType, number> = {
      FREE: 0,
      PRO: 0,
      BUSINESS: 0,
      ENTERPRISE: 0
    };

    let totalAiCreditsConsumed = 0;
    this.db.tenants.forEach(tenant => {
      planDistribution[tenant.currentPlan] = (planDistribution[tenant.currentPlan] || 0) + 1;
      totalAiCreditsConsumed += tenant.usedCredits;
    });

    const systemAlertsCount = this.db.tenants.filter(t => t.usedExecutions >= t.maxExecutions * 0.9 || t.availableCredits < t.usedCredits * 0.1).length;

    return {
      totalTenants,
      activeUsersCount,
      estimatedMonthlyRevenue,
      planDistribution,
      totalAiCreditsConsumed,
      systemAlertsCount
    };
  }

  // --- Trigger events to Kernel and Customer Success ---

  private async triggerEvent(type: string, tenantId: string, payload: any) {
    try {
      const kernel = Kernel.getInstance();
      await kernel.publishEvent(type as any, 'saas_billing_engine', {
        tenantId,
        timestamp: new Date().toISOString(),
        ...payload
      });
      console.log(`[SaaS Event Engine] Emitted: ${type} for tenant: ${tenantId}`);
    } catch (err) {
      console.error('Falha ao emitir evento ao Kernel:', err);
    }
  }
}
