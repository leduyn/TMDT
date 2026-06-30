import { fetchJSON } from "@/lib/fetcher";

const BASE = "/api/gamification";

function authHeader(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ===== INTERFACES =====

export interface BadgeInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  colorGradient: string;
  active: boolean;
  earned: boolean;
  earnedAt: string | null;
}

export interface CertificateInfo {
  id: number;
  title: string;
  reason: string;
  earnedAt: string;
  customerName: string;
}

export interface LeaderboardEntry {
  customerId: number;
  customerName: string;
  pointsBalance: number;
  totalEarned: number;
  levelNumber: number;
  levelName: string;
  badges: string[];
  titles: string[];
}

export interface GamificationProfile {
  customerId: number;
  customerName: string;
  pointsBalance: number;
  totalEarned: number;
  levelNumber: number;
  levelName: string;
  totalOrders: number;
  totalRevenue: number;
  nextLevelMinPoints: number | null;
  nextLevelMinOrders: number | null;
  nextLevelMinRevenue: number | null;
  nextLevelName: string | null;
  earnedBadges: BadgeInfo[];
  titles: string[];
  certificates: CertificateInfo[];
}

export interface GamificationRule {
  id: string;
  name: string;
  eventTrigger: string;
  conditionExpression: string;
  rewardPoints: number;
  rewardBadgeId: string | null;
  rewardTitle: string | null;
  active: boolean;
}

export interface EvaluatedRule {
  id: string;
  name: string;
  eventTrigger: string;
  conditionExpression: string;
  rewardPoints: number;
  rewardBadgeId: string | null;
  rewardTitle: string | null;
  conditionMet: boolean;
  alreadyRewarded: boolean;
}

export interface MembershipLevel {
  id: number;
  levelNumber: number;
  name: string;
  minPoints: number;
  minOrders: number;
  minRevenue: number;
  active: boolean;
}

export interface SpelVariable {
  id: number;
  name: string;
  description: string;
  aggFunction: string;
  tableName: string;
  tableAlias: string;
  columnName: string;
  joinTable: string | null;
  joinAlias: string | null;
  joinOnColumn: string | null;
  joinType: string;
  whereJson: string | null;
  generatedSql: string;
  active: boolean;
}

// ===== CUSTOMER APIs =====

export const gamificationApi = {
  getProfile: async (customerId: number): Promise<GamificationProfile> => {
    const res = await fetch(`${BASE}/profile/${customerId}`, { headers: authHeader() });
    if (!res.ok) throw new Error("Không thể tải hồ sơ gamification");
    return res.json();
  },

  getLeaderboard: async (limit = 50): Promise<LeaderboardEntry[]> => {
    const res = await fetch(`${BASE}/leaderboard?limit=${limit}`, { headers: authHeader() });
    if (!res.ok) throw new Error("Không thể tải bảng xếp hạng");
    return res.json();
  },

  getAllBadges: async (customerId?: number): Promise<BadgeInfo[]> => {
    const url = customerId ? `${BASE}/badges?customerId=${customerId}` : `${BASE}/badges`;
    const res = await fetch(url, { headers: authHeader() });
    if (!res.ok) throw new Error("Không thể tải danh sách huy hiệu");
    return res.json();
  },

  getActiveRules: async (): Promise<GamificationRule[]> => {
    const res = await fetch(`${BASE}/rules`, { headers: authHeader() });
    if (!res.ok) throw new Error("Không thể tải luật thi đua");
    return res.json();
  },

  getEvaluatedRules: async (customerId: number): Promise<EvaluatedRule[]> => {
    const res = await fetch(`${BASE}/rules/evaluated/${customerId}`, { headers: authHeader() });
    if (!res.ok) throw new Error("Không thể tải luật thi đua");
    return res.json();
  },

  getCertificates: async (customerId: number): Promise<CertificateInfo[]> => {
    const res = await fetch(`${BASE}/certificates/${customerId}`, { headers: authHeader() });
    if (!res.ok) throw new Error("Không thể tải bằng khen");
    return res.json();
  },
};

// ===== ADMIN APIs =====

export const gamificationAdminApi = {
  // --- Rules ---
  getRules: async (): Promise<GamificationRule[]> => {
    const res = await fetch(`${BASE}/admin/rules`, { headers: authHeader() });
    if (!res.ok) throw new Error("Không thể tải danh sách luật");
    return res.json();
  },

  saveRule: async (rule: GamificationRule): Promise<GamificationRule> => {
    const res = await fetch(`${BASE}/admin/rules`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify(rule),
    });
    if (!res.ok) throw new Error("Không thể lưu luật");
    return res.json();
  },

  toggleRule: async (id: string): Promise<GamificationRule> => {
    const res = await fetch(`${BASE}/admin/rules/${id}/toggle`, {
      method: "PATCH",
      headers: authHeader(),
    });
    if (!res.ok) throw new Error("Không thể bật/tắt luật");
    return res.json();
  },

  deleteRule: async (id: string): Promise<void> => {
    const res = await fetch(`${BASE}/admin/rules/${id}`, {
      method: "DELETE",
      headers: authHeader(),
    });
    if (!res.ok) throw new Error("Không thể xóa luật");
  },

  // --- Badges ---
  getAllBadgesAdmin: async (): Promise<BadgeInfo[]> => {
    const res = await fetch(`${BASE}/admin/badges`, { headers: authHeader() });
    if (!res.ok) throw new Error("Không thể tải danh sách huy hiệu");
    return res.json();
  },

  saveBadge: async (badge: Omit<BadgeInfo, "earned" | "earnedAt">): Promise<BadgeInfo> => {
    const res = await fetch(`${BASE}/admin/badges`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify(badge),
    });
    if (!res.ok) throw new Error("Không thể lưu huy hiệu");
    return res.json();
  },

  deleteBadge: async (id: string): Promise<void> => {
    const res = await fetch(`${BASE}/admin/badges/${id}`, {
      method: "DELETE",
      headers: authHeader(),
    });
    if (!res.ok) throw new Error("Không thể xóa huy hiệu");
  },

  // --- Levels ---
  getLevels: async (): Promise<MembershipLevel[]> => {
    const res = await fetch(`${BASE}/admin/levels`, { headers: authHeader() });
    if (!res.ok) throw new Error("Không thể tải cấp bậc");
    return res.json();
  },

  saveLevel: async (level: Omit<MembershipLevel, "id">): Promise<MembershipLevel> => {
    const res = await fetch(`${BASE}/admin/levels`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify(level),
    });
    if (!res.ok) throw new Error("Không thể lưu cấp bậc");
    return res.json();
  },

  deleteLevel: async (id: number): Promise<void> => {
    const res = await fetch(`${BASE}/admin/levels/${id}`, {
      method: "DELETE",
      headers: authHeader(),
    });
    if (!res.ok) throw new Error("Không thể xóa cấp bậc");
  },

  // --- Points Formula ---
  getPointsFormula: async (): Promise<{ formula: string }> => {
    const res = await fetch(`${BASE}/admin/points-formula`, { headers: authHeader() });
    if (!res.ok) throw new Error("Không thể tải công thức tích điểm");
    return res.json();
  },

  updatePointsFormula: async (formula: string): Promise<{ formula: string; testResult1M: string }> => {
    const res = await fetch(`${BASE}/admin/points-formula`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify({ formula }),
    });
    if (!res.ok) throw new Error("Không thể cập nhật công thức tích điểm");
    return res.json();
  },

  // --- Spel Variables ---
  getSpelVariables: async (): Promise<SpelVariable[]> => {
    const res = await fetch(`${BASE}/admin/spel-variables`, { headers: authHeader() });
    if (!res.ok) throw new Error("Không thể tải danh sách biến SpEL");
    return res.json();
  },

  saveSpelVariable: async (sv: Omit<SpelVariable, "id" | "generatedSql">): Promise<SpelVariable> => {
    const res = await fetch(`${BASE}/admin/spel-variables`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify(sv),
    });
    if (!res.ok) throw new Error("Không thể lưu biến SpEL");
    return res.json();
  },

  deleteSpelVariable: async (id: number): Promise<void> => {
    const res = await fetch(`${BASE}/admin/spel-variables/${id}`, {
      method: "DELETE",
      headers: authHeader(),
    });
    if (!res.ok) throw new Error("Không thể xóa biến SpEL");
  },

  getSpelMetadata: async (): Promise<Record<string, any>> => {
    const res = await fetch(`${BASE}/admin/spel-metadata`, { headers: authHeader() });
    if (!res.ok) throw new Error("Không thể tải metadata");
    return res.json();
  },

  testSpelVariable: async (sv: Omit<SpelVariable, "id" | "generatedSql">, testCustomerId: number = 3, testAgencyId: number = 1): Promise<{ success: boolean; sql?: string; result?: number; error?: string }> => {
    const res = await fetch(`${BASE}/admin/spel-variables/test`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify({ ...sv, testCustomerId, testAgencyId }),
    });
    if (!res.ok) throw new Error("Không thể test query");
    return res.json();
  },
};
