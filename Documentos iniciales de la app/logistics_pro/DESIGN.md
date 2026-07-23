---
name: Logistics Pro
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#434656'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#737688'
  outline-variant: '#c3c5d9'
  surface-tint: '#004ee8'
  primary: '#0047d3'
  on-primary: '#ffffff'
  primary-container: '#1e5eff'
  on-primary-container: '#f0f0ff'
  inverse-primary: '#b6c4ff'
  secondary: '#006e2a'
  on-secondary: '#ffffff'
  secondary-container: '#5cfd80'
  on-secondary-container: '#00732c'
  tertiary: '#7e4900'
  on-tertiary: '#ffffff'
  tertiary-container: '#a05e00'
  on-tertiary-container: '#ffeee2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#001550'
  on-primary-fixed-variant: '#003ab2'
  secondary-fixed: '#69ff87'
  secondary-fixed-dim: '#3ce36a'
  on-secondary-fixed: '#002108'
  on-secondary-fixed-variant: '#00531e'
  tertiary-fixed: '#ffdcbe'
  tertiary-fixed-dim: '#ffb870'
  on-tertiary-fixed: '#2c1600'
  on-tertiary-fixed-variant: '#693c00'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  data-price:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0.01em
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-margin: 16px
  gutter: 12px
---

## Brand & Style

The design system is engineered for the high-stakes environment of Colombian logistics, where reliability and speed are paramount. The brand personality is **Professional, Systematic, and Efficient**, mirroring the precision of modern freight movements while maintaining the approachability of a consumer-grade ride-sharing app.

The visual style is **Corporate Modern** with a focus on high-utility minimalism. It leverages generous whitespace to reduce cognitive load for drivers and shippers under stress. The emotional response should be one of "controlled momentum"—the user feels that their cargo is in safe, technologically-advanced hands. The interface avoids unnecessary flourishes, prioritizing data clarity and map-centric navigation.

## Colors

This design system utilizes a high-contrast palette designed for legibility in various lighting conditions (e.g., a driver's cabin in bright sunlight). 

- **Primary Blue (#1E5EFF):** Used for primary actions, active states, and brand identifiers. It signifies trust and technology.
- **Success Green (#00C853):** Reserved for "Job Completed," "Payment Received," and active status indicators.
- **Alert Orange (#FF9800):** A high-visibility accent for pricing, urgent notifications, and "Pending" states.
- **Surface & Background:** A cool-toned light gray (#F5F7FA) provides a calm foundation that distinguishes card elements from the background.

## Typography

The design system utilizes **Inter** for its exceptional legibility and systematic feel. The hierarchy is strictly enforced to guide users through complex logistics data.

- **Headlines:** Use Bold weights with tighter letter spacing for a modern, impactful look.
- **Prices/Key Data:** Specifically formatted with `data-price` tokens to ensure financial figures are immediately scannable.
- **Mobile Adaptation:** On mobile screens, `headline-lg` should drop to 24px to prevent excessive wrapping in constrained cargo detail views.

## Layout & Spacing

This design system follows a **Fluid Grid** model optimized for mobile devices. The rhythm is based on a **4px baseline grid**, ensuring all elements align vertically.

- **Margins:** Standard 16px horizontal margins for the main container to ensure content doesn't hit the screen edges.
- **Safe Areas:** Navigation elements must respect the bottom home indicator and top notch areas.
- **Map View:** When the map is the primary background, UI components (cards/buttons) should float with a 16px margin from all edges, creating a clear distinction between the "interactive layer" and the "information layer."

## Elevation & Depth

To maintain a clean and professional aesthetic, depth is communicated through **Ambient Shadows** and **Tonal Layering**. 

- **Level 1 (Base):** Background (#F5F7FA).
- **Level 2 (Cards):** White surfaces (#FFFFFF) with a soft, diffused shadow (0px 4px 20px rgba(0, 0, 0, 0.05)).
- **Level 3 (Floating Actions/Bottom Sheets):** Higher elevation with a more pronounced shadow (0px 8px 30px rgba(0, 0, 0, 0.08)).

Hard borders are avoided. Separation between elements is achieved through subtle value changes rather than lines, keeping the UI looking airy and modern.

## Shapes

The shape language is **Rounded**, balancing the industrial nature of cargo with the approachability of a digital service.

- **Primary Buttons/Inputs:** 12px corner radius (`rounded-lg` equivalent).
- **Cards/Modals:** 16px corner radius (`rounded-xl` equivalent).
- **Icons/Small Badges:** 4-8px radius.

The 12px standard for primary interaction points provides a "thumb-friendly" feel that is consistent with modern mobile OS standards.

## Components

### Buttons
- **Primary:** Full-width, #1E5EFF background, white text, 12px radius. Height: 56px for maximum tap target.
- **Secondary/Outline:** Transparent background with a 1.5px border in #1E5EFF.

### Cards
- White background, 16px radius, soft shadow. Used for shipment details, vehicle options, and driver profiles. Content inside cards should follow the `md` spacing (16px) for internal padding.

### Inputs
- **Floating Labels:** When the input is active or filled, the label shrinks and moves to the top border. 
- **Border:** 1.5px solid light gray, turning #1E5EFF on focus.

### Chips & Status Badges
- Used for cargo types (e.g., "Fragile," "Refrigerated"). Small, 4px rounded corners, utilizing low-opacity tints of the primary or accent colors.

### Bottom Navigation
- Fixed height of 64px + safe area. Uses simple outline icons that fill when active. Label text uses `label-sm`.

### Key Info Blocks
- For weight, volume, and distance. Uses `label-caps` for the title and `data-price` or `headline-sm` for the value to create a clear "Label: Value" hierarchy.