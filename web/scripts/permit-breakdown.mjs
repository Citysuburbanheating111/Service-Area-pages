/**
 * The area page's permit bar graph and data-source line, from the output of the writing skill's
 * hvac_permits.py (kept in a content file under extras._sources.permits). Used by seed-area.mjs
 * and backfill-v3-fields.mjs.
 */
export function permitBreakdown(p) {
  if (!p?.by_equipment) return {}
  return {
    totalPermits: p.permits_in_box,
    windowFrom: p.window?.from,
    windowTo: p.window?.to,
    byEquipment: Object.entries(p.by_equipment)
      .filter(([, count]) => count > 0)
      .sort((x, y) => y[1] - x[1])
      .map(([label, count]) => ({ _key: label.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, ''), _type: 'equipmentCount', label, count })),
  }
}
