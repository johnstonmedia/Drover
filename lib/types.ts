// ---------------------------------------------------------------------------
// Drover domain model
// All monetary values are in AUD. Weights in kilograms.
// ---------------------------------------------------------------------------

/** Roles, from least to most privileged. */
export type Role = 'member' | 'company_admin' | 'site_admin';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  phone?: string | null;
  companyId: string | null;
  role: Role;
  /** Fine-grained feature access toggled by a company admin. */
  permissions: Permission[];
  createdAt: number;
  notifyByEmail: boolean;
}

export type Permission =
  | 'view_prices'
  | 'view_margins'
  | 'manage_livestock'
  | 'export_data'
  | 'use_advisor'
  | 'manage_users';

export interface Company {
  id: string;
  name: string;
  abn?: string;
  state?: AustralianState;
  createdAt: number;
  ownerUid: string;
}

export type AustralianState = 'NT' | 'QLD' | 'NSW' | 'VIC' | 'SA' | 'WA' | 'TAS' | 'ACT';

// --- Supply chain ----------------------------------------------------------

/** The four beef supply-chain stages this dashboard models. */
export type StageId = 'post_breeding' | 'backgrounding' | 'feedlot' | 'processing';

export interface StageDef {
  id: StageId;
  label: string;
  description: string;
  /** Default pricing basis for this stage. */
  basis: PriceBasis;
}

/** How a price is quoted. */
export type PriceBasis = 'per_head' | 'c_per_kg_lwt' | 'c_per_kg_cwt';
// c_per_kg_lwt = cents per kilogram liveweight
// c_per_kg_cwt = cents per kilogram carcase (dressed) weight

/**
 * A point-in-time price observation for a stage. These are populated either by
 * the price-fetcher (MLA / AuctionsPlus, via the Vercel API) or entered
 * manually. We never invent values — `source` records provenance.
 */
export interface PriceRecord {
  stage: StageId;
  /** e.g. "EYCI", "Feeder steer 200-280kg", "Heavy steer over 500kg". */
  category: string;
  value: number;
  basis: PriceBasis;
  /** ISO date of the observation. */
  asOf: string;
  source: PriceSource;
  region?: AustralianState | 'National';
  note?: string;
}

export type PriceSource = 'MLA' | 'AuctionsPlus' | 'manual' | 'estimate';

// --- Livestock profiles (mobs) --------------------------------------------

/**
 * A "mob" = a tracked group of cattle bought at a fixed stage/price. Once
 * purchased, the entry price for that stage is LOCKED for this mob even as live
 * market prices move (that is the whole point of locking in a profile).
 */
export interface LivestockMob {
  id: string;
  companyId: string;
  name: string;
  head: number;
  breed?: string;
  sex?: 'steer' | 'heifer' | 'cow' | 'bull' | 'mixed';
  /** The stage at which this mob was acquired. */
  entryStage: StageId;
  /** Average liveweight (kg) at entry. */
  entryWeightKg: number;
  /** Locked purchase price at entry, in the entry stage's basis. */
  entryPrice: number;
  entryBasis: PriceBasis;
  entryDate: string;
  /** Planned route through subsequent stages. */
  plan: StagePlan[];
  createdAt: number;
  createdBy: string;
}

/** One planned (or actual) leg of a mob's journey through a stage. */
export interface StagePlan {
  stage: StageId;
  /** Expected average liveweight (kg) on exit of this stage. */
  exitWeightKg: number;
  /** Days spent in this stage (affects feed/agistment cost & interest). */
  days: number;
  /** Per-head costs incurred during this stage. */
  costs: StageCosts;
  /**
   * Expected sale/transfer price out of this stage (locked once realised).
   * Pull from PriceRecord or enter manually — never fabricated.
   */
  exitPrice?: number;
  exitBasis?: PriceBasis;
  realised?: boolean;
}

/** Per-head costs for a stage. All AUD/head. Supplied by the user. */
export interface StageCosts {
  freight?: number;
  agistmentOrFeed?: number;
  agentCommission?: number;
  health?: number;
  interest?: number;
  leviesAndMortality?: number;
  processing?: number;
  other?: number;
}

// --- Margin evaluation output ---------------------------------------------

export interface StageMarginResult {
  stage: StageId;
  inValuePerHead: number;
  outValuePerHead: number;
  costsPerHead: number;
  marginPerHead: number;
  cumulativeMarginPerHead: number;
}

export interface RouteEvaluation {
  mobName: string;
  head: number;
  legs: StageMarginResult[];
  totalMarginPerHead: number;
  totalMargin: number;
  /** Margin as a % of total cost outlay. */
  returnOnCostPct: number;
}

// --- Freight (user-supplied; never fabricated) ----------------------------

export interface FreightRoute {
  id: string;
  from: string;
  to: string;
  /** AUD per head for this leg, supplied by the user. */
  costPerHead: number;
  distanceKm?: number;
  note?: string;
}
