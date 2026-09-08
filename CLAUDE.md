# CLAUDE — wire PetroOffice UI (do not restyle)

You are implementing backends behind a finished UI. Copy every file below as-is. Do not change layout, palette, type, or chrome.

The kit already runs on local Zustand. Your job is persistence — two backends.

## Two products

| App | When | Chrome | Hook | Your backend |
|---|---|---|---|---|
| PetroOffice (desk) | width ≥ 768px | floating bottom dock | `useOffice` | Office API |
| Floor (phone) | width < 768px | native tab bar | `useFloor` | Floor API |

They MUST NOT share rows. A price post or BOL accept on Floor must leave Office unchanged.

Store: Northline Petroleum · #0121 Main Street · Harrisburg · Jordan Hale (JH) · clock frozen Fri, Aug 28 · 2:14 PM.

## Your job

1. Scaffold TanStack Start + React 19 + Tailwind v4 + Zustand using the `package.json` in this kit.
2. Paste every file at the path in its heading.
3. Wire only these two files:
   - `src/lib/store.ts` — Office GET/POST (search `WIRE HERE`)
   - `src/lib/floor/store.ts` — Floor GET/POST (search `WIRE HERE`)
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

Mutations: `src/lib/station-ops.ts` (`StationMutation`). Round-trip a full snapshot.

`load` = GET snapshot. `mutate` = apply one mutation, return snapshot.

## Visual rules

- Tokens: `src/styles.css` — night `#0c1012`, petrol `#7dbeb6`, paper `#f4f0e6`, IBM Plex Sans + Mono.
- No new colors, fonts, gradients, or emoji-as-icons.
- Dock = desk only. Floor tab bar = phone only.
- Phone tap targets ≥ 44px. No overflow at 390px.
- Export = paper close packet + tidy CSV (`export-today.ts`).

## Routes

`/ /fuel /deliveries /shifts /inventory /financials /compliance /export /more`

Phone tabs: Today, Fuel, Loads, Sales, More. More stacks Store / Books / Rules / Close.

## Out of scope

Auth. You own persistence.
