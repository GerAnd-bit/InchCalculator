require('./history-store.js');
const { createHistoryStore, MAX_ENTRIES } = global.InchHistory;
function same(actual, expected, name) { if (actual !== expected) throw new Error(`${name}: expected ${expected}, got ${actual}`); }
function memoryStorage() { const data = new Map(); return { getItem: key => data.get(key) || null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) }; }
const storage = memoryStorage();
const store = createHistoryStore(storage);
const entry = { id: 'one', expression: '5′ 7 1/2″ + 2′ 4″', result: '7′ 11 1/2″', tokens: ['5′ 7 1/2″', '+', '2′ 4″'] };
same(store.add(entry).length, 1, 'adds completed calculation');
same(createHistoryStore(storage).list()[0].expression, entry.expression, 'persists after reload');
same(store.add(entry).length, 1, 'prevents duplicate event');
same(store.list()[0].tokens.join(''), entry.tokens.join(''), 'stores tokens for restore');
for (let i = 0; i < MAX_ENTRIES + 3; i++) store.add({ ...entry, id: `id-${i}` });
same(store.list().length, MAX_ENTRIES, 'caps history size');
store.clear();
same(store.list().length, 0, 'clears history');
const blockedStore = createHistoryStore({ getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); }, removeItem: () => { throw new Error('blocked'); } });
same(blockedStore.list().length, 0, 'handles blocked storage');
same(blockedStore.add(entry).length, 1, 'continues when storage write fails');
console.log('All history tests passed.');
