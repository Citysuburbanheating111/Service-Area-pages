# City & Suburban — Design System

Live design system for **City & Suburban Heating & Cooling** (family-owned Chicago HVAC since 1952), published from the Paper design file.

**Live site:** https://logeshmaximus.github.io/city-suburban/

## What's here

| Page | Description |
| --- | --- |
| [`index.html`](index.html) | Design system: color tokens, typography, shape & spacing, components, page templates |
| [`west-loop.html`](west-loop.html) | Service area page — approved template (West Loop) |
| [`lincoln-park.html`](lincoln-park.html) | Service area page built from the template (Lincoln Park) |
| [`west-loop-v3.html`](west-loop-v3.html) | Service area page v3 (West Loop): the Highlights Chicago service area layout in City & Suburban's design, exported 1:1 from Paper. The Sanity-driven pages render it through `web/src/components/area/AreaPageV3.tsx` with `assets/area-page-v3.css` |
| [`services-v1/service-areas/`](services-v1/service-areas/) | Service areas collection page (v1): collection cards for Chicago and nine neighbourhoods. The West Town card opens its area page; the rest are not linked yet |
| [`services-v1/service-areas/west-town/`](services-v1/service-areas/west-town/) | West Town service area landing page (draft v1), written with the city-suburban-service-area-page skill; a working page (links, form, tabs, FAQ, scrollable tracks, mobile layout) built by `tools/build_area_page.py` from the content file. The same content is a draft in Sanity |
| [`assets/site-nav.css`](assets/site-nav.css) · [`site-nav.js`](assets/site-nav.js) | Shared utility bar + header: hover dropdowns, links to the live site (citysuburbanheating.com), mobile menu |
| [`playbook/`](playbook/) | Area page playbook: rules, tokens, page anatomy, block library (B1–B13 + globals), copy rules, sources, workflow, QC checklist |

## Tokens

```css
:root {
  --color-bg: #FFFFFF;   --color-fog: #F2F4F6;  --color-line: #DCE2E7;
  --color-text: #3F4B55; --color-muted: #6A7782;
  --color-navy: #09263A; --color-red: #DD382B;  --color-red-dk: #AF281D; --color-blue: #186AA4;
  --font-display: 'Ubuntu', sans-serif;  --font-body: 'Noto Sans', sans-serif;
  --radius-sm: 8px; --radius-md: 16px; --radius-lg: 24px; --radius-pill: 999px;
}
```

Each area page has a sticky, tappable section index (a bottom-sheet drawer on mobile) with deep links such as `west-loop.html#cs-07`. The area pages are exported 1:1 from the 1440px desktop artboards in Paper and scale down to fit smaller screens.
