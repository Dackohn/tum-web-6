import { useCallback, useEffect, useState } from 'react';
import { resourceService } from '../api/resourceService.js';

export function useResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    resourceService.getAll().then(data => {
      setResources(data);
      setLoading(false);
    });
  }, []);

  const add = useCallback(async (data) => {
    const item = await resourceService.create(data);
    setResources(prev => [item, ...prev]);
    return item;
  }, []);

  const edit = useCallback(async (id, data) => {
    const updated = await resourceService.update(id, data);
    setResources(prev => prev.map(r => r.id === id ? updated : r));
    return updated;
  }, []);

  const remove = useCallback(async (id) => {
    await resourceService.remove(id);
    setResources(prev => prev.filter(r => r.id !== id));
  }, []);

  const toggleStar = useCallback(async (id, current) => {
    const updated = await resourceService.toggleStar(id, current);
    setResources(prev => prev.map(r => r.id === id ? updated : r));
  }, []);

  const cycleStatus = useCallback(async (id, current) => {
    const updated = await resourceService.cycleStatus(id, current);
    setResources(prev => prev.map(r => r.id === id ? updated : r));
  }, []);

  return { resources, loading, add, edit, remove, toggleStar, cycleStatus };
}
