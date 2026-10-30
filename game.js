(function (root) {
  const round = n => Math.round((n + Number.EPSILON) * 100) / 100;
  const varieties = [
    { id: 'classic', name: 'Chocolate Chip', cost: .50, suggestedPrice: 2, description: 'The neighborhood favorite. Buttery dough and chocolate chips.' },
    { id: 'oatmeal', name: 'Oatmeal Raisin', cost: .35, suggestedPrice: 1.75, description: 'A cozy, budget-friendly batch with oats and sweet raisins.' },
    { id: 'double-chocolate', name: 'Double Chocolate', cost: .75, suggestedPrice: 2.75, description: 'Rich cocoa dough with a generous helping of chocolate.' },
    { id: 'lemon', name: 'Lemon Sugar', cost: .60, suggestedPrice: 2.25, description: 'Bright lemon zest and a delicate sugar finish.' }
  ];
  function variety(id = 'classic') {
    const selected = varieties.find(item => item.id === id);
    if (!selected) throw Error('Choose a cookie variety from the menu.');
    return selected;
  }
  function ingredientCost(state, varietyId = 'classic') { return round(variety(varietyId).cost * api.effects(state).ingredientMultiplier); }
  const events = [
    { title: 'A lovely day for cookies', detail: 'Normal foot traffic expected.', factor: 1 },
    { title: 'Rain on the window', detail: 'A quieter street today. Expect fewer customers.', factor: .75 },
    { title: 'The neighborhood is buzzing', detail: 'Extra foot traffic! A good day for a bigger batch.', factor: 1.3 },
    { title: 'A cozy cookie kind of day', detail: 'Normal foot traffic expected.', factor: 1 }
  ];
  function fresh() { return { cash: 100, history: [], seed: Math.floor(Math.random() * 1000000) }; }
  function forecast(state) { return events[(state.seed + state.history.length * 7) % events.length]; }
  function play(state, quantity, price, ads, varietyId = 'classic') {
    const selected = variety(varietyId);
    if (state.history.length >= 30) throw Error('Your 30-day season is complete. Start a new game to play again.');
    if (!Number.isInteger(quantity) || quantity < 0 || quantity > 10000 || !Number.isFinite(price) || price < .25 || price > 20 || !Number.isFinite(ads) || ads < 0 || ads > 10000) throw Error('Enter a whole batch from 0–10,000, a price from $0.25–$20, and advertising from $0–$10,000.');
    const ingredients = round(quantity * ingredientCost(state, varietyId)), expenses = round(ingredients + ads + 5);
    if (expenses > state.cash) throw Error('Your investment exceeds your cash. Try a smaller batch or less advertising.');
    const day = state.history.length + 1;
    const effects = api.effects(state);
    const weekend = (day - 1) % 7 >= 5 ? 1.2 : 1;
    const variation = .85 + ((state.seed + day * 137) % 31) / 100;
    const demand = Math.max(0, Math.floor((35 + 8 * Math.sqrt(ads * effects.advertisingMultiplier) + day * .6) * Math.exp(-.65 * (price - selected.suggestedPrice)) * forecast(state).factor * weekend * variation * effects.demandMultiplier));
    const sold = Math.min(quantity, demand), revenue = round(sold * price), profit = round(revenue - expenses);
    const cash = round(state.cash + profit);
    const entry = { day, variety: selected.id, quantity, price, ads, ingredients, expenses, demand, sold, revenue, profit, cash };
    return { ...state, cash, selectedVariety: selected.id, history: [...state.history, entry] };
  }
  const api = { fresh, forecast, play, varieties, ingredientCost, effects: () => ({ ingredientMultiplier: 1, demandMultiplier: 1, advertisingMultiplier: 1 }) };
  if (typeof module !== 'undefined') module.exports = api;
  root.CookieGame = api;
})(typeof window !== 'undefined' ? window : globalThis);
