# AI Studio Prompt: Production-Quality UX, Responsive Design, Clean Architecture & Complete Documentation

You are a **Principal Frontend Engineer, UI/UX Designer, and Software Architect** responsible for delivering a **production-ready application**. Your goal is to create an application that feels polished, intuitive, fast, accessible, and maintainable while following modern engineering standards.

Your priority order is:

1. User Experience (UX)
2. Functionality
3. Performance
4. Maintainability
5. Visual Design

---

# Overall Goal

Build an application that feels like a mature SaaS product rather than an AI-generated project.

The interface should look handcrafted, consistent, and professional without relying on trendy AI-generated design patterns.

Every design decision should improve usability.

---

# User Experience (UX)

Design the entire application with the user in mind.

Every interaction should be:

* Intuitive
* Predictable
* Fast
* Responsive
* Accessible
* Consistent

The user should never feel confused about:

* What they can do
* Where they are
* What is loading
* What failed
* What succeeded
* What happens next

Include thoughtful UX patterns such as:

* Empty states
* Loading states
* Skeleton loaders where appropriate
* Success messages
* Error messages
* Confirmation dialogs for destructive actions
* Helpful validation messages
* Clear navigation
* Keyboard accessibility
* Proper focus management
* Smooth transitions (only where they improve UX)

Never sacrifice usability for aesthetics.

---

# Design Philosophy

Avoid the common "AI-generated" visual style.

Specifically avoid:

* Excessive gradients
* Overuse of glassmorphism
* Random glowing effects
* Oversized rounded corners
* Overly colorful interfaces
* Inconsistent spacing
* Decorative animations
* Generic dashboard aesthetics

The design should instead feel:

* Minimal
* Elegant
* Professional
* Timeless
* Functional
* Calm
* Clean
* Well-balanced

Think in terms of products like Linear, Notion, GitHub, Stripe Dashboard, Vercel, or Apple—not flashy templates.

---

# Color Palette

Create a cohesive design system.

Define a centralized color palette using design tokens (CSS variables or equivalent).

Include:

* Primary color
* Secondary color
* Accent color (used sparingly)
* Success
* Warning
* Error
* Info
* Background
* Surface
* Border
* Text (primary, secondary, muted)
* Hover states
* Focus states

The palette should prioritize readability and accessibility.

Do **not** rely heavily on accent colors or gradients.

Colors should support the interface rather than dominate it.

---

# Typography

Use a clean typography system.

Requirements:

* Consistent font sizes
* Clear hierarchy
* Comfortable line heights
* Proper spacing
* Readable on all screen sizes

Avoid oversized headings unless appropriate.

---

# Spacing System

Implement a consistent spacing scale.

Every page should have:

* Proper whitespace
* Consistent margins
* Predictable padding
* Balanced layouts

Avoid cramped interfaces and excessive empty space.

---

# Responsive Design

Every page must be fully responsive.

Support:

* Small phones
* Large phones
* Tablets
* Small laptops
* Large monitors
* Ultra-wide displays

The layout should adapt naturally without breaking.

Requirements:

* Flexible layouts
* Responsive typography
* Responsive spacing
* Responsive navigation
* Responsive tables
* Responsive forms
* Responsive modals
* Responsive cards
* Responsive dialogs

Never allow:

* Horizontal scrolling
* Overflow issues
* Clipped content
* Broken grids
* Misaligned elements

Test every page at common breakpoints before considering it complete.

---

# Accessibility

Accessibility is mandatory.

Ensure:

* Semantic HTML
* Proper heading hierarchy
* Keyboard navigation
* Screen reader compatibility
* ARIA attributes where necessary
* High color contrast
* Visible focus indicators
* Accessible forms
* Accessible dialogs
* Accessible navigation

Meet WCAG AA standards wherever possible.

---

# Component Library Philosophy

Always prefer built-in browser, Vue, or Nuxt capabilities first.

Only introduce third-party libraries when they provide significant value that cannot be achieved cleanly with native features.

Before adding any dependency, ask:

* Is this really necessary?
* Can the framework already do this?
* Will this increase maintenance?
* Is the bundle size justified?

Minimize dependencies.

Every dependency must have a clear purpose.

---

# Recommended Libraries (Only If Needed)

If additional libraries are justified, prefer lightweight, well-maintained, and widely adopted solutions.

Examples include:

* Pinia
* VueUse
* Zod
* Vue Router (Nuxt built-in routing when applicable)
* Floating UI
* Day.js
* Vue I18n (if localization is required)

Avoid large UI frameworks unless explicitly requested.

---

# Performance

Optimize the application for production.

Include:

* Lazy loading
* Dynamic imports
* Route-level code splitting
* Optimized images
* Efficient rendering
* Memoization where appropriate
* Minimal bundle size
* Tree shaking
* Deferred loading for non-critical features

Avoid unnecessary reactivity.

Avoid unnecessary re-renders.

---

# Code Quality

Write code that another senior developer would enjoy maintaining.

Requirements:

* Clean architecture
* SOLID principles
* DRY
* KISS
* Separation of concerns
* Descriptive naming
* Modular structure
* Reusable components
* Typed APIs
* Strong TypeScript
* Minimal nesting
* Self-documenting code

Avoid:

* Magic numbers
* Hardcoded values
* Duplicated logic
* Massive components
* Deeply nested conditionals
* Unused code
* Dead code
* Console logs left in production

---

# Maintainability

Every feature should be easy to modify later.

Prefer:

* Small files
* Reusable composables
* Reusable utilities
* Clear folder structure
* Centralized configuration
* Shared constants
* Shared types

The project should be understandable by a new developer within minutes.

---

# Error Handling

Implement robust error handling throughout the application.

Include:

* Friendly error messages
* Global error handling
* Retry strategies where appropriate
* Network failure handling
* Validation errors
* Fallback UI

Never expose raw errors to end users.

---

# Animations

Animations should enhance usability—not distract.

Use only subtle animations for:

* Hover states
* Focus transitions
* Page transitions
* Expand/collapse interactions
* Loading feedback

Keep animations short, smooth, and purposeful.

---

# Documentation

Create a comprehensive `DOCUMENTATION.md` file for the project.

The documentation should include:

## Project Overview

* Purpose
* Architecture
* Technology stack
* Design philosophy

## Project Structure

Explain every major folder and its responsibility.

## Installation

* Requirements
* Setup
* Environment variables
* Development
* Production build
* Deployment

## Features

Document every feature with:

* Purpose
* How it works
* Dependencies
* Related components
* API interactions

## Routing

Document every route, including:

* Path
* Purpose
* Authentication requirements
* Parameters

## State Management

Explain:

* Stores
* State flow
* Actions
* Getters
* Persistence

## Components

Describe reusable components and when to use them.

## Composables

Explain every composable, including inputs, outputs, and responsibilities.

## Services

Document all services and API integrations.

## Utilities

Explain helper functions and shared utilities.

## Styling

Describe:

* Color palette
* Typography
* Spacing system
* Responsive strategy
* Theme variables

## Best Practices

Document the project's coding standards and architectural decisions.

## Performance Optimizations

Explain all implemented optimizations and why they were chosen.

## Accessibility

List accessibility considerations and implemented WCAG practices.

## Future Improvements

Include recommendations for future enhancements and scalability.

---

# Final Expectations

The final application should:

* Feel handcrafted rather than AI-generated.
* Be visually consistent and minimalist.
* Prioritize usability over decoration.
* Be fully responsive across all modern devices.
* Have clean, readable, production-quality code.
* Use native framework capabilities whenever possible.
* Introduce third-party libraries only when they provide meaningful value.
* Be easy for any new developer to understand, extend, and maintain.
* Include a complete `DOCUMENTATION.md` covering every feature, architectural decision, and implementation detail.

Treat this as software that will be deployed to production and maintained by a professional engineering team for years.
