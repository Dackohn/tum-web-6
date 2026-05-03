import { folderAdapter as adapter } from './storage.js';

export const FOLDER_COLORS = [
  '#6366f1', '#3b82f6', '#06b6d4', '#10b981',
  '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6',
];

export const folderService = {
  getAll: () => adapter.getAll(),

  async create(name, color) {
    return adapter.create({
      id: crypto.randomUUID(),
      name: name.trim(),
      color: color || FOLDER_COLORS[0],
      createdAt: new Date().toISOString(),
    });
  },

  async update(id, { name, color }) {
    return adapter.update(id, { name: name.trim(), color });
  },

  async remove(id) { return adapter.remove(id); },
};
