'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Clock, Users } from 'lucide-react';

type ClassItem = {
  id: string;
  name: string;
  description?: string | null;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  teacherId?: string;
};

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ClassesPage() {
  const [items, setItems] = useState<ClassItem[]>([]);
  const [q, setQ] = useState('');
  const [status] = useState<'all' | 'active'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ClassItem | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/classes', { cache: 'no-store' });
        const data = await res.json();
        if (Array.isArray(data.classes)) {
          const normalized = data.classes.map((c: any) => ({
            id: c.id,
            name: c.name,
            description: c.description,
            dayOfWeek: c.dayOfWeek,
            startTime: new Date(c.startTime).toISOString(),
            endTime: new Date(c.endTime).toISOString(),
            teacherId: c.teacherId,
          }));
          setItems(normalized);
          localStorage.setItem('demo_classes', JSON.stringify(normalized));
        } else {
          const saved = localStorage.getItem('demo_classes');
          if (saved) setItems(JSON.parse(saved));
        }
      } catch {
        const saved = localStorage.getItem('demo_classes');
        if (saved) setItems(JSON.parse(saved));
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    return items.filter(i => i.name.toLowerCase().includes(q.toLowerCase()));
  }, [items, q]);

  const openNew = () => {
    setEditing(null);
    setName('');
    setDescription('');
    setDayOfWeek(1);
    setStartTime('09:00');
    setEndTime('10:30');
    setError(null);
    setShowModal(true);
  };

  const openEdit = (c: ClassItem) => {
    setEditing(c);
    setName(c.name);
    setDescription(c.description || '');
    setDayOfWeek(c.dayOfWeek);
    const st = new Date(c.startTime);
    const et = new Date(c.endTime);
    setStartTime(st.toISOString().substring(11, 16));
    setEndTime(et.toISOString().substring(11, 16));
    setError(null);
    setShowModal(true);
  };

  const saveLocal = (next: ClassItem[]) => {
    setItems(next);
    localStorage.setItem('demo_classes', JSON.stringify(next));
  };

  const submit = async () => {
    setError(null);
    const today = new Date();
    const startIso = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      Number(startTime.split(':')[0]),
      Number(startTime.split(':')[1])
    ).toISOString();
    const endIso = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      Number(endTime.split(':')[0]),
      Number(endTime.split(':')[1])
    ).toISOString();
    try {
      if (editing) {
        const res = await fetch(`/api/classes/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            description,
            dayOfWeek,
            startTime: startIso,
            endTime: endIso,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          const updated = items.map(i => (i.id === editing.id ? {
            ...i,
            name,
            description,
            dayOfWeek,
            startTime: startIso,
            endTime: endIso,
          } : i));
          saveLocal(updated);
          setShowModal(false);
          return;
        }
      } else {
        const res = await fetch('/api/classes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            description,
            dayOfWeek,
            startTime: startIso,
            endTime: endIso,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          const newItem: ClassItem = {
            id: data.class?.id || crypto.randomUUID(),
            name,
            description,
            dayOfWeek,
            startTime: startIso,
            endTime: endIso,
          };
          const next = [newItem, ...items];
          saveLocal(next);
          setShowModal(false);
          return;
        }
      }
      const fallbackId = editing?.id || crypto.randomUUID();
      const nextLocal = editing
        ? items.map(i => (i.id === fallbackId ? {
            ...i,
            name,
            description,
            dayOfWeek,
            startTime: startIso,
            endTime: endIso,
          } : i))
        : [{ id: fallbackId, name, description, dayOfWeek, startTime: startIso, endTime: endIso }, ...items];
      saveLocal(nextLocal);
      setShowModal(false);
    } catch (e) {
      setError('Failed to save');
    }
  };

  const remove = async (id: string) => {
    try {
      const res = await fetch(`/api/classes/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('fail');
    } catch {}
    const next = items.filter(i => i.id !== id);
    saveLocal(next);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Classes</h1>
        <button
          onClick={openNew}
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <Plus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
          New Class
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              type="text"
              placeholder="Search classes..."
              className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>
        <select 
          aria-label="Filter by status"
          className="rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        >
          <option>All Status</option>
          <option>Active</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => (
          <div key={c.id} className="relative flex flex-col rounded-lg border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">{c.name}</h3>
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                active
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-500">{c.description}</p>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <Clock className="mr-1.5 h-4 w-4 flex-shrink-0 text-gray-400" />
              {days[c.dayOfWeek]} {new Date(c.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(c.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="mt-4 flex space-x-2">
              <button onClick={() => openEdit(c)} className="flex-1 rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                Edit
              </button>
              <button onClick={() => remove(c.id)} className="flex-1 rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-semibold">{editing ? 'Edit Class' : 'New Class'}</h3>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <div className="mt-4 space-y-4">
              <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Name" className="w-full rounded-md border px-3 py-2 text-sm" />
              <textarea value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Description" className="w-full rounded-md border px-3 py-2 text-sm" />
              <select value={dayOfWeek} onChange={(e)=>setDayOfWeek(parseInt(e.target.value))} className="w-full rounded-md border px-3 py-2 text-sm">
                {days.map((d, i)=>(<option key={d} value={i}>{d}</option>))}
              </select>
              <div className="flex space-x-3">
                <div className="flex-1">
                  <label className="block text-xs text-gray-600">Start time</label>
                  <input value={startTime} onChange={(e)=>setStartTime(e.target.value)} type="time" className="w-full rounded-md border px-3 py-2 text-sm" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-600">End time</label>
                  <input value={endTime} onChange={(e)=>setEndTime(e.target.value)} type="time" className="w-full rounded-md border px-3 py-2 text-sm" />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button onClick={()=>setShowModal(false)} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300">
                Cancel
              </button>
              <button onClick={submit} className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
