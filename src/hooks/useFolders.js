import { useCallback, useEffect, useState } from 'react';
import { folderService } from '../api/folderService.js';

export function useFolders() {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    folderService.getAll().then(data => { setFolders(data); setLoading(false); });
  }, []);

  const add = useCallback(async (name, color) => {
    const folder = await folderService.create(name, color);
    setFolders(prev => [folder, ...prev]);
    return folder;
  }, []);

  const edit = useCallback(async (id, changes) => {
    const updated = await folderService.update(id, changes);
    setFolders(prev => prev.map(f => f.id === id ? updated : f));
    return updated;
  }, []);

  const remove = useCallback(async (id) => {
    await folderService.remove(id);
    setFolders(prev => prev.filter(f => f.id !== id));
  }, []);

  return { folders, loading, add, edit, remove };
}
