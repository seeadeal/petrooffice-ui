# PetroOffice UI — wire two backends

Drop this folder (or this whole markdown) into Claude. **Do not restyle.** Keep the petrol-teal night palette, IBM Plex, dock chrome, and Floor phone shell exactly.

## What this is

Two products, one UI kit:

| App | Viewport | Chrome | Store hook | Backend you own |
|---|---|---|---|---|
| **PetroOffice** (desk) | `md+` | floating dock | `useOffice` | Office API |
| **Floor** (phone) | `< md` | iOS-style tab bar | `useFloor` | Floor API |

They must **not** share rows. Posting a price on Floor must not change Office.

Demo store: Northline Petroleum, store **#0121 Main Street**, Harrisburg. Manager **Jordan Hale (JH)**. Clock frozen at **Fri, Aug 28 · 2:14 PM**.

## Do this

1. Scaffold TanStack Start + Tailwind v4 + the deps in `package.json`.
2. Copy every `src/**` file as-is.
3. Replace `src/lib/station-store.ts` `commit` / `hydrate` so:
   - `useOffice` talks only to the **Office** backend
   - `useFloor` talks only to the **Floor** backend
4. Keep method names and argument shapes on `StationState`. Every screen already calls them.
5. Seed each backend independently from `src/lib/seed.ts` (same shape, separate databases).

## Store contract (do not rename)

```ts
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

Snapshot fields: `tanks prices deliveries shifts exceptions inventory compliance scheduled priceLog selectedId`.

`hydrateOffice()` / `hydrateFloor()` run once on app mount (`app-shell.tsx`). Point those at `GET` snapshot. Mutations should round-trip a full snapshot (or patch the same fields).

## Visual rules

- Tokens live in `src/styles.css` (`#0c1012` night, `#7dbeb6` petrol, `#f4f0e6` paper).
- No new colors, no extra fonts, no purple, no emoji-as-icons.
- Dock is **desk only**. Floor tab bar is **phone only** (`md:hidden` / `hidden md:contents` in `app-shell.tsx`).
- Tap targets ≥ 44px on phone. No horizontal overflow at 390px.
- Export page prints a paper close packet + tidy CSV (`export-today.ts`).

## Routes

`/ /fuel /deliveries /shifts /inventory /financials /compliance /export /more`

Phone tabs: Today, Fuel, Loads, Sales, More. More stacks Store / Books / Rules / Close.

## Out of scope for the paste

Auth, Neon, Grok preview bridge — omitted on purpose. You wire persistence.
