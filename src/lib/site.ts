/**
 * Content shared by every service area page (playbook: global blocks G1–G3, B2's service list,
 * B3's tiles, B8, and the citywide numbers in B11). One edit here updates every page.
 * Values are from the approved West Loop template.
 */
export const site = {
  name: 'City & Suburban Heating & Cooling',
  tagline: 'Trusted HVAC experts “From City to Suburbs”',
  hours: 'Mon–Fri 6:00 AM – 6:00 PM · Sat 6:00 AM – 3:30 PM',
  phone: '(773) 238-3838',
  phoneHref: 'tel:+17732383838',
  address: '1225 N Cleaver St, Chicago, IL 60642',
  founded: 1952,
  // Update each January (2026 − 1952)
  yearsFamilyOwned: 74,
  utilityLinks: ['Finance', 'About us', 'Contact us'],
  nav: ['Heating', 'Cooling', 'Air quality', 'Commercial', 'Services'],
  rating: { value: '4.98', count: 204, asOf: '31 Aug 2026' },
  reviewerNames: ['Rob', 'Eddie', 'Carissa', 'Frank', 'Nate', 'Sam', 'Andy', 'Mike'],
  // City of Chicago building permits, 24 months
  permits: { citywideFirms: '1,539', citywidePermits: '4,888', ours: 0 },
  // Playbook Part K: not in any workbook yet. Shows as a "to confirm" tile until filled.
  licenceNumber: null as string | null,
}

export type ServiceGroupKey = 'heating' | 'cooling' | 'airQuality' | 'commercial'

export type ServiceItem = { title: string; text: string; icon: keyof typeof serviceIcons }

export type ServiceGroup = {
  key: ServiceGroupKey
  name: string
  count: number
  title: string
  lede: string
  /** Empty until the group's service copy is approved. */
  services: ServiceItem[]
}

// Inner markup of the design's 24×24 line icons (stroke and fill are set on the <svg>)
export const serviceIcons = {
  heating: '<path d="M12 21c-3.3 0-6-2.4-6-5.5 0-3 2.5-4.5 3-7.5 2 1 3 3 3 4.5 1-1 1.5-2.5 1.5-4 2.5 1.5 4.5 4.3 4.5 7 0 3.1-2.7 5.5-6 5.5z"/>',
  cooling: '<path d="M12 2v20M4.9 6.5l14.2 11M19.1 6.5 4.9 17.5M9 4l3 2 3-2M9 20l3-2 3 2"/>',
  airQuality: '<path d="M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h8"/>',
  commercial: '<path d="M4 21V8l8-4 8 4v13M4 21h16M9 21v-5h6v5M8 10h2M14 10h2M8 13h2M14 13h2"/>',
  wrench: '<path d="M14.5 6.5a4 4 0 0 0-5.2 5.2L4 17l3 3 5.3-5.3a4 4 0 0 0 5.2-5.2l-2.6 2.6-2.4-.6-.6-2.4z"/>',
  boiler: '<rect x="6" y="3" width="12" height="17" rx="2"/><circle cx="12" cy="9" r="2.5"/><path d="M9 15h6M8 21h8"/>',
  install: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M12 15v3M10.5 16.5 12 18l1.5-1.5"/>',
  maintenance: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M8.5 12l2.5 2.5L16 9.5"/>',
  heatPump: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="10" cy="12" r="4"/><path d="M10 8v8M6 12h8M17 9v6"/>',
  hybrid: '<path d="M8 21c-2.2 0-4-1.6-4-3.7 0-2 1.7-3 2-5 1.3.7 2 2 2 3 .7-.7 1-1.7 1-2.7"/><path d="M14 4v8M10.5 6l7 4M17.5 6l-7 4"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M8 14h3"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
} as const

export const serviceGroups: ServiceGroup[] = [
  {
    key: 'heating',
    name: 'Heating',
    count: 7,
    title: 'Heating: furnaces, boilers and heat pumps',
    lede: "A furnace that won't light, a boiler losing pressure, a unit that short-cycles. Diagnosis comes first, and replacement only if the unit is genuinely done.",
    services: [
      { icon: 'wrench', title: 'Furnace and heater repair', text: 'Ignition, flame sensors, inducer motors and limit switches, found and fixed on the first visit where the part is on the van.' },
      { icon: 'boiler', title: 'Boiler service', text: 'Hot-water and steam boilers in vintage two-flats and converted lofts: pressure, circulators, zone valves, venting.' },
      { icon: 'install', title: 'Furnace installation and replacement', text: 'Sized to the unit, not the brochure. In a high-rise, routed around building rules on venting and access.' },
      { icon: 'maintenance', title: 'Heater maintenance', text: 'An autumn tune-up before the first cold snap: burners, heat exchanger check, filters, safeties.' },
      { icon: 'heatPump', title: 'Heat pumps', text: 'Repair and installation, including cold-climate units for townhomes moving off gas.' },
      { icon: 'hybrid', title: 'Hybrid heating systems', text: 'A heat pump paired with a gas furnace, switching over on the coldest days.' },
      { icon: 'calendar', title: 'HVAC maintenance plans', text: 'Scheduled heating and cooling visits for buildings that want them on the calendar.' },
    ],
  },
  // The design only shows the Heating tab open. The other groups' service copy isn't written yet.
  { key: 'cooling', name: 'Cooling', count: 6, title: 'Cooling', lede: '', services: [] },
  { key: 'airQuality', name: 'Air quality', count: 5, title: 'Air quality', lede: '', services: [] },
  { key: 'commercial', name: 'Commercial', count: 6, title: 'Commercial', lede: '', services: [] },
]

export const companyTypes = [
  { title: 'Family-owned, since 1952', text: "The owner answers and quotes. Limit: one family's capacity, so peak-winter days fill up.", us: true },
  { title: 'National franchise', text: 'Response time is genuinely good. Limit: commission and price books shape the recommendation.' },
  { title: 'One-van independent', text: 'The work is often excellent. Limit: one person, so a January no-heat call can wait days.' },
  { title: 'Lead marketplace', text: "Several quotes fast. Limit: you don't choose who calls back, or who turns up." },
]
