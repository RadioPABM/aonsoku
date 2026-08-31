# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

`radioPABM` — a fork of [Aonsoku](https://github.com/victoralvesf/aonsoku), a
web + Electron client for Subsonic/Navidrome servers, branded and pre-configured
for the radioPABM Navidrome instance. Upstream is periodically merged in
(`update: sync with latest aonsoku 0.14`), so **keep diffs against upstream small
and localized** — every gratuitous refactor makes the next sync harder.

Package name: `radiopabm`. Product name: `radioPABM`. Current branch work:
`pabm-branding`.

## Commands

```bash
pnpm install            # pnpm is the package manager (do not use npm/yarn)
pnpm dev                # web dev server (vite)
pnpm build              # tsc && vite build (web)
pnpm electron:dev       # electron dev with watch
pnpm electron:build     # electron build
pnpm android:sync       # web build -> android/ (Capacitor)
pnpm android:run        # run on a device or emulator
pnpm android:build      # debug APK (android:build:release for a release one)
pnpm lint               # biome lint
pnpm lint:check         # biome check --write  (lint + format, autofix)
pnpm test               # cypress run --component
pnpm cy:open            # cypress interactive
```

Type-checking happens via `pnpm build` (`tsc`); there is no separate typecheck
script. Husky runs on commit — run `pnpm lint:check` before committing.

## Code style (enforced by Biome, `biome.json`)

- Single quotes, **no semicolons**, 2-space indent, line width 80, LF.
- Imports use the `@/` alias for `src/` (`@/app/components/...`), `cy/` for
  cypress. Biome organizes imports — do not hand-sort.
- Function components declared as `export function Foo()`, not arrow consts.
- Prefer `cn()` from `@/lib/utils` for conditional classes; `clsx` is also used
  in older files. Match the file you are editing.
- Heavy components are wrapped with `memo()` at module scope
  (`const MemoHeader = memo(Header)`) — follow that pattern in layout files.

## Architecture

```
src/
  main.tsx            entry: QueryClientProvider -> App
  App.tsx             observers + RouterProvider (see "Mobile" below)
  api/                httpClient (Subsonic auth/urls), podcastClient
  service/            Subsonic endpoint wrappers (albums, songs, playlists, ...)
  queries/            TanStack Query hooks built on service/
  store/              Zustand stores (player, app, theme, lang, playlists, radios)
  routes/             createHashRouter config, loaders, ROUTES constants
  app/layout/         base.tsx (shell), header.tsx, main.tsx (outlet), sidebar.tsx (nav items)
  app/pages/          route pages
  app/components/     feature components + components/ui (shadcn-style primitives)
  app/hooks/          use-mobile, use-app-window, use-audio-hotkeys, ...
  i18n/locales/       translations
  utils/              desktop/browser detection, formatting helpers
electron/             Electron main + preload
android/              Capacitor native project (Android)
```

Data flow: component → Zustand action or TanStack Query hook → `service/*` →
`api/httpClient` → Subsonic server. Query cache is the source of truth for
server data; Zustand holds player/UI state.

Routing is a **hash router** (`createHashRouter`) because the app also runs from
`file://` in Electron. All route strings live in `src/routes/routesList.ts` —
never hardcode paths.

### Player state

`src/store/player.store.ts` is the hub. Use the selector hooks it exports
(`usePlayerActions`, `usePlayerIsPlaying`, `usePlayerSonglist`,
`usePlayerMediaType`, `useMainDrawerState`, `usePlayerFullscreen`,
`useSongColor`, ...) rather than subscribing to the whole store — the player
re-renders on every timeupdate otherwise.

Three media types share one player: `isSong | isRadio | isPodcast`, each with its
own `<audio>` ref inside `app/components/player/player.tsx`.

### Layout shell

`app/layout/base.tsx` composes: `MainSidebarProvider` → `Header` (fixed, height
`--header-height`) + `AppSidebar` + `MainSidebarInset` (`MainRoutes` outlet) +
`Player` (fixed footer, height `--player-height`), plus the drawers
(`MainDrawerPage` = queue/lyrics, `FullscreenMode` = big player) and dialogs.

Heights are CSS custom properties in `src/index.css` (`--header-height`,
`--player-height`, `--content-height`, ...) and exposed to Tailwind as spacing
tokens (`h-header`, `pb-player`, `h-content`). **Change the CSS variable, not the
individual utilities**, when adjusting the shell.

`app/components/ui/main-sidebar.tsx` is a vendored shadcn sidebar: on desktop a
collapsible rail (state persisted in `localStorage` under `main_sidebar_state`,
toggled with Ctrl/Cmd+B); on mobile it renders as a full-width `Sheet`, driven by
`openMobile` / `setOpenMobile` from `useMainSidebar()`.

### Mobile

`useIsMobile()` (`src/app/hooks/use-mobile.tsx`) is the single source of truth:
`window.innerWidth < 768`, matchMedia-backed, resolved on the first render. Use
it; do not add new device detection and do not sniff user agents.

`app/layout/base.tsx` picks `MobileShell` (`app/layout/mobile/base.tsx`) or
`DesktopShell` from that hook. `Player` and the shared dialogs are rendered
*outside* that branch so crossing the breakpoint does not remount the audio
elements; the desktop player UI hides itself on mobile (`player.tsx`) while its
`<audio>` tags stay mounted, and the mobile UI is `MobileMiniPlayer` +
`MobileBottomNav` in a fixed bottom bar, with `MobileFullscreenMode`
(`app/components/fullscreen/mobile-page.tsx`) as the now-playing screen — it
reuses the desktop fullscreen parts (backdrop, controls, progress, like, lyrics)
and the queue list. Mobile shell heights are the `--mobile-*` CSS variables in
`src/index.css` (`h-mobile-header`, `pb-mobile-player`, ...).

### Platform detection

`@/utils/desktop` → `isDesktop()` (Electron), `isLinux/isMacOS/isWindows`;
`@/utils/browser` → `hasPiPSupport`, `blockFeatures()`. The header and player pad
themselves for native window controls on Windows/Linux/macOS — keep those guards
when editing.

### Android

The Android app is the same web build wrapped by Capacitor (`capacitor.config.ts`,
`android/`). `cap sync` copies `dist/` into `android/app/src/main/assets/public`,
which is gitignored — never edit it, edit the web app. The version and the
release signing config in `android/app/build.gradle` are derived from
`package.json` and from `ANDROID_KEYSTORE_*` environment variables.

`CapacitorHttp` is enabled, so `fetch`/XHR go through the native HTTP layer and
do not depend on the server sending CORS headers for the `https://localhost`
origin the WebView uses. Audio streams through `<audio>` elements and is not
affected by it.

## Configuration

Runtime config comes from env vars baked at build/serve time (see `.env.example`
and `env-config.js.template` for the Docker/nginx path): `SERVER_URL`,
`HIDE_SERVER`, `APP_USER`/`APP_PASSWORD` (auto-login), `APP_AUTH_TYPE`,
`SERVER_TYPE`, `APP_THEME`, `HIDE_RADIOS_SECTION`, `IMAGE_CACHE_ENABLED`,
`DISABLE_DOWNLOADS`, `DISABLE_LRCLIB`.

## Conventions worth respecting

- **i18n**: user-facing strings go through `useTranslation()` and
  `src/i18n/locales/*`. Never inline literal UI text.
- **Icons**: `lucide-react`, memoized at module scope where reused.
- **Lists**: large lists use `@tanstack/react-virtual` / `@virtual-grid/react`.
  Do not replace with plain `.map()` over thousands of rows.
- **Tests**: Cypress component tests live next to components as `*.cy.tsx` and
  are excluded from Biome.
- Fork-specific removals exist (e.g. LovedSongs replaced by native favorites) —
  check `git log` before "restoring" something that looks missing.
