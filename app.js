const $ = id => document.getElementById(id);
const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
const key = 'mercys-cookie-shop-v1';
let state = CookieGame.fresh();
let rushTimer;
let rushing = false;
function finishRush() {
  clearTimeout(rushTimer);
  rushing = false;
  $('customers').replaceChildren();
  $('skip-rush').hidden = true;
  const last = state.history.at(-1);
  $('shop-status').textContent = last ? `Day ${last.day} closed · ${last.sold} cookies sold` : 'Ready for the morning rush';
  $('shop-caption').textContent = last ? 'Another day in the neighborhood. Your closing count is below.' : 'Your first customers are just around the corner.';
  render();
}
function animateCustomers(entry) {
  clearTimeout(rushTimer);
  $('customers').replaceChildren();
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const count = Math.min(18, Math.ceil(entry.sold / 3));
  $('shop-status').textContent = entry.sold ? `Day ${entry.day} · Here come the cookie lovers!` : `Day ${entry.day} · A quiet day at the shop`;
  $('shop-caption').textContent = entry.sold ? `${entry.sold} cookies sold today · Each visitor represents a few happy cookie purchases.` : 'No cookies sold today. Try adjusting your batch, price, or advertising.';
  if (reduced || count === 0) {
    $('shop-status').textContent = `Day ${entry.day} closed · ${entry.sold} cookies sold`;
    return;
  }
  rushing = true;
  upgradeUI.render();
  $('bake').disabled = true;
  $('bake').textContent = 'Customers are visiting…';
  $('skip-rush').hidden = false;
  const colors = ['#6689a1', '#c58165', '#789262', '#b89a53', '#9b7dba'];
  for (let i = 0; i < count; i++) {
    const customer = document.createElement('div');
    customer.className = 'customer';
    customer.style.setProperty('--delay', `${i * .24}s`);
    customer.style.setProperty('--shirt', colors[i % colors.length]);
    customer.style.setProperty('--skin', ['#e9b88e', '#a16c49', '#c88f65'][i % 3]);
    customer.innerHTML = '<div class="person"><span class="person-head"></span><span class="person-body"></span><span class="person-legs"></span><span class="purchase">🍪</span><span class="purchase-pop">♥ + 🍪</span></div>';
    $('customers').append(customer);
  }
  rushTimer = setTimeout(finishRush, 3600 + (count - 1) * 240);
}
try { const saved = JSON.parse(localStorage.getItem(key)); if (saved && Number.isFinite(saved.cash) && Number.isInteger(saved.seed) && Array.isArray(saved.history) && saved.history.length <= 30 && saved.history.every(r => ['day','quantity','sold','revenue','expenses','profit','cash'].every(k => Number.isFinite(r[k])))) state = saved; } catch {}
function save() { try { localStorage.setItem(key, JSON.stringify(state)); } catch { document.querySelector('footer span').textContent = 'Browser storage unavailable · Keep this tab open to keep playing'; } }
const upgradeUI = CookieGame.mountUpgrades($('upgrades'), {
  getState: () => state,
  isBusy: () => rushing,
  onPurchase: id => { state = CookieGame.purchaseUpgrade(state, id); save(); render(); }
});
function selectedVariety() { return CookieGame.varieties.find(item => item.id === $('variety').value) || CookieGame.varieties[0]; }
function varietyName(id) { return (CookieGame.varieties.find(item => item.id === id) || CookieGame.varieties[0]).name; }
function budget() {
  const selected = selectedVariety();
  const unitCost = CookieGame.ingredientCost(state, selected.id);
  $('unit-cost').textContent = money(unitCost) + ' per cookie';
  $('suggested-price').textContent = 'Sweet spot: around ' + money(selected.suggestedPrice);
  $('variety-description').textContent = selected.description;
  const ingredients = Number($('quantity').value) * unitCost, ads = Number($('ads').value);
  $('ingredients').textContent = money(ingredients); $('ad-cost').textContent = money(ads); $('investment').textContent = money(ingredients + ads + 5);
}
function render() {
  const count = state.history.length, complete = count === 30, broke = state.cash < 5;
  $('day-label').textContent = complete ? '30 OF 30 DAYS COMPLETE' : `DAY ${count + 1} OF 30`;
  $('day').textContent = complete ? 'Season complete!' : count === 0 ? 'Opening day' : `${30 - count} days to grow`;
  $('cash').textContent = money(state.cash); $('total-profit').textContent = money(state.cash - 100);
  $('sold-total').textContent = `${state.history.reduce((s,r) => s + r.sold, 0)} cookies sold so far`;
  $('progress').style.width = `${count / 30 * 100}%`;
  $('weekday').textContent = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'][count % 7].toUpperCase();
  const forecast = CookieGame.forecast(state); $('weather').textContent = forecast.title; $('forecast').textContent = forecast.detail + (count % 7 >= 5 ? ' Weekend shoppers are out, too.' : '');
  $('bake').disabled = complete || broke;
  $('bake').textContent = complete ? 'Season complete ✓' : broke ? 'Shop closed · Start a new game' : 'Open shop & bake →';
  for (const id of ['variety','quantity','price','ads']) $(id).disabled = complete || broke;
  $('journal-count').textContent = `${count} ${count === 1 ? 'day' : 'days'} in business`;
  if (count) {
    const r = state.history[count - 1];
    $('empty').hidden = true; $('report').hidden = false;
    $('result-title').textContent = complete ? 'That’s a wrap, baker!' : broke ? 'The oven has cooled.' : `Day ${count}: fresh out of the oven.`;
    const message = complete ? `Thirty days, countless crumbs. You finished with ${money(state.cash)} and ${money(state.cash - 100)} in total profit.` : broke ? 'There isn’t enough cash for the $5 daily shop expenses. Start fresh and try a new strategy.' : r.sold === r.quantity && r.quantity > 0 ? 'Sold out! Your cookies were the talk of the block.' : r.profit >= 0 ? 'A sweet day of business. Keep that momentum going.' : 'Every baker has a tough batch. Adjust your plan for tomorrow.';
    $('report').innerHTML = `<div class="result-banner">${message}</div><div class="result-grid"><div><span>COOKIES SOLD</span><strong>${r.sold}<small> / ${r.quantity}</small></strong></div><div><span>REVENUE</span><strong>${money(r.revenue)}</strong></div><div><span>EXPENSES</span><strong>${money(r.expenses)}</strong></div><div><span>DAILY PROFIT</span><strong class="${r.profit < 0 ? 'negative' : 'positive'}">${money(r.profit)}</strong></div></div><div class="cash-result"><span>Cash at closing</span><strong>${money(r.cash)}</strong></div><p class="report-note">${varietyName(r.variety)} · ${r.quantity - r.sold} unsold cookies · Ingredients ${money(r.ingredients)} + ads ${money(r.ads)} + shop expenses $5.00</p>`;
    $('history').innerHTML = [...state.history].reverse().map(r => `<tr><td>${r.day.toString().padStart(2,'0')}</td><td>${varietyName(r.variety)}</td><td>${r.quantity} / <b>${r.sold}</b></td><td>${money(r.revenue)}</td><td>${money(r.expenses)}</td><td class="${r.profit < 0 ? 'negative' : 'positive'}">${money(r.profit)}</td><td>${money(r.cash)}</td></tr>`).join('');
  } else { $('empty').hidden = false; $('report').hidden = true; $('result-title').textContent = 'Your story starts here.'; $('history').innerHTML = '<tr><td colspan="7" class="empty-row">A fresh page for your cookie shop adventure.</td></tr>'; }
  budget();
  upgradeUI.render();
}
$('variety').innerHTML = CookieGame.varieties.map(item => '<option value="' + item.id + '">' + item.name + ' · ' + money(item.cost) + ' to bake</option>').join('');
$('variety').value = CookieGame.varieties.some(item => item.id === state.selectedVariety) ? state.selectedVariety : 'classic';
if (state.selectedVariety) $('price').value = selectedVariety().suggestedPrice.toFixed(2);
$('variety').addEventListener('change', () => { $('price').value = selectedVariety().suggestedPrice.toFixed(2); budget(); });
$('plan').addEventListener('input', budget);
$('plan').addEventListener('submit', event => { event.preventDefault(); if (rushing) return; try { state = CookieGame.play(state, Number($('quantity').value), Number($('price').value), Number($('ads').value), $('variety').value); $('error').textContent = ''; save(); render(); animateCustomers(state.history.at(-1)); } catch (error) { $('error').textContent = error.message; } });
$('skip-rush').onclick = finishRush;
$('restart').onclick = () => $('reset-dialog').showModal();
$('cancel-reset').onclick = () => $('reset-dialog').close();
$('confirm-reset').onclick = () => { state = CookieGame.fresh(); upgradeUI.clearMessage(); finishRush(); $('variety').value = 'classic'; $('quantity').value = 40; $('price').value = '2.00'; $('ads').value = '5.00'; $('error').textContent = ''; save(); render(); $('reset-dialog').close(); };
render();
