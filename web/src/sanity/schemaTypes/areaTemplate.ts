/**
 * Service area template: ONE document (id "areaTemplate") with everything every service area page
 * shares: business facts, section headings and intros, the request form, the 5 questions, the
 * kinds of company, the About tiles, the review stats, the 6 process steps, the permit record,
 * the shared FAQs and the call checklist. Edit it once and every area page (now and future) changes.
 *
 * Area pages (areaPage) hold only what is specific to their area.
 * Business facts match the live site, citysuburbanheating.com.
 * Use {area} in a text field to insert the area's name.
 */
import { CogIcon } from '@sanity/icons/Cog'
import { defineArrayMember, defineField, defineType, type ArrayRule } from 'sanity'

export const TEMPLATE_ID = 'areaTemplate'

const exactly = (n: number) => (rule: ArrayRule<unknown[]>) =>
  rule.required().min(n).max(n).error(`The template uses exactly ${n} items.`)

const str = (name: string, title: string, description?: string) =>
  defineField({ name, title, type: 'string', description, validation: (r) => r.required() })
const txt = (name: string, title: string, rows = 2, description?: string) =>
  defineField({ name, title, type: 'text', rows, description, validation: (r) => r.required() })

const card = (name: string, title: string, extra: ReturnType<typeof defineField>[] = []) =>
  defineArrayMember({
    name,
    title,
    type: 'object',
    fields: [str('title', 'Title'), txt('text', 'Text'), ...extra],
    preview: { select: { title: 'title', subtitle: 'text' } },
  })

export const areaTemplate = defineType({
  name: 'areaTemplate',
  title: 'Service area template',
  type: 'document',
  icon: CogIcon,
  groups: [
    { name: 'business', title: 'Business facts', default: true },
    { name: 'hero', title: 'Hero + form' },
    { name: 'sections', title: 'Shared sections' },
    { name: 'about', title: 'About + reviews' },
    { name: 'process', title: 'Process + permits' },
    { name: 'faq', title: 'FAQ + next step' },
  ],
  fields: [
    // ── Business facts (from citysuburbanheating.com) ───────────────
    defineField({
      name: 'business',
      title: 'Business facts',
      description: 'Same as the live site, citysuburbanheating.com.',
      type: 'object',
      group: 'business',
      fields: [
        str('companyName', 'Company name'),
        str('ownerName', 'Owner'),
        str('phone', 'Phone', 'Shown as written, e.g. (773) 238-3838'),
        str('email', 'Email'),
        str('addressShort', 'Address (short)', 'e.g. 1225 N Cleaver St'),
        str('addressFull', 'Address (full)'),
        defineField({ name: 'mapsUrl', title: 'Google Maps link', type: 'url', validation: (r) => r.required() }),
        str('hours', 'Working hours', 'As on the live site, e.g. 24/7'),
        defineField({ name: 'foundedYear', title: 'Founded', type: 'number', validation: (r) => r.required().integer() }),
        str('experience', 'Experience line', 'e.g. 50+ years experience'),
        str('licensing', 'Licensing line', 'No licence number is published on the live site.'),
        defineField({ name: 'rating', title: 'Google rating', type: 'number', validation: (r) => r.required().min(1).max(5) }),
        defineField({ name: 'reviewCount', title: 'Google review count', type: 'number', validation: (r) => r.required().integer() }),
        str('ratingAsOf', 'Rating "as of" date', 'e.g. 31 Aug 2026'),
        defineField({ name: 'reviewerNames', title: 'Names our reviewers remember', type: 'array', of: [{ type: 'string' }] }),
      ],
    }),

    // ── Hero + request form ──────────────────────────────────────────
    defineField({
      name: 'hero',
      title: 'Hero',
      type: 'object',
      group: 'hero',
      fields: [
        defineField({
          name: 'image',
          title: 'Background photo',
          description: 'Shared by every area page. Leave empty to use the standard photo.',
          type: 'image',
          options: { hotspot: true },
        }),
        defineField({ name: 'badges', title: 'Badges under the lede', type: 'array', of: [{ type: 'string' }] }),
        str('stripTitle', 'Photo strip title', 'Use {area} for the area name'),
      ],
    }),
    defineField({
      name: 'form',
      title: 'Request form',
      type: 'object',
      group: 'hero',
      fields: [
        str('promise', 'Line under the title'),
        defineField({ name: 'issueOptions', title: '"What\'s happening?" options', type: 'array', of: [{ type: 'string' }], validation: (r) => r.required().min(2) }),
        str('submitLabel', 'Button'),
        str('reassurance', 'Line under the button'),
      ],
    }),

    // ── Shared sections ──────────────────────────────────────────────
    defineField({
      name: 'services',
      title: 'Services (B2)',
      type: 'object',
      group: 'sections',
      fields: [str('pill', 'Pill'), txt('intro', 'Intro')],
    }),
    defineField({
      name: 'price',
      title: 'What changes the price (B6)',
      type: 'object',
      group: 'sections',
      fields: [
        str('eyebrow', 'Eyebrow'),
        txt('intro', 'Intro'),
        defineField({ name: 'howWePrice', title: '"How we price" points', type: 'array', of: [{ type: 'string' }], validation: exactly(4) }),
        str('medianQuestion', 'Median callout question', 'e.g. "What does a new furnace cost?"'),
        str('medianValue', 'Median value'),
        txt('medianCaption', 'Median caption', 3),
      ],
    }),
    defineField({
      name: 'choose',
      title: 'How to choose (B7)',
      type: 'object',
      group: 'sections',
      fields: [
        str('eyebrow', 'Eyebrow'),
        str('lede', 'Line under the heading'),
        defineField({
          name: 'questions',
          title: 'Five questions',
          description: 'One row each in the "How to choose" table.',
          type: 'array',
          of: [card('question', 'Question', [str('verify', 'How to verify it'), str('answer', "City & Suburban's answer")])],
          validation: exactly(5),
        }),
      ],
    }),
    defineField({
      name: 'companies',
      title: 'Kinds of HVAC company (B8)',
      type: 'object',
      group: 'sections',
      fields: [
        str('eyebrow', 'Eyebrow'),
        str('heading', 'Heading'),
        defineField({
          name: 'items',
          title: 'Company types',
          type: 'array',
          of: [
            card('company', 'Company type', [
              defineField({ name: 'us', title: 'This is us', type: 'boolean', initialValue: false }),
              str('talkTo', 'Who you talk to'),
              str('priceSet', 'How the price is set'),
              str('fitsWhen', 'Fits best when'),
            ]),
          ],
          validation: (r) => r.required().min(4).max(5).error('The template uses 4 or 5 company types.'),
        }),
        txt('fitNote', '"Where we fit, honestly"', 4, 'Use {area} for the area name'),
      ],
    }),

    // ── About + reviews ──────────────────────────────────────────────
    defineField({
      name: 'about',
      title: 'About City & Suburban (B3)',
      type: 'object',
      group: 'about',
      fields: [
        str('eyebrow', 'Eyebrow'),
        str('heading', 'Heading'),
        str('lead', 'Bold first line'),
        txt('ownerTile', 'Owner tile'),
        txt('foundedTile', 'Founded tile'),
        txt('permitTile', 'Permit record tile'),
        txt('hoursTile', 'Hours tile'),
        str('familyHeading', '"Why family-owned matters" heading', 'Use {area} for the area name'),
        defineField({ name: 'familyPoints', title: '"Why family-owned matters" points', type: 'array', of: [{ type: 'string' }], validation: exactly(4) }),
        defineField({ name: 'promises', title: 'Three promises ("How we work")', type: 'array', of: [card('promise', 'Promise')], validation: exactly(3) }),
      ],
    }),
    defineField({
      name: 'reviews',
      title: 'Reviews (B4)',
      type: 'object',
      group: 'about',
      description: 'The four review cards stay on each area page.',
      fields: [
        str('eyebrow', 'Eyebrow'),
        str('heading', 'Heading'),
        txt('intro', 'Note under the reviews'),
        str('statsHeading', 'Review stats heading'),
        txt('statsIntro', 'Review stats intro'),
        defineField({
          name: 'stats',
          title: 'Review stats',
          description: 'What reviewers chose to mention, counted across the Google review export.',
          type: 'array',
          of: [
            defineArrayMember({
              name: 'reviewStat',
              type: 'object',
              fields: [
                str('value', 'Count', 'e.g. 90'),
                str('label', 'What they mention'),
                defineField({ name: 'percent', title: 'Share of reviews (%)', type: 'number', validation: (r) => r.required().min(0).max(100) }),
              ],
              preview: { select: { title: 'value', subtitle: 'label' } },
            }),
          ],
          validation: exactly(4),
        }),
        txt('statsNote', 'Note under the stats'),
      ],
    }),

    // ── Process + permits ────────────────────────────────────────────
    defineField({
      name: 'process',
      title: 'Process (B5)',
      type: 'object',
      group: 'process',
      fields: [
        str('heading', 'Heading'),
        defineField({ name: 'steps', title: 'Steps', type: 'array', of: [card('step', 'Step')], validation: exactly(6) }),
      ],
    }),
    defineField({
      name: 'permits',
      title: 'Permit record (B11)',
      type: 'object',
      group: 'process',
      description: "The area's own permit count stays on each area page.",
      fields: [
        str('eyebrow', 'Eyebrow'),
        str('heading', 'Heading'),
        txt('intro', 'Intro', 3, 'Use {area} for the area name ("the West Loop")'),
        txt('text', 'Text', 4),
        str('citywideNumber', 'Citywide number'),
        txt('citywideCaption', 'Citywide caption'),
        str('ourNumber', 'Our number'),
        txt('ourCaption', 'Our caption'),
        // Suburb pages: the City's permit file doesn't reach them, so there's no graph
        str('suburbHeading', 'Suburb: heading', 'Use {area} for the suburb name'),
        txt('suburbIntro', 'Suburb: intro', 3, 'Use {area} for the suburb name'),
        txt('suburbCard', 'Suburb: in place of the graph', 3, 'Use {area} and {authority} (e.g. "The Village of Skokie")'),
        txt('suburbText', 'Suburb: honest context text', 4),
        txt('suburbChooseText', 'Suburb: "Does a permit count mean anything here?" row', 2),
      ],
    }),

    defineField({
      name: 'nearby',
      title: 'Other neighborhoods',
      type: 'object',
      group: 'process',
      description: 'Lists the other published area pages.',
      fields: [str('eyebrow', 'Eyebrow'), str('heading', 'Heading'), txt('intro', 'Intro')],
    }),

    // ── FAQ + next step ──────────────────────────────────────────────
    defineField({
      name: 'faq',
      title: 'FAQ (B12)',
      type: 'object',
      group: 'faq',
      description: 'These questions are added after the three questions on each area page.',
      fields: [
        defineField({
          name: 'items',
          title: 'Shared questions',
          type: 'array',
          of: [
            defineArrayMember({
              name: 'faqItem',
              type: 'object',
              fields: [str('question', 'Question'), txt('answer', 'Answer', 3)],
              preview: { select: { title: 'question', subtitle: 'answer' } },
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'cta',
      title: 'Next step (B13)',
      type: 'object',
      group: 'faq',
      description: 'The closing line stays on each area page.',
      fields: [
        str('eyebrow', 'Eyebrow'),
        str('heading', 'Heading'),
        defineField({ name: 'checklist', title: '"Have these ready when you call"', type: 'array', of: [{ type: 'string' }], validation: exactly(6) }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: 'Service area template', subtitle: 'Shared by every service area page' }) },
})
