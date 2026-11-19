# Aurum Savings — React

React 18.3.1 + Vite conversion of the static pages in `sample2/`.

| Original                | Route                   | Component                             |
| ----------------------- | ----------------------- | ------------------------------------- |
| `sample2/index.html`    | `/`                     | `src/pages/SignIn/SignInPage.jsx`     |
| `sample2/accounts.html` | `/accounts`             | `src/pages/Accounts/AccountsPage.jsx` |
| `sample2/history.html`  | `/history?account=<id>` | `src/pages/History/HistoryPage.jsx`   |
| _(new)_                 | `/rewards?spinner=<id>` | `src/pages/Rewards/RewardsPage.jsx`   |

### Daily rewards (`/rewards`)

Eight daily reward spinners, each with one free turn per day (reset at local midnight):
Prize Wheel (`wheel`), Odds Needle (`needle`), Multiplier Wheel (`double`), Vault Dial
(`dial`), Coin Reels (`slots`), Lucky Grid (`grid`), Prize Ticker (`ticker`) and Lucky Coin
(`coin`). Prize tables and odds live in `src/data/rewards.js`; the odds shown beside each
spinner are computed from the same weights the draw uses. Turns, winnings and the streak
are kept in the `rewards` Redux slice and saved to `localStorage`
(`src/store/rewardsSlice.js`). The prize is drawn in the browser for this demo; a real
deployment should draw it on the server and let the spinner only animate to it.

## Run

Runs on **Node 12.22** (see `.nvmrc`), so the build tools are the last versions that
support it: Vite 2.9, Tailwind CSS 3.2, ESLint 8.57 and Prettier 2.8. Don't upgrade
those past their current major/minor (`npm outdated` will suggest it) unless the
project moves to a newer Node. That includes `eslint-plugin-react-refresh`, pinned to
0.4.3 (later versions use syntax Node 12 can't parse).

Install with **`npm ci`**, not `npm install`. On Windows, Node 12's npm 6 `npm install`
often fails with `ENOENT ... rename ... .DELETE` (it moves packages out of a
`.staging` folder and loses a race, often with antivirus); `npm ci` unpacks straight
into `node_modules` and installs from `package-lock.json` reliably. When adding a
package with `npm install <pkg>` hits that error, run the same command again, then
`npm ci`.

`npm audit` reports issues in Vite 2 / esbuild 0.14 / Rollup 2 (mostly the local dev
server). Their fixes need Vite 5+, i.e. Node 18+, so don't run `npm audit fix --force`.
Don't start the dev server with `--host`, and stop it when you're not using it.

```bash
npm ci
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
npm run preview  # serve the build
npm run lint     # ESLint (lint:fix to auto-fix)
npm run format   # Prettier (format:check to only check)
```

## Libraries

| Need             | Package(s)                                    | Notes                                                                                                                   |
| ---------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| State            | `@reduxjs/toolkit`, `react-redux`             | Store in `src/store/`, `<Provider>` in `main.jsx`                                                                       |
| Charts           | `chart.js`, `react-chartjs-2`                 | Register what you use: `ChartJS.register(...)` or `import 'chart.js/auto'`                                              |
| Routing          | `react-router-dom` (React Router 7)           |                                                                                                                         |
| Styling          | `tailwindcss` 3.2 (via PostCSS)               | Preflight reset off (`tailwind.config.cjs`), so the converted pages look unchanged                                      |
| Particles        | `@tsparticles/react` 3, `@tsparticles/slim` 3 | Successor to the deprecated `react-particles`; call `initParticlesEngine(loadSlim)` once. v4's installer needs Node 14+ |
| Realtime         | `socket.io-client`                            |                                                                                                                         |
| Custom scrollbar | `react-perfect-scrollbar`                     | Import `react-perfect-scrollbar/dist/css/styles.css`                                                                    |
| Dates            | `luxon`                                       |                                                                                                                         |
| Infinite scroll  | `react-infinite-scroll-component`             |                                                                                                                         |
| Pagination       | `react-paginate`                              |                                                                                                                         |
| Hooks            | `ahooks`                                      |                                                                                                                         |
| Tooling          | `eslint` 8 (flat config), `prettier` 2        | `eslint-config-prettier` turns off rules that clash with Prettier                                                       |

The page stylesheets scope their rules under the page root class (two-class selectors),
so they win over single-class Tailwind utilities if both set the same property.

## Layout

```
src/
  main.jsx, App.jsx          router setup (react-router-dom)
  data/accounts.js           vault data shared by the accounts and history pages
  data/rewards.js            daily reward spinners: prize tables, odds, catalogue
  store/                     Redux Toolkit store, accounts slice, rewards slice (localStorage)
  components/                BrandMark, SafeIcon, VaultLayout (spine sidebar)
  hooks/                     useTimers (auto-cleared timers), usePatchState, useDocumentTitle
  pages/SignIn/              sign-in + enrolment flow, vault door stage, canvas background
  pages/Accounts/            vault wall
  pages/History/             ledger, filters, sparkline
  pages/Rewards/             daily rewards page; spinners/ holds the eight spinner components
  styles/global.css          base rules shared by all pages
```

Each page's CSS is scoped under its root class (`.signin-page`, `.accounts-page`,
`.history-page`, `.rewards-page`) so the three original stylesheets can't collide in one app.

Uses `BrowserRouter`, so a production host must serve `index.html` for unknown paths
(SPA fallback). Switch to `HashRouter` in `src/main.jsx` if that isn't possible.
