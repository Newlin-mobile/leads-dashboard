'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Copy, Trash2, Plus, Eye, EyeOff } from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  scopes: string;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
}

export default function SettingsPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [showNewKey, setShowNewKey] = useState(false);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const res = await fetch('/api/keys');
      if (res.ok) {
        const data = await res.json();
        setKeys(data.keys);
      }
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newKeyName.trim()) return;

    setCreating(true);
    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName.trim(), scopes: ['read'] }),
      });

      if (res.ok) {
        const data = await res.json();
        setNewKey(data.key);
        setNewKeyName('');
        await fetchKeys();
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Weet je zeker dat je deze API key wilt verwijderen?')) return;

    try {
      const res = await fetch(`/api/keys/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setKeys(keys.filter(k => k.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete API key:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Nooit';
    return new Date(date).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-gray-600">Beheer je API keys</p>
      </div>

      {/* API Keys section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">API Keys</h2>
            <p className="text-sm text-gray-600 mt-1">
              Gebruik API keys voor toegang tot de analytics API
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nieuwe key
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Laden...</div>
        ) : keys.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Geen API keys gevonden. Maak er een om te beginnen.
          </div>
        ) : (
          <div className="space-y-3">
            {keys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{key.name}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Scopes: {key.scopes} • Laatst gebruikt: {formatDate(key.last_used_at)} • 
                    Aangemaakt: {formatDate(key.created_at)}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(key.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create modal */}
      <Modal
        open={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setNewKey(null);
          setNewKeyName('');
          setShowNewKey(false);
        }}
        title={newKey ? 'API Key aangemaakt' : 'Nieuwe API Key'}
      >
        {newKey ? (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800 font-medium mb-2">
                ⚠️ Bewaar deze key nu - je kunt hem later niet meer zien!
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    readOnly
                    type={showNewKey ? 'text' : 'password'}
                    value={newKey}
                    className="font-mono text-sm pr-10"
                  />
                  <button
                    onClick={() => setShowNewKey(!showNewKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <Button onClick={() => copyToClipboard(newKey)}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Gebruik in API requests:</p>
              <code className="block bg-gray-900 text-green-400 p-3 rounded font-mono text-xs overflow-x-auto">
                Authorization: Bearer {newKey}
              </code>
            </div>

            <Button onClick={() => {
              setShowCreateModal(false);
              setNewKey(null);
              setShowNewKey(false);
            }} className="w-full">
              Begrepen
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Naam
              </label>
              <Input
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="bijv. Noor Analytics API"
              />
              <p className="text-xs text-gray-500 mt-1">
                Geef de key een herkenbare naam
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  setNewKeyName('');
                }}
              >
                Annuleren
              </Button>
              <Button onClick={handleCreate} loading={creating} disabled={!newKeyName.trim()}>
                Key aanmaken
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
