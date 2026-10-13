# City & Suburban — Design System

Live design system for **City & Suburban Heating & Cooling** (family-owned Chicago HVAC since 1952), published from the Paper design file.

**Live site:** https://logeshmaximus.github.io/city-suburban/

## What's here

| Page | Description |
| --- | --- |
| [`index.html`](index.html) | Design system: color tokens, typography, shape & spacing, components, page templates |
| [`west-loop.html`](west-loop.html) | Service area page — approved template (West Loop) |
| [`lincoln-park.html`](lincoln-park.html) | Service area page built from the template (Lincoln Park) |

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

The area pages are exported 1:1 from the 1440px desktop artboards in Paper and scale down to fit smaller screens.
