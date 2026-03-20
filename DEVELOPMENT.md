# Development Guidelines

## Mobile-First Principle

**REGEL: Alle pagina's en componenten MOETEN werken op mobiele telefoons.**

### Checklist voor elke nieuwe feature:
- [ ] Test op mobiel formaat (375px breed minimum)
- [ ] Gebruik responsive Tailwind classes: `sm:`, `md:`, `lg:`
- [ ] Grid layouts: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- [ ] Tekst: kleinere font-sizes op mobiel
- [ ] Padding: `p-4 sm:p-6` (minder padding op mobiel)
- [ ] Overflow: `overflow-x-auto` voor tabellen/code blocks
- [ ] Touch targets: minimaal 44x44px voor knoppen

### Responsive Patterns

**Cards/Stats:**
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  <div className="p-4 sm:p-6">
    <div className="text-2xl sm:text-3xl font-bold">Data</div>
  </div>
</div>
```

**Flexbox layouts:**
```jsx
<div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
  <div>Content</div>
</div>
```

**Text:**
```jsx
<h1 className="text-2xl sm:text-3xl lg:text-4xl">Title</h1>
<p className="text-sm sm:text-base">Body text</p>
```

**Code blocks:**
```jsx
<code className="block overflow-x-auto text-xs sm:text-sm">
  Long code here
</code>
```

### Testing

Test elke pagina op:
- **Mobiel:** 375px (iPhone SE)
- **Tablet:** 768px (iPad)
- **Desktop:** 1280px+

Browser DevTools → Toggle device toolbar → Test verschillende formaten.

### Common Mistakes ❌

- ❌ Fixed widths zonder responsive variants
- ❌ `grid-cols-3` zonder `grid-cols-1` fallback
- ❌ Te kleine touch targets (<44px)
- ❌ Tekst die overflowt zonder wrapping
- ❌ Horizontale scroll zonder `overflow-x-auto`

### Best Practices ✅

- ✅ Mobile-first: schrijf eerst mobile CSS, dan desktop
- ✅ Touch-friendly: grote knoppen, ruime spacing
- ✅ Performance: lazy load images, minimize JavaScript
- ✅ Accessibility: semantic HTML, keyboard navigation
- ✅ Test op echte device als mogelijk

## Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** SQLite (better-sqlite3)
- **Auth:** Jose JWT
- **Styling:** Tailwind CSS
- **Deployment:** PM2 + Apache reverse proxy

## Local Development

```bash
npm install
npm run dev
```

Runs on http://localhost:3007

## Production Build

```bash
npm run build
pm2 restart leads-dashboard
```

## Database Migrations

New migrations go in `src/scripts/migrate-*.ts`:

```bash
npx tsx src/scripts/migrate-follow-up.ts
```

## Code Style

- TypeScript strict mode
- Use server components by default
- Client components only when needed (forms, interactivity)
- Tailwind utility classes (no custom CSS unless necessary)
- **Mobile-first responsive design**
