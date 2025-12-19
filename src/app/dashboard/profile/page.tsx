'use client';

import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [school, setSchool] = useState('');
  const [profileClass, setProfileClass] = useState('');
  const [bio, setBio] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/profile', { cache: 'no-store' });
        const data = await res.json();
        const p = data.profile;
        if (p) {
          setName(p.name || '');
          setImage(p.image || '');
          setSchool(p.school || '');
          setProfileClass(p.profileClass || '');
          setBio(p.bio || '');
          localStorage.setItem('demo_profile', JSON.stringify(p));
          return;
        }
      } catch {}
      const saved = localStorage.getItem('demo_profile');
      if (saved) {
        const p = JSON.parse(saved);
        setName(p.name || '');
        setImage(p.image || '');
        setSchool(p.school || '');
        setProfileClass(p.profileClass || '');
        setBio(p.bio || '');
      }
    };
    load();
  }, []);

  const save = async () => {
    setMessage(null);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, image, school, profileClass, bio }),
      });
      if (!res.ok) throw new Error('fail');
      const data = await res.json();
      localStorage.setItem('demo_profile', JSON.stringify(data.profile));
      setMessage('Saved');
    } catch {
      localStorage.setItem('demo_profile', JSON.stringify({ name, image, school, profileClass, bio }));
      setMessage('Saved locally');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full name</label>
            <input value={name} onChange={(e)=>setName(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Image URL</label>
            <input value={image} onChange={(e)=>setImage(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">School</label>
            <input value={school} onChange={(e)=>setSchool(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Class</label>
            <input value={profileClass} onChange={(e)=>setProfileClass(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Bio</label>
            <textarea value={bio} onChange={(e)=>setBio(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src={image || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}`} className="h-12 w-12 rounded-full" />
            <div>
              <div className="text-sm font-medium text-gray-900">{name || 'Your name'}</div>
              <div className="text-xs text-gray-500">{school || 'School'}</div>
            </div>
          </div>
          <button onClick={save} className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white">
            Save
          </button>
        </div>
        {message && <p className="mt-3 text-sm text-gray-600">{message}</p>}
      </div>
    </div>
  );
}
