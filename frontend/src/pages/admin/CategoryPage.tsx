import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Tag, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { categoryService } from '../../services/category.service';
import EmptyState from '../../components/common/EmptyState';
import PageLoader from '../../components/common/PageLoader';
import { queryClient } from '../../lib/queryClient';
import toast from 'react-hot-toast';

export default function CategoryPage() {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const { data: cats, isLoading } = useQuery({ queryKey: ['categories'], queryFn: categoryService.list });

  const createMutation = useMutation({
    mutationFn: () => categoryService.create({ name, icon }),
    onSuccess: () => { toast.success('Category created'); setName(''); setIcon(''); queryClient.invalidateQueries({ queryKey: ['categories'] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed'),
  });

  const updateMutation = useMutation({
    mutationFn: () => categoryService.update(editId!, { name: editName }),
    onSuccess: () => { toast.success('Updated'); setEditId(null); queryClient.invalidateQueries({ queryKey: ['categories'] }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoryService.delete(id),
    onSuccess: () => { toast.success('Deactivated'); queryClient.invalidateQueries({ queryKey: ['categories'] }); },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-6">Category Management</h1>
      <div className="card p-5 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Add Category</h2>
        <div className="flex gap-2">
          <input value={icon} onChange={e => setIcon(e.target.value)} placeholder="Icon (emoji)" className="input w-20 text-center" />
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Category name" className="input flex-1"
            onKeyDown={e => { if (e.key === 'Enter' && name.trim()) createMutation.mutate(); }} />
          <button onClick={() => createMutation.mutate()} disabled={!name.trim() || createMutation.isPending} className="btn-primary gap-2">
            <PlusCircle className="h-4 w-4" /> Add
          </button>
        </div>
      </div>
      {isLoading ? <PageLoader /> : !cats?.length ? (
        <EmptyState icon={Tag} title="No categories" description="Add your first category above." />
      ) : (
        <div className="card overflow-hidden">
          {cats.map((c: any) => (
            <div key={c._id} className="flex items-center gap-3 p-4 border-b border-gray-50 last:border-0">
              <span className="text-2xl w-8 text-center">{c.icon || '📁'}</span>
              {editId === c._id ? (
                <input value={editName} onChange={e => setEditName(e.target.value)} className="input flex-1 py-1 text-sm" autoFocus
                  onKeyDown={e => { if (e.key === 'Enter') updateMutation.mutate(); if (e.key === 'Escape') setEditId(null); }} />
              ) : (
                <span className="flex-1 font-medium text-gray-900">{c.name}</span>
              )}
              <span className={c.isActive ? 'badge-green' : 'badge-gray'}>{c.isActive ? 'Active' : 'Inactive'}</span>
              <div className="flex gap-1">
                {editId === c._id ? (
                  <button onClick={() => updateMutation.mutate()} className="btn-primary text-xs py-1 px-2">Save</button>
                ) : (
                  <button onClick={() => { setEditId(c._id); setEditName(c.name); }} className="p-1.5 text-gray-400 hover:text-brand-600"><Edit className="h-4 w-4" /></button>
                )}
                <button onClick={() => deleteMutation.mutate(c._id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}