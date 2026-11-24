(function () {
  const expression = document.querySelector('#expression');
  const result = document.querySelector('#result');
  const total = document.querySelector('#total-inches');
  const copyLabel = document.querySelector('#copy-label');
  const historyPanel = document.querySelector('#history-panel');
  const historyToggle = document.querySelector('#history-toggle');
  const historyList = document.querySelector('#history-list');
  const memoryStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
  let historyStore;
  try { historyStore = InchHistory.createHistoryStore(window.localStorage); } catch { historyStore = InchHistory.createHistoryStore(memoryStorage); }
  let tokens = [];

  const joinTokens = () => tokens.join('').replace(/\s+([+−×÷])/g, ' $1 ').trim();
  function render() {
    const readable = joinTokens();
    expression.textContent = readable || '0″';
    const value = InchCalc.calculate(tokens);
    if (Number.isFinite(value)) { result.textContent = InchCalc.formatFeetInches(value); total.textContent = InchCalc.formatTotalInches(value); }
    else { result.textContent = '—'; total.textContent = 'Complete the measurement'; }
  }
  function push(token) {
    if (['+', '−', '×', '÷'].includes(token)) {
      if (!tokens.length || ['+', '−', '×', '÷'].includes(tokens.at(-1))) return;
      tokens.push(token);
    } else tokens.push(token);
    render();
  }
  function copyText(text, label) {
    if (!navigator.clipboard?.writeText) { if (label) label.textContent = 'Unavailable'; return; }
    navigator.clipboard.writeText(text).then(() => {
      if (!label) return;
      const original = label.textContent;
      label.textContent = 'Copied';
      setTimeout(() => label.textContent = original, 1600);
    }).catch(() => { if (label) label.textContent = 'Unavailable'; });
  }
  function renderHistory() {
    const entries = historyStore.list();
    historyList.replaceChildren();
    if (!entries.length) {
      const empty = document.createElement('p');
      empty.className = 'history-empty';
      empty.textContent = 'No completed calculations yet.';
      historyList.append(empty);
      return;
    }
    for (const entry of entries) {
      const item = document.createElement('article');
      item.className = 'history-entry';
      const restore = document.createElement('button');
      restore.className = 'history-restore';
      restore.type = 'button';
      restore.innerHTML = `<span class="history-expression"></span><strong></strong>`;
      restore.querySelector('.history-expression').textContent = entry.expression;
      restore.querySelector('strong').textContent = entry.result;
      restore.addEventListener('click', () => { tokens = [...entry.tokens]; render(); closeHistory(); });
      const copy = document.createElement('button');
      copy.className = 'history-copy';
      copy.type = 'button';
      copy.textContent = 'Copy';
      copy.addEventListener('click', () => copyText(entry.result, copy));
      item.append(restore, copy);
      historyList.append(item);
    }
  }
  function openHistory() { renderHistory(); historyPanel.hidden = false; historyPanel.setAttribute('aria-hidden', 'false'); historyToggle.setAttribute('aria-expanded', 'true'); }
  function closeHistory() { historyPanel.hidden = true; historyPanel.setAttribute('aria-hidden', 'true'); historyToggle.setAttribute('aria-expanded', 'false'); }
  function saveCompletedCalculation(value) {
    if (!tokens.some(token => token === '+' || token === '−')) return;
    const expressionText = joinTokens();
    historyStore.add({ id: `${Date.now()}-${expressionText}`, expression: expressionText, result: InchCalc.formatFeetInches(value), tokens: [...tokens] });
  }
  document.querySelectorAll('[data-token]').forEach(button => button.addEventListener('click', () => push(button.dataset.token)));
  document.querySelectorAll('[data-fraction]').forEach(button => button.addEventListener('click', () => push(` ${button.dataset.fraction}″`)));
  document.querySelectorAll('[data-action="clear"]').forEach(button => button.addEventListener('click', () => { tokens = []; render(); }));
  document.querySelector('[data-action="backspace"]').addEventListener('click', () => { tokens.pop(); render(); });
  document.querySelector('[data-action="equals"]').addEventListener('click', () => {
    const value = InchCalc.calculate(tokens); if (!Number.isFinite(value)) return;
    saveCompletedCalculation(value);
    tokens = [InchCalc.formatFeetInches(value)]; render();
  });
  document.querySelector('#copy').addEventListener('click', async () => {
    const value = InchCalc.calculate(tokens); if (!Number.isFinite(value)) return;
    const text = `${InchCalc.formatFeetInches(value)} (${InchCalc.formatTotalInches(value)})`;
    copyText(text, copyLabel);
  });
  document.querySelector('#clear').addEventListener('click', () => { tokens = []; render(); });
  historyToggle.addEventListener('click', () => historyPanel.hidden ? openHistory() : closeHistory());
  document.querySelector('#history-close').addEventListener('click', closeHistory);
  document.querySelector('#clear-history').addEventListener('click', () => {
    if (!historyStore.list().length || !window.confirm('Clear all calculation history?')) return;
    historyStore.clear(); renderHistory();
  });
  render();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js');
})();
