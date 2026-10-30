(function (root) {
  const round = n => Math.round((n + Number.EPSILON) * 100) / 100;
  const events = [
    { title: 'A lovely day for cookies', detail: 'Normal foot traffic expected.', factor: 1 },
    { title: 'Rain on the window', detail: 'A quieter street today. Expect fewer customers.', factor: .75 },
    { title: 'The neighborhood is buzzing', detail: 'Extra foot traffic! A good day for a bigger batch.', factor: 1.3 },
    { title: 'A cozy cookie kind of day', detail: 'Normal foot traffic expected.', factor: 1 }
  ];
  function fresh() { return { cash: 100, history: [], seed: Math.floor(Math.random() * 1000000) }; }
  function forecast(state) { return events[(state.seed + state.history.length * 7) % events.length]; }
  function play(state, quantity, price, ads) {
    if (state.history.length >= 30) throw Error('Your 30-day season is complete. Start a new game to play again.');
    if (!Number.isInteger(quantity) || quantity < 0 || quantity > 10000 || !Number.isFinite(price) || price < .25 || price > 20 || !Number.isFinite(ads) || ads < 0 || ads > 10000) throw Error('Enter a whole batch from 0–10,000, a price from $0.25–$20, and advertising from $0–$10,000.');
    const ingredients = round(quantity * .5), expenses = round(ingredients + ads + 5);
    if (expenses > state.cash) throw Error('Your investment exceeds your cash. Try a smaller batch or less advertising.');
    const day = state.history.length + 1;
    const weekend = (day - 1) % 7 >= 5 ? 1.2 : 1;
    const variation = .85 + ((state.seed + day * 137) % 31) / 100;
    const demand = Math.max(0, Math.floor((35 + 8 * Math.sqrt(ads) + day * .6) * Math.exp(-.65 * (price - 2)) * forecast(state).factor * weekend * variation));
    const sold = Math.min(quantity, demand), revenue = round(sold * price), profit = round(revenue - expenses);
    const cash = round(state.cash + profit);
    const entry = { day, quantity, price, ads, ingredients, expenses, demand, sold, revenue, profit, cash };
    return { ...state, cash, history: [...state.history, entry] };
  }
  const api = { fresh, forecast, play };
  if (typeof module !== 'undefined') module.exports = api;
  root.CookieGame = api;
})(typeof window !== 'undefined' ? window : globalThis);
