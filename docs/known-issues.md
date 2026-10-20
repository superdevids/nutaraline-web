# DevTools "The children should not have changed if we pass in the same set."

## Status
Open / suspected false positive — evidence-based, see below.

## Report
```
Next.js version: 16.4.2 (Turbopack)
Error: The children should not have changed if we pass in the same set.
    at updateFiberRecursively (chrome-extension://fmkadmapgofadopljbjfkapdkoienihi/build/installHook.js:1:114434)
    at updateVirtualChildrenRecursively (...)
    at updateChildrenRecursively (...)
    ... (deep recursion, no application frames)
```

## Findings

1. The string exists **only** in the React DevTools extension bundle, not in
   `next/dist`, `react-dom`, or the project source. Confirmed against the
   installed extension copy:
   `...\Brave-Browser\User Data\Default\Extensions\fmkadmapgofadopljbjfkapdkoienihi\8.0.0_0\build\installHook.js`
   — the literal is at byte offset 114473, matching the reported column 114434
   (V8 columns are 0-based).

2. The throwing site is this branch of `updateFiberRecursively`:

   ```js
   const e = updateChildrenRecursively(n.child, r.child, !1);
   if ((e & yt) !== mt)
     throw new Error("The children should not have changed if we pass in the same set.");
   ```

   It only runs when `n.child === r.child` (identical child set identity), i.e.
   when React skips rendering a subtree. React itself does not warn here; only
   the devtools' own tree model disagrees.

3. A clean-profile Brave (headless, real `brave.exe`, **React DevTools
   installed and enabled**) was driven over CDP across `/monitoring`,
   `/models`, `/notification`, `/topup`, `/balance`, `/docs` plus contact-panel
   toggles, scrolling, and an id/en language switch: 31 console lines, zero
   exceptions. The message did not reproduce.

4. Version context: project uses `react-dom` 19.3.0 (via Next 16.4.2);
   devtools 8.0.0. This code path is the Suspense/partial-hydration
   reconciliation walker (`suspenseNode`, `isHiddenOffscreen`,
   `isSuspendedOffscreen`), which was rewritten upstream around React 19.2/19.3.

## Assessment
Likely a false positive in the 8.0.0 extension when it walks
Suspense-boundary subtrees that were streamed and partially hydrated (the root
layout does wrap header/footer routes in `<Suspense>`). It has no effect on
application behaviour (verified: hydration, chart, counters, forms all work).

## Next steps if it blocks work
1. Reproduce reliably and capture the Fiber tree at throw time (devtools
   `--verbose` build, or `performance.measure` on commit).
2. Try a newer devtools build and note whether the message persists.
3. Only then change app code (most likely candidate: make the Suspense
   fallbacks in `app/layout.tsx` structurally identical to the resolved
   header/footer trees).
