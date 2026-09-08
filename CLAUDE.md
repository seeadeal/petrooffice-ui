# CLAUDE — wire PetroOffice UI (do not restyle)

You are implementing backends behind a finished UI. Copy the source files in this repo as-is. Do not change layout, palette, type, or chrome.

## Two products

| App | When | Chrome | Hook | Your backend |
|---|---|---|---|---|
| PetroOffice (desk) | width ≥ 768px | floating bottom dock | `useOffice` | Office API |
| Floor (phone) | width < 768px | native tab bar | `useFloor` | Floor API |

They MUST NOT share rows. A price post or BOL accept on Floor must leave Office unchanged.

Store: Northline Petroleum · #0121 Main Street · Harrisburg · Jordan Hale (JH) · clock frozen Fri, Aug 28 · 2:14 PM.

## Your job

1. Scaffold TanStack Start + React 19 + Tailwind v4 + Zustand + the deps in package.json.
2. Keep every file at its path.
3. Replace only `commit` / `hydrate` inside `src/lib/station-store.ts` (and the two thin wrappers `src/lib/store.ts` + `src/lib/floor/store.ts`) so:
   - Office GET/POST hits the Office backend
   - Floor GET/POST hits the Floor backend
4. Keep every `StationState` method name and argument shape. Screens already call them.
5. Seed each backend independently from `src/lib/seed.ts`.

## Store contract (do not rename)

```
select(id)
postPrice(id, posted)
matchCompetitor(id)
acceptDelivery(id)
disputeDelivery(id)
attachBol(id)
scheduleDelivery({ gradeId, gallons, window, supplier })
resolveException(id)
countDrawer(shiftId, counted)
closeShift(shiftId)
receiveSku(id, qty)
markCompliance(id, status)
```

Snapshot: tanks, prices, deliveries, shifts, exceptions, inventory, compliance, scheduled, priceLog, selectedId.

Mutations in `src/lib/station-ops.ts` (`StationMutation` discriminated union). Round-trip a full snapshot (or patch the same fields).

## Visual rules

- Tokens: `src/styles.css` — night `#0c1012`, petrol `#7dbeb6`, paper `#f4f0e6`, IBM Plex Sans + Mono.
- No new colors, fonts, gradients, or emoji-as-icons.
- Dock = desk only. Floor tab bar = phone only (`md:hidden` / `hidden md:contents` in app-shell).
- Phone tap targets ≥ 44px. No overflow at 390px.
- Export = paper close packet + tidy CSV (`export-today.ts`).

## Routes

`/ /fuel /deliveries /shifts /inventory /financials /compliance /export /more`

Phone tabs: Today, Fuel, Loads, Sales, More. More stacks Store / Books / Rules / Close.

## Out of scope

Auth, Grok preview, and any existing SQL are omitted. You own persistence.
