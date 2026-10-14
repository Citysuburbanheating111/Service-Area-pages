/**
 * Service area page: one Chicago neighbourhood, built on the approved West Loop template.
 * Field groups follow the playbook's block order (B1–B13):
 * https://logeshmaximus.github.io/city-suburban/playbook/#part-c
 *
 * Only what is specific to the area lives here. Everything shared by every area page
 * (business facts, the hero photo, section intros, the 5 questions, the 6 process steps,
 * kinds of company, the About tiles, the permit record, the shared FAQs) is in ONE
 * document: the Service area template (areaTemplate.ts). Fields that moved there are
 * hidden below, so older pages still read.
 */
// @sanity/icons v5: one import path per icon
import { BillIcon } from '@sanity/icons/Bill'
import { BulbOutlineIcon } from '@sanity/icons/BulbOutline'
import { ClipboardIcon } from '@sanity/icons/Clipboard'
import { EarthGlobeIcon } from '@sanity/icons/EarthGlobe'
import { HelpCircleIcon } from '@sanity/icons/HelpCircle'
import { HomeIcon } from '@sanity/icons/Home'
import { PinIcon } from '@sanity/icons/Pin'
import { SearchIcon } from '@sanity/icons/Search'
import { StarIcon } from '@sanity/icons/Star'
import { ThListIcon } from '@sanity/icons/ThList'
import { UserIcon } from '@sanity/icons/User'
import { WarningOutlineIcon } from '@sanity/icons/WarningOutline'
import { defineArrayMember, defineField, defineType, type ArrayRule } from 'sanity'

const LEDE_ENDING = 'Family-owned since 1952, with the owner, Rob, still on the calls.'

// Exactly `n` items in an array (playbook: fixed card counts per block).
const exactly = (n: number) => (rule: ArrayRule<unknown[]>) =>
  rule.required().min(n).max(n).error(`This block uses exactly ${n} items.`)

// A {title, text} card, used by several blocks.
const titledCard = (name: string, title: string, textRows = 2) =>
  defineArrayMember({
    name,
    title,
    type: 'object',
    fields: [
      defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
      defineField({ name: 'text', title: 'Text', type: 'text', rows: textRows, validation: (r) => r.required() }),
    ],
    preview: { select: { title: 'title', subtitle: 'text' } },
  })

export const areaPage = defineType({
  name: 'areaPage',
  title: 'Service area page',
  type: 'document',
  icon: PinIcon,
  groups: [
    { name: 'page', title: 'Page', icon: PinIcon, default: true },
    { name: 'hero', title: 'B1 Hero', icon: HomeIcon },
    { name: 'services', title: 'B2 Services', icon: ThListIcon },
    { name: 'owner', title: 'B3 Owner', icon: UserIcon },
    { name: 'reviews', title: 'B4 Reviews', icon: StarIcon },
    { name: 'price', title: 'B6 Price', icon: BillIcon },
    { name: 'choose', title: 'B7 Choose', icon: BulbOutlineIcon },
    { name: 'districts', title: 'B9 Districts', icon: EarthGlobeIcon },
    { name: 'buildings', title: 'B10 Buildings', icon: HomeIcon },
    { name: 'permits', title: 'B11 Permits', icon: ClipboardIcon },
    { name: 'nearby', title: 'Nearby', icon: EarthGlobeIcon },
    { name: 'faq', title: 'B12 FAQ', icon: HelpCircleIcon },
    { name: 'cta', title: 'B13 CTA', icon: PinIcon },
    { name: 'seo', title: 'SEO', icon: SearchIcon },
    { name: 'editorial', title: 'To confirm', icon: WarningOutlineIcon },
  ],

  fields: [
    // ── Page ────────────────────────────────────────────────
    defineField({
      name: 'areaName',
      title: 'Area name',
      description: 'As it appears in the breadcrumb and page list, e.g. "West Loop", "Lincoln Park".',
      type: 'string',
      group: 'page',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'areaNameInSentence',
      title: 'Area name in a sentence',
      description: 'How copy refers to it mid-sentence, e.g. "the West Loop" or "Lincoln Park".',
      type: 'string',
      group: 'page',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL slug',
      type: 'slug',
      group: 'page',
      options: { source: 'areaName', maxLength: 96 },
      validation: (r) => r.required(),
    }),

    // ── B1 Hero + request card ─────────────────────────────
    defineField({
      name: 'hero',
      title: 'B1 · Hero + request card',
      type: 'object',
      group: 'hero',
      options: { collapsible: false },
      fields: [
        defineField({
          name: 'h1',
          title: 'H1',
          description: 'Pattern: "Heating and cooling repair in {area}, Chicago".',
          type: 'string',
          validation: (r) => [
            r.required(),
            r.custom((v?: string) =>
              !v || /^Heating and cooling repair in .+, Chicago$/.test(v)
                ? true
                : 'Playbook pattern: "Heating and cooling repair in {area}, Chicago".',
            ).warning(),
          ],
        }),
        defineField({
          name: 'lede',
          title: 'Lede',
          description: `Equipment + the area's housing stock. Always ends: "${LEDE_ENDING}"`,
          type: 'text',
          rows: 3,
          validation: (r) => [
            r.required(),
            r.custom((v?: string) =>
              !v || v.trim().endsWith(LEDE_ENDING) ? true : `The lede should end: "${LEDE_ENDING}"`,
            ).warning(),
          ],
        }),
        // The hero photo is shared: it lives in the Service area template.
        defineField({ name: 'image', title: 'Hero photo', type: 'image', hidden: true, // moved to the Service area template (areaTemplate); kept so older data still reads
        }),
        defineField({
          name: 'formTitle',
          title: 'Request card title',
          description: 'e.g. "Book HVAC service in the West Loop".',
          type: 'string',
          validation: (r) => r.required(),
        }),
        defineField({
          name: 'buildingTypeOptions',
          title: 'Building type options',
          description: 'Choices in the "Building type" dropdown, from the area\'s housing stock.',
          type: 'array',
          of: [defineArrayMember({ type: 'string' })],
          validation: (r) => r.required().min(2),
        }),
        defineField({
          name: 'defaultBuildingType',
          title: 'Default building type',
          description: 'Pre-selected option. Must match one of the options above.',
          type: 'string',
          validation: (r) =>
            r.required().custom((v: string | undefined, ctx) => {
              const opts: string[] = (ctx.parent as { buildingTypeOptions?: string[] } | undefined)?.buildingTypeOptions ?? []
              return !v || opts.includes(v) ? true : 'Must be one of the building type options.'
            }),
        }),
        defineField({
          name: 'issueOptions',
          title: '"What\'s happening?" options',
          type: 'array',
          of: [defineArrayMember({ type: 'string' })],
          hidden: true, // moved to the Service area template (areaTemplate); kept so older data still reads
        }),
      ],
    }),

    // ── B2 Services ────────────────────────────────────────
    defineField({
      name: 'services',
      title: 'B2 · Services',
      description: 'The 24 services are shared by every area page. Only the heading changes.',
      type: 'object',
      group: 'services',
      fields: [
        defineField({
          name: 'heading',
          title: 'Heading',
          description: 'e.g. "Every heating and cooling service we offer in the West Loop".',
          type: 'string',
          validation: (r) => r.required(),
        }),
      ],
    }),

    // ── B3 Who you're calling ──────────────────────────────
    defineField({
      name: 'owner',
      title: "B3 · Who you're calling",
      description: 'Founded, rating, owner and licence tiles are shared. Only the paragraph changes.',
      type: 'object',
      group: 'owner',
      fields: [
        defineField({
          name: 'paragraph',
          title: 'Paragraph',
          description:
            'Names the distance from 1225 N Cleaver St, e.g. "…about a mile and a half north of Fulton Market. Rob, the owner, still runs the calls…".',
          type: 'text',
          rows: 4,
          validation: (r) => r.required(),
        }),
      ],
    }),

    // ── B4 Reviews ─────────────────────────────────────────
    defineField({
      name: 'reviews',
      title: 'B4 · Reviews',
      type: 'object',
      group: 'reviews',
      fields: [
        defineField({
          name: 'heading',
          title: 'Heading',
          type: 'string',
          hidden: true, // moved to the Service area template (areaTemplate); kept so older data still reads
        }),
        defineField({
          name: 'intro',
          title: 'Intro',
          type: 'text',
          rows: 2,
          hidden: true, // moved to the Service area template (areaTemplate); kept so older data still reads
        }),
        defineField({
          name: 'items',
          title: 'Reviews',
          description:
            'Verbatim Google reviews, ranked by equipment match for this area. Never edit, merge or paraphrase.',
          type: 'array',
          of: [
            defineArrayMember({
              name: 'review',
              type: 'object',
              fields: [
                defineField({
                  name: 'service',
                  title: 'Service tag',
                  description: 'e.g. "Furnace repair", "Boiler service".',
                  type: 'string',
                  validation: (r) => r.required(),
                }),
                defineField({
                  name: 'quote',
                  title: 'Quote (verbatim)',
                  description: 'The opening 60–70 words, cut at a sentence end.',
                  type: 'text',
                  rows: 5,
                  validation: (r) => [
                    r.required(),
                    r.custom((v?: string) => {
                      if (!v) return true
                      const words = v.trim().split(/\s+/).length
                      return words >= 50 && words <= 80
                        ? true
                        : `${words} words. Aim for the opening 60–70 words.`
                    }).warning(),
                  ],
                }),
                defineField({ name: 'reviewerName', title: 'Reviewer name', type: 'string', validation: (r) => r.required() }),
                defineField({ name: 'year', title: 'Year', type: 'number', validation: (r) => r.required().integer().min(2000) }),
                defineField({ name: 'googleUrl', title: 'Google review link', type: 'url', validation: (r) => r.required() }),
              ],
              preview: { select: { title: 'reviewerName', subtitle: 'service' } },
            }),
          ],
          validation: (r) => r.min(3).max(6).warning('The template shows 4 reviews (3–6 works).'),
        }),
      ],
    }),

    // ── B5 Process: shared, in the Service area template ────
    defineField({
      name: 'process',
      type: 'object',
      hidden: true, // moved to the Service area template (areaTemplate); kept so older data still reads
      fields: [
        defineField({ name: 'heading', type: 'string' }),
        defineField({ name: 'steps', type: 'array', of: [titledCard('step', 'Step')] }),
      ],
    }),

    // ── B6 Scope and price ─────────────────────────────────
    defineField({
      name: 'price',
      title: 'B6 · Scope and price',
      type: 'object',
      group: 'price',
      fields: [
        defineField({
          name: 'heading',
          title: 'Heading',
          description: 'Names the area\'s three building types, e.g. "…costs differently in a loft, a tower and a kitchen".',
          type: 'string',
          validation: (r) => r.required(),
        }),
        defineField({
          name: 'intro',
          title: 'Intro',
          type: 'text',
          rows: 3,
          hidden: true, // moved to the Service area template (areaTemplate); kept so older data still reads
        }),
        defineField({
          name: 'medianValue',
          title: 'Median value',
          type: 'string',
          hidden: true, // moved to the Service area template (areaTemplate); kept so older data still reads
        }),
        defineField({
          name: 'medianCaption',
          title: 'Median caption',
          type: 'text',
          hidden: true, // moved to the Service area template (areaTemplate); kept so older data still reads
        }),
        defineField({
          name: 'factors',
          title: 'Price factors',
          description: 'Exactly six. The last one is always "Repair or replace".',
          type: 'array',
          of: [titledCard('factor', 'Factor')],
          validation: (r) =>
            r.required().min(6).max(6).custom((items?: { title?: string }[]) =>
              !items?.length || items[items.length - 1]?.title === 'Repair or replace'
                ? true
                : 'The last factor must be "Repair or replace".',
            ),
        }),
      ],
    }),

    // ── B7 How to choose ───────────────────────────────────
    defineField({
      name: 'choose',
      title: 'B7 · How to choose',
      type: 'object',
      group: 'choose',
      fields: [
        defineField({
          name: 'heading',
          title: 'Heading',
          description: 'e.g. "Five questions that sort West Loop HVAC companies".',
          type: 'string',
          validation: (r) => r.required(),
        }),
        defineField({
          name: 'questions',
          type: 'array',
          of: [titledCard('question', 'Question')],
          hidden: true, // moved to the Service area template (areaTemplate); kept so older data still reads
        }),
      ],
    }),

    // ── B9 Districts ───────────────────────────────────────
    defineField({
      name: 'districts',
      title: 'B9 · Districts',
      type: 'object',
      group: 'districts',
      fields: [
        defineField({
          name: 'eyebrow',
          title: 'Eyebrow',
          description: 'e.g. "The West Loop, district by district".',
          type: 'string',
          validation: (r) => r.required(),
        }),
        defineField({
          name: 'heading',
          title: 'Heading (boundaries)',
          description: 'e.g. "Grand Ave to I-290, Ashland to the river".',
          type: 'string',
          validation: (r) => r.required(),
        }),
        defineField({
          name: 'zips',
          title: 'ZIP codes',
          type: 'array',
          of: [defineArrayMember({ type: 'string', validation: (r) => r.regex(/^\d{5}$/).error('5-digit ZIP') })],
          options: { layout: 'tags' },
          validation: (r) => r.required().min(1),
        }),
        defineField({
          name: 'wards',
          title: 'Wards',
          type: 'array',
          of: [defineArrayMember({ type: 'number' })],
          validation: (r) => r.required().min(1),
        }),
        defineField({
          name: 'communityArea',
          title: 'Community area',
          description: 'Name and number, e.g. "Near West Side (28)".',
          type: 'string',
          validation: (r) => r.required(),
        }),
        defineField({
          name: 'items',
          title: 'Districts',
          description: '3–5 named sub-districts.',
          type: 'array',
          of: [
            defineArrayMember({
              name: 'district',
              type: 'object',
              fields: [
                defineField({ name: 'name', title: 'Name', type: 'string', validation: (r) => r.required() }),
                defineField({ name: 'description', title: 'Character', description: 'One line.', type: 'text', rows: 2, validation: (r) => r.required() }),
                defineField({ name: 'hvacHere', title: '"HVAC here" note', description: 'Shown in blue, e.g. "rooftop units, make-up air, steam in older lofts."', type: 'string', validation: (r) => r.required() }),
              ],
              preview: { select: { title: 'name', subtitle: 'hvacHere' } },
            }),
          ],
          validation: (r) => r.required().min(3).max(5),
        }),
      ],
    }),

    // ── B10 Building types ─────────────────────────────────
    defineField({
      name: 'buildings',
      title: 'B10 · Building types',
      type: 'object',
      group: 'buildings',
      fields: [
        defineField({
          name: 'heading',
          title: 'Heading',
          description: 'e.g. "What heats and cools your West Loop building".',
          type: 'string',
          validation: (r) => r.required(),
        }),
        defineField({
          name: 'types',
          title: 'Building types',
          description: 'Exactly four, from the area\'s real housing stock. The fourth is the navy highlight.',
          type: 'array',
          of: [
            defineArrayMember({
              name: 'buildingType',
              type: 'object',
              fields: [
                defineField({ name: 'tag', title: 'Tag', description: 'Short uppercase label, e.g. LOFT, TOWER, GREYSTONE.', type: 'string', validation: (r) => r.required().max(14) }),
                defineField({ name: 'name', title: 'Name', type: 'string', validation: (r) => r.required() }),
                defineField({ name: 'text', title: 'What heats and cools it', type: 'text', rows: 3, validation: (r) => r.required() }),
              ],
              preview: { select: { title: 'name', subtitle: 'tag' } },
            }),
          ],
          validation: exactly(4),
        }),
      ],
    }),

    // ── B11 Permit record ──────────────────────────────────
    defineField({
      name: 'permits',
      title: 'B11 · Permit record',
      description: 'Citywide figures and City & Suburban\'s 0 are shared. Only the area count changes.',
      type: 'object',
      group: 'permits',
      fields: [
        defineField({
          name: 'areaCount',
          title: 'Area HVAC permits (24 months)',
          description: 'From City of Chicago building permits, filtered to this area.',
          type: 'number',
          validation: (r) => r.required().integer().min(0),
        }),
        defineField({
          name: 'areaCaption',
          title: 'Caption',
          description: 'e.g. "West Loop permits in 24 months that even mention HVAC equipment."',
          type: 'string',
          validation: (r) => r.required(),
        }),
        defineField({
          name: 'totalPermits',
          title: 'All permits in the area (same 24 months)',
          description: "Every building permit inside the area's boundary, for the data-source line.",
          type: 'number',
          validation: (r) => r.integer().min(0),
        }),
        defineField({ name: 'windowFrom', title: 'Window: from', type: 'date' }),
        defineField({ name: 'windowTo', title: 'Window: to', type: 'date' }),
        defineField({
          name: 'byEquipment',
          title: 'By equipment',
          description: 'How many of the area HVAC permits name each kind of equipment (one permit can name several). Shown as the bar graph.',
          type: 'array',
          of: [
            defineArrayMember({
              name: 'equipmentCount',
              type: 'object',
              fields: [
                defineField({ name: 'label', title: 'Equipment', type: 'string', validation: (r) => r.required() }),
                defineField({ name: 'count', title: 'Permits', type: 'number', validation: (r) => r.required().integer().min(0) }),
              ],
              preview: { select: { title: 'label', subtitle: 'count' } },
            }),
          ],
        }),
      ],
    }),

    // ── Nearby neighbourhoods ──────────────────────────────
    defineField({
      name: 'nearby',
      title: 'Neighborhoods next to this area',
      description: 'Up to six bordering neighborhoods, each with one line on how its buildings differ. A card links to its area page when one is published. Leave empty to list the other published area pages instead.',
      type: 'object',
      group: 'nearby',
      fields: [
        defineField({
          name: 'items',
          title: 'Neighborhoods',
          type: 'array',
          of: [
            defineArrayMember({
              name: 'nearbyArea',
              type: 'object',
              fields: [
                defineField({ name: 'name', title: 'Name', type: 'string', validation: (r) => r.required() }),
                defineField({ name: 'text', title: 'One line', type: 'string', validation: (r) => r.required().max(110) }),
              ],
              preview: { select: { title: 'name', subtitle: 'text' } },
            }),
          ],
          validation: (r) => r.max(6),
        }),
      ],
    }),

    // ── B12 FAQ ────────────────────────────────────────────
    defineField({
      name: 'faq',
      title: 'B12 · FAQ',
      type: 'object',
      group: 'faq',
      fields: [
        defineField({
          name: 'heading',
          title: 'Heading',
          description: 'e.g. "West Loop HVAC, answered".',
          type: 'string',
          validation: (r) => r.required(),
        }),
        defineField({
          name: 'items',
          title: 'Questions',
          description: 'Three questions about this area. The shared questions (permits, hours) come from the Service area template. The first is shown open.',
          type: 'array',
          of: [
            defineArrayMember({
              name: 'faqItem',
              type: 'object',
              fields: [
                defineField({ name: 'question', title: 'Question', type: 'string', validation: (r) => r.required() }),
                defineField({ name: 'answer', title: 'Answer', type: 'text', rows: 4, validation: (r) => r.required() }),
              ],
              preview: { select: { title: 'question', subtitle: 'answer' } },
            }),
          ],
          validation: (r) => r.required().min(3).max(5),
        }),
      ],
    }),

    // ── B13 Closing CTA ────────────────────────────────────
    defineField({
      name: 'cta',
      title: 'B13 · Closing CTA',
      type: 'object',
      group: 'cta',
      fields: [
        defineField({
          name: 'heading',
          title: 'Heading',
          type: 'string',
          hidden: true, // moved to the Service area template (areaTemplate); kept so older data still reads
        }),
        defineField({
          name: 'text',
          title: 'Text',
          description: 'What to have ready. The last sentence names the local access detail.',
          type: 'text',
          rows: 3,
          validation: (r) => r.required(),
        }),
      ],
    }),

    // ── SEO ────────────────────────────────────────────────
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      group: 'seo',
      fields: [
        defineField({ name: 'title', title: 'Meta title', type: 'string', validation: (r) => r.max(60).warning('Keep under 60 characters.') }),
        defineField({ name: 'description', title: 'Meta description', type: 'text', rows: 3, validation: (r) => r.max(160).warning('Keep under 160 characters.') }),
      ],
    }),

    // ── Editorial flags ────────────────────────────────────
    defineField({
      name: 'confirmNotes',
      title: 'To confirm before publishing',
      description: 'Editorial [CONFIRM] flags. Never shown on the site. Clear them all before publishing.',
      type: 'array',
      group: 'editorial',
      of: [
        defineArrayMember({
          name: 'confirmNote',
          type: 'object',
          fields: [
            defineField({
              name: 'block',
              title: 'Block',
              type: 'string',
              options: {
                list: ['B1 Hero', 'B2 Services', 'B3 Owner', 'B4 Reviews', 'B5 Process', 'B6 Price', 'B7 Choose', 'B9 Districts', 'B10 Buildings', 'B11 Permits', 'B12 FAQ', 'B13 CTA', 'SEO'],
              },
              validation: (r) => r.required(),
            }),
            defineField({ name: 'note', title: 'What needs confirming', type: 'text', rows: 2, validation: (r) => r.required() }),
          ],
          preview: { select: { title: 'note', subtitle: 'block' } },
        }),
      ],
      validation: (r) =>
        r.custom((v?: unknown[]) => (v?.length ? `${v.length} item(s) still to confirm.` : true)).warning(),
    }),
  ],

  orderings: [{ title: 'Area name', name: 'areaAsc', by: [{ field: 'areaName', direction: 'asc' }] }],
  preview: {
    select: { title: 'areaName', subtitle: 'hero.h1', media: 'hero.image' },
  },
})
