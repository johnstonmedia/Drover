// Client-side Excel export using SheetJS (xlsx). Runs entirely in the browser —
// no server needed, so it works on GitHub Pages.
import * as XLSX from 'xlsx';
import { stageLabel } from './supplyChain';
import type { RouteEvaluation } from './types';

export function exportRowsToExcel(
  rows: Record<string, string | number>[],
  fileName: string,
  sheetName = 'Sheet1',
): void {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`);
}

/** Export a full route evaluation (per-stage breakdown) to Excel. */
export function exportRouteEvaluation(evaluation: RouteEvaluation): void {
  const rows = evaluation.legs.map((leg) => ({
    Stage: stageLabel(leg.stage),
    'In value/head (AUD)': leg.inValuePerHead,
    'Out value/head (AUD)': leg.outValuePerHead,
    'Costs/head (AUD)': leg.costsPerHead,
    'Margin/head (AUD)': leg.marginPerHead,
    'Cumulative margin/head (AUD)': leg.cumulativeMarginPerHead,
  }));
  rows.push({
    Stage: 'TOTAL',
    'In value/head (AUD)': '' as unknown as number,
    'Out value/head (AUD)': '' as unknown as number,
    'Costs/head (AUD)': '' as unknown as number,
    'Margin/head (AUD)': evaluation.totalMarginPerHead,
    'Cumulative margin/head (AUD)': evaluation.totalMarginPerHead,
  });
  rows.push({
    Stage: `Head: ${evaluation.head}  |  Total margin: ${evaluation.totalMargin} AUD  |  Return on cost: ${evaluation.returnOnCostPct}%`,
    'In value/head (AUD)': '' as unknown as number,
    'Out value/head (AUD)': '' as unknown as number,
    'Costs/head (AUD)': '' as unknown as number,
    'Margin/head (AUD)': '' as unknown as number,
    'Cumulative margin/head (AUD)': '' as unknown as number,
  });
  exportRowsToExcel(rows, `${evaluation.mobName.replace(/\s+/g, '_')}_margins`, 'Margins');
}
