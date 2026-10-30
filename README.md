# Mercy's Cookie Shop Tycoon

Double-click `index.html` to play in a modern web browser. No installation, build tools, or server required. Optional Google Fonts load when online; system fonts work offline.

Start with $100 and run the shop for 30 days. Each morning choose a cookie variety, batch size, cookie price, and advertising spend. The shop costs $5 per day. You must cover the full day's investment before opening. Unsold cookies expire each night.

| Variety | Ingredient cost | Suggested price |
| --- | --- | --- |
| Chocolate Chip | $0.50 | $2.00 |
| Oatmeal Raisin | $0.35 | $1.75 |
| Double Chocolate | $0.75 | $2.75 |
| Lemon Sugar | $0.60 | $2.25 |

Prices remain editable. Buy one-time shop upgrades between days: a Better Oven ($60) lowers ingredient costs by 20%, a Larger Storefront ($100) increases demand by 25%, and Improved Advertising ($80) makes each advertising dollar work like $2. Upgrades last for the season and leave at least $5 in cash. Total profit includes upgrade spending; daily reports show daily operating costs.

Demand responds to price, advertising, the day's forecast, weekends, and gradual neighborhood awareness. The goal is to finish with as much cash as possible. If cash falls below $5, the shop closes early. A new game starts a fresh season after confirmation.

Progress saves automatically in this browser's local storage when available. File-based storage behavior varies by browser; keep using the same browser and file location. The game works without persistence if storage is blocked.

The storefront comes alive with animated customers, purchase bubbles, and a walking bounce. Busier sales mean more visitors, up to a short animation cap. Use Skip Animation to continue immediately; reduced-motion settings are respected.

Existing saves remain compatible and prior batches appear as Chocolate Chip.

To check the simulation and app wiring, run `node test-game.js`, `node test-upgrades.js`, and `node test-app.js`.
