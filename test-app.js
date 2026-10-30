// Exercise the app's event wiring without requiring a browser or dependencies.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const game = require('./upgrades.js');
const html = fs.readFileSync('index.html', 'utf8');
const nodes = new Map([...html.matchAll(/id="([^"]+)"/g)].map(match => [match[1], {
  value: '', textContent: '', innerHTML: '', hidden: false, disabled: false,
  style: {}, handlers: {}, children: [],
  addEventListener(type, handler) { this.handlers[type] = handler; },
  append(node) { this.children.push(node); },
  replaceChildren() { this.children = []; },
  showModal() { this.open = true; }, close() { this.open = false; }
}]));
const $ = id => { assert.ok(nodes.has(id), `Missing UI element: ${id}`); return nodes.get(id); };
$('quantity').value = 40; $('price').value = 2; $('ads').value = 5;
let mounted, saved, timer;
const context = {
  CookieGame: { ...game, mountUpgrades(container, options) { mounted = options; return { render() {}, clearMessage() {} }; } },
  document: { getElementById: $, querySelector: () => ({}), createElement: () => ({ style: { setProperty() {} } }) },
  localStorage: { getItem: () => null, setItem(key, value) { saved = JSON.parse(value); } },
  window: { matchMedia: () => ({ matches: false }) }, Intl,
  setTimeout(fn) { timer = fn; return 1; }, clearTimeout() { timer = null; }
};
vm.runInNewContext(fs.readFileSync('app.js', 'utf8'), context);
assert.equal(mounted.getState().cash, 100);
mounted.onPurchase('oven');
assert.equal(saved.cash, 40);
assert.equal($('unit-cost').textContent, '$0.40 per cookie');
$('variety').value = 'oatmeal'; $('variety').handlers.change();
assert.equal($('price').value, '1.75');
$('plan').handlers.submit({ preventDefault() {} });
assert.equal(saved.history.length, 1);
assert.equal(saved.history[0].ingredients, 11.2);
assert.equal(saved.history[0].variety, 'oatmeal');
assert.equal($('bake').disabled, true);
assert.ok($('customers').children.length > 0);
$('plan').handlers.submit({ preventDefault() {} });
assert.equal(saved.history.length, 1, 'Animation must not allow duplicate day submissions');
$('skip-rush').onclick();
assert.equal($('customers').children.length, 0);
assert.equal($('bake').disabled, false);
$('confirm-reset').onclick();
assert.equal(saved.cash, 100);
assert.equal(saved.history.length, 0);
assert.equal(game.hasUpgrade(saved, 'oven'), false);
assert.equal($('variety').value, 'classic');
assert.equal(timer, null);
console.log('App wiring checks passed: upgrades, variety budget, day submission, animation guard, skip, and reset.');
