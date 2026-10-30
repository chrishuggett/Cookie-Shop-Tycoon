(function (root) {
  const game = root.CookieGame || (typeof require === 'function' ? require('./game.js') : null);
  const catalog = Object.freeze([
    Object.freeze({ id: 'oven', name: 'Better oven', icon: '♨', price: 60, description: 'Bake smarter with less waste.', benefit: '20% lower ingredient costs' }),
    Object.freeze({ id: 'storefront', name: 'Larger storefront', icon: '⌂', price: 100, description: 'Make room for more cookie lovers.', benefit: '25% more customer demand' }),
    Object.freeze({ id: 'advertising', name: 'Improved advertising', icon: '✦', price: 80, description: 'Let the neighborhood know your name.', benefit: 'Every ad dollar works like $2' })
  ]);
  const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  const round = n => Math.round((n + Number.EPSILON) * 100) / 100;
  const owned = (state, id) => Array.isArray(state.upgrades) && state.upgrades.includes(id);
  const baseEffects = game.effects || (() => ({ ingredientMultiplier: 1, demandMultiplier: 1, advertisingMultiplier: 1 }));
  game.effects = state => {
    const effects = baseEffects(state);
    return {
      ingredientMultiplier: effects.ingredientMultiplier * (owned(state, 'oven') ? .8 : 1),
      demandMultiplier: effects.demandMultiplier * (owned(state, 'storefront') ? 1.25 : 1),
      advertisingMultiplier: effects.advertisingMultiplier * (owned(state, 'advertising') ? 2 : 1)
    };
  };
  game.upgradeCatalog = catalog;
  game.hasUpgrade = owned;
  game.purchaseUpgrade = function (state, id) {
    const upgrade = catalog.find(item => item.id === id);
    if (!upgrade) throw Error('Choose an available shop upgrade.');
    if (state.history.length >= 30) throw Error('This season is complete. Start a new game to buy upgrades.');
    if (owned(state, id)) throw Error('Your shop already has this upgrade.');
    if (!Number.isFinite(state.cash) || state.cash < upgrade.price + 5) throw Error('Keep at least $5 for opening the shop after buying an upgrade.');
    return {
      ...state,
      cash: round(state.cash - upgrade.price),
      upgrades: [...(Array.isArray(state.upgrades) ? state.upgrades.filter(id => catalog.some(item => item.id === id)) : []), id],
      upgradeSpending: round((Number.isFinite(state.upgradeSpending) ? state.upgradeSpending : 0) + upgrade.price)
    };
  };
  // The host owns state and saving; this widget only requests a purchase.
  game.mountUpgrades = function (container, { getState, onPurchase, isBusy = () => false }) {
    container.classList.add('panel', 'upgrades-panel');
    container.innerHTML = '<div class="section-head"><div><p class="eyebrow">A LITTLE ROOM TO GROW</p><h2>Make it your dream shop</h2></div><span class="upgrade-count"></span></div><p class="upgrade-intro">One-time investments. Benefits last for the rest of your season.</p><div class="upgrade-grid"></div><p class="upgrade-message" role="status"></p><p class="upgrade-note"></p>';
    const grid = container.querySelector('.upgrade-grid');
    const message = container.querySelector('.upgrade-message');
    for (const upgrade of catalog) {
      const card = document.createElement('article');
      card.className = 'upgrade-card';
      card.dataset.upgrade = upgrade.id;
      card.innerHTML = `<span class="upgrade-icon" aria-hidden="true">${upgrade.icon}</span><h3>${upgrade.name}</h3><p>${upgrade.description}</p><strong>${upgrade.benefit}</strong><button class="quiet" type="button"></button>`;
      card.querySelector('button').addEventListener('click', () => {
        if (isBusy()) return;
        try {
          onPurchase(upgrade.id);
          message.textContent = `${upgrade.name} installed! ${upgrade.benefit}.`;
          render();
        } catch (error) { message.textContent = error.message; }
      });
      grid.append(card);
    }
    function render() {
      const state = getState();
      const complete = state.history.length >= 30;
      const busy = isBusy();
      container.querySelector('.upgrade-count').textContent = `${catalog.filter(item => owned(state, item.id)).length} / ${catalog.length} installed`;
      container.querySelector('.upgrade-note').textContent = `Shop investments: ${money(state.upgradeSpending || 0)} · Purchases leave at least $5 for your next opening. Costs are included in total profit.`;
      for (const upgrade of catalog) {
        const card = grid.querySelector(`[data-upgrade="${upgrade.id}"]`);
        const button = card.querySelector('button');
        const installed = owned(state, upgrade.id);
        const affordable = state.cash >= upgrade.price + 5;
        card.classList.toggle('installed', installed);
        button.disabled = installed || complete || busy || !affordable;
        button.textContent = installed ? 'Installed ✓' : complete ? 'Season complete' : busy ? 'Shop is serving…' : !affordable ? `Save up · ${money(upgrade.price)}` : `Upgrade · ${money(upgrade.price)}`;
      }
    }
    render();
    return { render, clearMessage() { message.textContent = ''; } };
  };
  if (typeof module !== 'undefined') module.exports = game;
})(typeof window !== 'undefined' ? window : globalThis);
