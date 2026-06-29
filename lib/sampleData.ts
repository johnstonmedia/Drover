// ---------------------------------------------------------------------------
// PLACEHOLDER DATA — for UI demonstration only.
//
// Every value here is a structural placeholder marked source: 'estimate'. These
// are NOT real market prices or freight rates. Replace with:
//   - real prices via the price-fetcher (MLA / AuctionsPlus) on the Vercel API
//   - real freight rates that you supply
// Nothing in Drover should present these as live figures.
// ---------------------------------------------------------------------------
import type { FreightRoute, LivestockMob, PriceRecord } from './types';

export const PLACEHOLDER_PRICES: PriceRecord[] = [
  { stage: 'post_breeding', category: 'Weaner steer 200-280kg', value: 0, basis: 'c_per_kg_lwt', asOf: '—', source: 'estimate', region: 'National', note: 'Placeholder — connect price feed' },
  { stage: 'backgrounding', category: 'Feeder steer 280-400kg', value: 0, basis: 'c_per_kg_lwt', asOf: '—', source: 'estimate', region: 'National', note: 'Placeholder — connect price feed' },
  { stage: 'feedlot', category: 'Feedlot entry 400kg+', value: 0, basis: 'c_per_kg_lwt', asOf: '—', source: 'estimate', region: 'National', note: 'Placeholder — connect price feed' },
  { stage: 'processing', category: 'Heavy steer (CWT)', value: 0, basis: 'c_per_kg_cwt', asOf: '—', source: 'estimate', region: 'National', note: 'Placeholder — connect price feed' },
];

// A sample mob purely so the Margins screen renders. Prices/costs are 0 until
// you enter real figures.
export const SAMPLE_MOB: LivestockMob = {
  id: 'sample',
  companyId: 'sample',
  name: 'Sample mob (400 head)',
  head: 400,
  breed: 'Brahman-cross',
  sex: 'steer',
  entryStage: 'post_breeding',
  entryWeightKg: 240,
  entryPrice: 0,
  entryBasis: 'c_per_kg_lwt',
  entryDate: '—',
  plan: [
    { stage: 'backgrounding', exitWeightKg: 380, days: 120, costs: {} },
    { stage: 'feedlot', exitWeightKg: 620, days: 110, costs: {} },
    { stage: 'processing', exitWeightKg: 620, days: 1, costs: {} },
  ],
  createdAt: Date.now(),
  createdBy: 'sample',
};

export const SAMPLE_FREIGHT: FreightRoute[] = [
  { id: 'f1', from: 'NT property', to: 'Darwin (export)', costPerHead: 0, note: 'Placeholder — supply real rate' },
  { id: 'f2', from: 'NT property', to: 'QLD feedlot', costPerHead: 0, note: 'Placeholder — supply real rate' },
];
