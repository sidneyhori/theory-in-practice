# Theory in Practice - Project Guidelines

## Overview

An educational interactive website where people learn theories through reading and interactive HTML/CSS/JS experiences. Content is written for a **high school audience** with a focus on real-world and business examples that make abstract concepts tangible.

## Tech Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript (no build tools, no frameworks)
- **Hosting**: GitHub Pages
- **Design Philosophy**: Editorial/magazine style with clean typography and generous whitespace

## Content Guidelines

### Target Audience
- **Primary**: High school students and curious adults
- **Secondary**: Professionals wanting refreshers, lifelong learners

We use a **single content level** that's accessible yet substantive. Think "smart high schooler" or "interested adult who isn't an expert." Avoid both dumbing down and unnecessary jargon.

### Writing Style
- Clear, conversational tone without being condescending
- Lead with real-world hooks and relatable examples
- Use "you" language to engage readers directly
- Avoid jargon; when technical terms are necessary, define them inline
- Short paragraphs (2-4 sentences max)
- Explain the "why" behind concepts, not just the "what"

### Example Types to Include (prioritize business/real-world)
1. **Business examples**: Pricing strategies, competition, market dynamics, negotiations
2. **Tech industry**: Algorithms, network effects, platform dynamics, startup strategy
3. **Everyday decisions**: Social situations, career choices, group dynamics
4. **Current events**: When relevant and will remain timeless
5. **Historical examples**: When they illuminate a concept memorably

### Interactive Components
- Should be immediately playable without extensive instructions
- Provide instant, meaningful feedback
- Allow experimentation and discovery
- Work well on mobile devices
- Connect to real-world applications in the description

---

## Design System

### Colors

**Light Mode**
```css
--color-bg: #FAFAFA;
--color-surface: #FFFFFF;
--color-text-primary: #1A1A1A;
--color-text-secondary: #525252;
--color-text-muted: #737373;
--color-accent: #2563EB;          /* Primary blue */
--color-accent-secondary: #7C3AED; /* Purple */
--color-border: #E5E5E5;
```

**Dark Mode**
```css
--color-bg: #0A0A0A;
--color-surface: #171717;
--color-text-primary: #F5F5F5;
--color-text-secondary: #A3A3A3;
--color-accent: #60A5FA;
--color-accent-secondary: #A78BFA;
--color-border: #262626;
```

**Category Colors**
```css
--color-math: #2563EB;
--color-physics: #DC2626;
--color-cs: #059669;
--color-economics: #D97706;
--color-biology: #7C3AED;
```

### Typography

- **Headings**: System serif stack (`Georgia, 'Times New Roman', serif`)
- **Body**: System sans-serif stack (`system-ui, -apple-system, sans-serif`)
- **Code/Data**: Monospace stack (`'SF Mono', Monaco, monospace`)

### Spacing Scale (base: 4px)

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

### Border Radius

```css
--radius-sm: 0.25rem;
--radius-md: 0.5rem;
--radius-lg: 0.75rem;
--radius-xl: 1rem;
--radius-full: 9999px;
```

---

## File Structure

```
theory-in-practice/
├── index.html              # Landing page
├── GUIDELINES.md           # This file
├── css/
│   ├── variables.css       # CSS custom properties
│   ├── base.css            # Reset and typography
│   ├── components.css      # Reusable components
│   └── themes.css          # Light/dark mode
├── js/
│   ├── theme.js            # Dark/light toggle
│   └── utils.js            # Shared utilities
├── theories/
│   └── [topic-name]/
│       ├── index.html      # Topic page
│       ├── [topic].css     # Topic-specific styles
│       └── [topic].js      # Interactive components
└── assets/
    └── icons/              # SVG icons
```

---

## Component Patterns

### Theory Card (Landing Page)
```html
<a href="theories/topic/index.html" class="theory-card">
  <p class="theory-card-category" data-category="math">Mathematics</p>
  <h3 class="theory-card-title">Topic Name</h3>
  <p class="theory-card-description">Brief description...</p>
  <p class="theory-card-status available">Explore →</p>
</a>
```

### Content Section
```html
<section class="content-section">
  <h2>Section Title</h2>
  <p>Content paragraph...</p>

  <div class="callout">
    <p class="callout-title">Key Insight</p>
    <p>Important point highlighted...</p>
  </div>
</section>
```

### Interactive Section
```html
<section class="interactive-section">
  <h2 class="interactive-title">Interactive Title</h2>
  <p class="interactive-description">Brief explanation...</p>

  <!-- Interactive component here -->
</section>
```

### Key Concepts Grid
```html
<div class="key-concepts">
  <div class="concept-card">
    <p class="concept-term">Term</p>
    <p class="concept-definition">Definition...</p>
  </div>
</div>
```

---

## Responsive Breakpoints

```css
/* Mobile first approach */
@media (min-width: 640px)  { /* Tablet */ }
@media (min-width: 768px)  { /* Small desktop */ }
@media (min-width: 1024px) { /* Desktop */ }
```

### Mobile Guidelines
- Minimum touch target: 44x44px
- Content padding: 16px (--space-4) minimum
- Stack layouts vertically on mobile
- Full-width buttons and inputs

---

## Curated Topics (20)

### Mathematics & Logic
1. Game Theory
2. Probability & Bayesian Thinking
3. Graph Theory
4. Fractals & Self-Similarity
5. Chaos Theory

### Physics
6. Special Relativity
7. Quantum Mechanics Basics
8. Sound & Waves
9. Entropy & Thermodynamics

### Computer Science & AI
10. Generative AI & Neural Networks
11. Quantum Computing
12. Cryptography
13. Information Theory
14. Algorithms & Complexity

### Economics & Social Sciences
15. Supply & Demand
16. Network Effects
17. Compound Growth

### Biology & Systems
18. Natural Selection
19. Epidemiology
20. Cognitive Biases

---

## Development Workflow

1. **New topic**: Create folder in `theories/`, copy structure from existing topic
2. **Styling**: Use CSS variables from `variables.css`, add topic-specific styles in dedicated file
3. **Interactives**: Keep JS self-contained in IIFE, expose minimal API on `window.TIP`
4. **Testing**: Check mobile responsiveness, dark mode, all interactive states
5. **Deploy**: Push to main branch, GitHub Pages auto-deploys
