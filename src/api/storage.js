// Generic async localStorage store factory.
// Swap createStore for an apiStore(endpoint) factory to add a REST backend.
function createStore(key) {
  function load() {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); }
    catch { return []; }
  }
  function save(list) { localStorage.setItem(key, JSON.stringify(list)); }

  return {
    async getAll() { return load(); },
    async create(item) {
      const list = load();
      list.unshift(item);
      save(list);
      return item;
    },
    async update(id, changes) {
      const list = load();
      const idx = list.findIndex(r => r.id === id);
      if (idx === -1) throw new Error(`Item ${id} not found`);
      list[idx] = { ...list[idx], ...changes };
      save(list);
      return list[idx];
    },
    async remove(id) { save(load().filter(r => r.id !== id)); },
    async replace(items) { save(items); },
  };
}

export const resourceAdapter = createStore('devqueue:resources');
export const folderAdapter   = createStore('devqueue:folders');
