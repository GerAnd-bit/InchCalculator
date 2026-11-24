/* Small, defensive localStorage wrapper for completed calculations. */
(function (root) {
  const KEY = 'inch-calculator-history-v1';
  const MAX_ENTRIES = 1000;

  function createHistoryStore(storage) {
    function read() {
      try {
        const entries = JSON.parse(storage.getItem(KEY) || '[]');
        return Array.isArray(entries) ? entries.filter(isEntry).slice(0, MAX_ENTRIES) : [];
      } catch { return []; }
    }
    function write(entries) {
      try { storage.setItem(KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES))); } catch { /* Storage can be unavailable in private browsing. */ }
    }
    function isEntry(entry) {
      return entry && typeof entry.id === 'string' && typeof entry.expression === 'string' && typeof entry.result === 'string' && Array.isArray(entry.tokens);
    }
    return {
      list: read,
      add(entry) {
        if (!isEntry(entry)) return read();
        const entries = read();
        if (entries[0]?.id === entry.id) return entries;
        entries.unshift(entry);
        write(entries);
        return entries.slice(0, MAX_ENTRIES);
      },
      clear() { try { storage.removeItem(KEY); } catch { /* Keep calculator usable when storage is blocked. */ } },
    };
  }

  root.InchHistory = { createHistoryStore, KEY, MAX_ENTRIES };
})(typeof window === 'undefined' ? globalThis : window);
