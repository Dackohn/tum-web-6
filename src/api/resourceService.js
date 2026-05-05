import { resourceAdapter as adapter } from './apiAdapter.js';

export const STATUS_CYCLE = ['queued', 'in-progress', 'done'];

export const resourceService = {
  getAll: () => adapter.getAll(),

  async create({ title, url, category, status, tags, notes, rating, folderId }) {
    const now = new Date().toISOString();
    return adapter.create({
      id: crypto.randomUUID(),
      title: title.trim(),
      url: (url || '').trim(),
      category,
      status,
      tags: tags.map(t => t.trim().toLowerCase()).filter(Boolean),
      notes: (notes || '').trim(),
      rating: status === 'done' ? (rating ?? 0) : 0,
      starred: false,
      folderId: folderId || null,
      createdAt: now,
      updatedAt: now,
    });
  },

  async update(id, { title, url, category, status, tags, notes, rating, folderId }) {
    return adapter.update(id, {
      title: title.trim(),
      url: (url || '').trim(),
      category,
      status,
      tags: tags.map(t => t.trim().toLowerCase()).filter(Boolean),
      notes: (notes || '').trim(),
      rating: status === 'done' ? (rating ?? 0) : 0,
      folderId: folderId || null,
      updatedAt: new Date().toISOString(),
    });
  },

  async remove(id)  { return adapter.remove(id); },

  async toggleStar(id, current) {
    return adapter.update(id, { starred: !current, updatedAt: new Date().toISOString() });
  },

  async cycleStatus(id, current) {
    const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(current) + 1) % STATUS_CYCLE.length];
    return adapter.update(id, {
      status: next,
      rating: next === 'done' ? 0 : undefined,
      updatedAt: new Date().toISOString(),
    });
  },

  async replaceAll(items) { return adapter.replace(items); },
};
