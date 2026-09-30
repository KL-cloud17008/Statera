# Frontend review — 30 September 2026

Base: `4aa7d1bf9d5e95138f90786f21a4a57b3c0faeaa`.

This is a source review and a draft implementation. The execution environment was unavailable. Lint, tests, typecheck, production build, authenticated browser checks and deployment verification have **not** been run. Do not treat this branch as release-ready.

## Scope reviewed

| Surface | Source findings and draft changes |
| --- | --- |
| Dashboard | Existing active-session action remains primary. Add weight average, total change, weekly pace and goal conversions; move Weight ahead of Steps. Distinguish unlogged dates from recorded zero in the seven-day spark chart. |
| Desktop/mobile navigation | Preserve one sidebar or one mobile header/sheet. Add a keyboard skip link. Preserve Training label and direct Resume link to /workout. |
| Training preview and active session | Review preview, preparation, pain gates, logger, prior performance, conflict/draft recovery and rest timer. Add exercise jumping within existing controls, paired-block round context, next set context and keyboard Next/Done hints. Do not change save/draft identities or advancement ordering. |
| Custom sessions and templates | Improve numeric entry/control widths on phones. Disable starting an empty selection. Report interrupted start requests. Template storage remains browser-local. |
| Full plan | Indicate the current day in the existing day index. Keep progression, quad work, schedule and protective guidance unchanged. |
| Training history | Show recent sessions first with Show more; fold exercise links into an accessible disclosure. Clear a day filter when changing months. |
| Exercise history | Describe the existing metric accurately as Highest-volume set; use a two-column phone summary and include year on dated sections. |
| Mobility | Add routine anchors, wrap the summary on narrow phones, enlarge mode and disclosure controls; expose checked state on the existing movement-name buttons. Completion logging and guidance are unchanged. |
| Flexibility & Balance | Add section anchors to the existing reference content. Preserve its separation from Mobility logging. |
| Steps | Preserve entry, charts, streak, goal days, best day and history. Make heatmap totals available on tap/keyboard, distinguish not-logged/zero/future cells, shorten history with Show more, and correct the comparison label to today versus seven days ago. No missing-log warnings added. |
| Weight | Preserve canonical lb and kg/stone conversions. Label the user-selected trajectory Target path and distinguish it from an estimate. Add a chart legend and an empty-period escape to all history; remove a backward target path. Lead progress review with weekly pace and remaining weight; identify estimates as changeable. Paginate rendered history without changing calculations. |
| Weight CSV import | Replace card chrome with ledger sections, remove unsupported drag-and-drop copy and fake 66% progress, expose parsed dates and row errors, use a responsive preview and Show more, fix nested interactive Back markup, and handle file-read errors. Import semantics are unchanged. |
| Settings | Add section anchors, describe the goal date as optional, preserve canonical units and backup preview/confirmation. Keep import/clear dialogs open while a destructive request is pending. |
| Authentication | Use dynamic viewport height, disable fields/mode switching while submitting, and show the pending action in text. |
| Shared UI | Keep the existing typography, colours and frame animations. Improve rail wrapping and anchored scroll offsets, enlarge chart-period controls, and constrain dialogs to the available viewport with scrolling. |
| Loading/errors/PWA | Read existing skeleton, error boundary and service-worker registration. Preserve explicit update reload and existing retry behaviour. |
| Legacy routes | /dashboard redirects to /; the nutrition routes redirect to /. Do not restore removed product areas. |

## Required release checks

Run in the user's existing checkout, after inspecting its current branch and dirty files:

```text
npm run lint
npm test
npm run typecheck
npm run build
```

Resolve every regression introduced by this branch before merging.

## Required rendered and interaction checks

Use synthetic or isolated data for mutations; never overwrite production history as a fixture.

- Check all primary routes and /workout/plan, /workout/history, an exercise history and /weight/import at 320, 375, 390, 768, 1280 and 1440 px; also check 200% browser zoom.
- Check no horizontal overflow, clipping of values/conversions, or header occlusion after anchor navigation. Keep current set fields and Save immediately reachable with the phone keyboard open.
- Verify Resume opens the existing session without starting another; Start still calls its server action.
- Enter a draft, jump exercises, return and reload. Verify values remain; save once, retry a failed save, correct a saved set, and resolve a two-tab conflict.
- Verify equal/unequal supersets and Thursday's triset retain correct advancement and rest timing. Verify current-round and next-set captions describe the resulting order.
- Verify history Show more exposes every fetched record; new-low calculation still uses the full weight history; date filters and inline edits work.
- Verify logged zero, unlogged and future heatmap cells; inspect exact totals with pointer, keyboard and a screen reader.
- Verify sparse/empty weight windows, all-history view, lb/kg/stone tooltips, reached goal and expired/absent/future target date. Target path must not be described as a prediction.
- Preview valid/invalid and large CSV files on a phone; inspect every parsed field and error; check import success/failure without a fabricated progress percentage.
- Verify tall settings/import dialogs fit a short phone viewport, scroll to their actions, retain focus and stay open during pending destructive requests.
- Verify login pending/errors, primary navigation, keyboard skip link, loading/error retry and reduced-motion preferences.
- Verify existing workout plan and completed session data are unchanged.

## Release status

Draft branch only. No changes to main, Supabase or live production were made during this review. Only merge after the checks above pass, then verify the exact resulting origin/main commit has a Vercel production deployment marked Ready.
