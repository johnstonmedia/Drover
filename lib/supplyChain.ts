// ---------------------------------------------------------------------------
// Supply-chain definitions + the margin evaluation engine.
//
// The engine takes a mob (locked entry price) and its planned legs (each with
// user-supplied costs and a sale/transfer price) and computes per-stage and
// cumulative margins in AUD. It NEVER invents prices or costs — anything not
// provided is treated as zero and surfaced to the user as missing input.
// ---------------------------------------------------------------------------
import type {
  LivestockMob,
  PriceBasis,
  RouteEvaluation,
  StageCosts,
  StageDef,
  StageId,
  StageMarginResult,
  StagePlan,
} from './types';

export const STAGES: StageDef[] = [
  {
    id: 'post_breeding',
    label: 'Post Breeding',
    description: 'Weaners off the breeder herd, ready to enter the supply chain.',
    basis: 'c_per_kg_lwt',
  },
  {
    id: 'backgrounding',
    label: 'Backgrounding',
    description: 'Growing weaners on grass/forage to prepare them for the feedlot.',
    basis: 'c_per_kg_lwt',
  },
  {
    id: 'feedlot',
    label: 'Feedlot',
    description: 'Grain finishing to target specification before slaughter.',
    basis: 'c_per_kg_lwt',
  },
  {
    id: 'processing',
    label: 'Processing',
    description: 'Abattoir slaughter / processing and export.',
    basis: 'c_per_kg_cwt',
  },
];

export const STAGE_ORDER: StageId[] = STAGES.map((s) => s.id);

export function stageLabel(id: StageId): string {
  return STAGES.find((s) => s.id === id)?.label ?? id;
}

export function stageIndex(id: StageId): number {
  return STAGE_ORDER.indexOf(id);
}

/** Sum all per-head costs in a StageCosts record. */
export function totalStageCosts(c: StageCosts): number {
  return (
    (c.freight ?? 0) +
    (c.agistmentOrFeed ?? 0) +
    (c.agentCommission ?? 0) +
    (c.health ?? 0) +
    (c.interest ?? 0) +
    (c.leviesAndMortality ?? 0) +
    (c.processing ?? 0) +
    (c.other ?? 0)
  );
}

/**
 * Convert a quoted price into AUD per head given an average weight.
 *  - per_head      → value is already AUD/head
 *  - c_per_kg_lwt  → cents/kg liveweight  × liveweight kg ÷ 100
 *  - c_per_kg_cwt  → cents/kg carcase     × carcase kg   ÷ 100
 * For carcase pricing we apply a dressing percentage to liveweight.
 */
export function valuePerHead(
  price: number,
  basis: PriceBasis,
  liveWeightKg: number,
  dressingPct = 0.54, // typical grain-fed dressing ~54%; override per mob
): number {
  switch (basis) {
    case 'per_head':
      return price;
    case 'c_per_kg_lwt':
      return (price * liveWeightKg) / 100;
    case 'c_per_kg_cwt':
      return (price * liveWeightKg * dressingPct) / 100;
    default:
      return 0;
  }
}

export interface EvaluateOptions {
  dressingPct?: number;
}

/**
 * Evaluate a mob's full planned route. Each leg's "in value" is the previous
 * leg's "out value" (or the locked entry price for the first leg). The "out
 * value" is the leg's exitPrice. Margin = out − in − costs.
 */
export function evaluateRoute(mob: LivestockMob, opts: EvaluateOptions = {}): RouteEvaluation {
  const dressingPct = opts.dressingPct ?? 0.54;
  const legs: StageMarginResult[] = [];

  // Entry value (locked at purchase).
  let inValue = valuePerHead(mob.entryPrice, mob.entryBasis, mob.entryWeightKg, dressingPct);
  let cumulative = 0;
  let totalCostOutlay = inValue; // initial purchase counts toward outlay

  // Build the ordered list of legs starting AFTER the entry stage is acquired.
  const legsToWalk: StagePlan[] = mob.plan;
  let prevWeight = mob.entryWeightKg;

  for (const leg of legsToWalk) {
    const def = STAGES.find((s) => s.id === leg.stage);
    const basis: PriceBasis = leg.exitBasis ?? def?.basis ?? 'c_per_kg_lwt';
    const exitWeight = leg.exitWeightKg || prevWeight;

    const costs = totalStageCosts(leg.costs);
    const outValue =
      leg.exitPrice != null
        ? valuePerHead(leg.exitPrice, basis, exitWeight, dressingPct)
        : inValue; // no sale price yet → no realised uplift

    const marginPerHead = outValue - inValue - costs;
    cumulative += marginPerHead;
    totalCostOutlay += costs;

    legs.push({
      stage: leg.stage,
      inValuePerHead: round2(inValue),
      outValuePerHead: round2(outValue),
      costsPerHead: round2(costs),
      marginPerHead: round2(marginPerHead),
      cumulativeMarginPerHead: round2(cumulative),
    });

    // Carry forward: the value leaving this stage becomes the value entering
    // the next stage.
    inValue = outValue;
    prevWeight = exitWeight;
  }

  const totalMarginPerHead = round2(cumulative);
  return {
    mobName: mob.name,
    head: mob.head,
    legs,
    totalMarginPerHead,
    totalMargin: round2(totalMarginPerHead * mob.head),
    returnOnCostPct: totalCostOutlay > 0 ? round2((cumulative / totalCostOutlay) * 100) : 0,
  };
}

/**
 * Compare two alternative routes for the same starting mob (e.g. live export
 * direct from Darwin vs. truck-south-to-feedlot). Returns both evaluations and
 * the per-head difference (positive = routeA better).
 */
export function compareRoutes(
  base: LivestockMob,
  routeAPlan: StagePlan[],
  routeBPlan: StagePlan[],
  opts: EvaluateOptions = {},
): { a: RouteEvaluation; b: RouteEvaluation; differencePerHead: number } {
  const a = evaluateRoute({ ...base, plan: routeAPlan }, opts);
  const b = evaluateRoute({ ...base, plan: routeBPlan }, opts);
  return {
    a,
    b,
    differencePerHead: round2(a.totalMarginPerHead - b.totalMarginPerHead),
  };
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export const AUD = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  maximumFractionDigits: 0,
});

export const AUD2 = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  maximumFractionDigits: 2,
});
