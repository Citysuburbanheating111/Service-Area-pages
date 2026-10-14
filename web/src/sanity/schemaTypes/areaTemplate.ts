/**
 * Service area template: ONE document (id "areaTemplate") with everything every service area page
 * shares: business facts, section headings and intros, the request form, the 5 questions, the
 * 4 kinds of company, the About tiles, the 6 process steps, the permit record and the two fixed
 * FAQs. Edit it once and every area page (now and future) changes.
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
      fields: [str('eyebrow', 'Eyebrow'), txt('intro', 'Intro'), str('medianValue', 'Median value'), txt('medianCaption', 'Median caption', 3)],
    }),
    defineField({
      name: 'choose',
      title: 'How to choose (B7)',
      type: 'object',
      group: 'sections',
      fields: [
        str('eyebrow', 'Eyebrow'),
        str('lede', 'Line under the heading'),
        defineField({ name: 'questions', title: 'Five questions', type: 'array', of: [card('question', 'Question')], validation: exactly(5) }),
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
          of: [card('company', 'Company type', [defineField({ name: 'us', title: 'This is us', type: 'boolean', initialValue: false })])],
          validation: exactly(4),
        }),
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
        defineField({ name: 'promises', title: 'Three promises', type: 'array', of: [card('promise', 'Promise')], validation: exactly(3) }),
      ],
    }),
    defineField({
      name: 'reviews',
      title: 'Reviews (B4)',
      type: 'object',
      group: 'about',
      description: 'The four review cards stay on each area page.',
      fields: [str('eyebrow', 'Eyebrow'), str('heading', 'Heading'), txt('intro', 'Note under the reviews')],
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
        txt('text', 'Text', 4),
        str('citywideNumber', 'Citywide number'),
        txt('citywideCaption', 'Citywide caption'),
        str('ourNumber', 'Our number'),
        txt('ourCaption', 'Our caption'),
      ],
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
      fields: [str('eyebrow', 'Eyebrow'), str('heading', 'Heading')],
    }),
  ],
  preview: { prepare: () => ({ title: 'Service area template', subtitle: 'Shared by every service area page' }) },
})
