'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Modal } from './ui/Modal';
import { LeadForm } from './LeadForm';
import { LeadStatusBadge, getSourceLabel, getValueTypeLabel, formatCurrency } from './LeadStatusBadge';
import { ArrowLeft, Edit, Trash2, MessageSquare, Clock } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

interface Lead {
  id: string;
  name: string;
  source: string;
  status: string;
  value_type: string;
  value_amount: number;
  created_at: string;
  updated_at: string;
}

interface Note {
  id: string;
  lead_id: string;
  note: string;
  created_at: string;
}

interface LeadDetailProps {
  lead: Lead;
  notes: Note[];
}

export function LeadDetail({ lead: initialLead, notes: initialNotes }: LeadDetailProps) {
  const router = useRouter();
  const [lead, setLead] = useState(initialLead);
  const [notes, setNotes] = useState(initialNotes);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async (data: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update lead');
      const { lead: updatedLead } = await res.json();
      setLead(updatedLead);
      setShowEditModal(false);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Weet je zeker dat je deze lead wilt verwijderen?')) return;
    const res = await fetch(`/api/leads/${lead.id}`, { method: 'DELETE' });
    if (res.ok) router.push('/dashboard/leads');
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setAddingNote(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: newNote.trim() }),
      });
      if (!res.ok) throw new Error('Failed to add note');
      const { note: createdNote } = await res.json();
      setNotes([createdNote, ...notes]);
      setNewNote('');
    } finally {
      setAddingNote(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link href="/dashboard/leads" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Terug naar leads
      </Link>

      {/* Lead header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{lead.name}</h1>
            <div className="mt-2 flex flex-wrap gap-2 items-center">
              <LeadStatusBadge status={lead.status} />
              <span className="text-sm text-gray-500">{getSourceLabel(lead.source)}</span>
            </div>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowEditModal(true)}>
              <Edit className="w-4 h-4 mr-1" />
              Bewerken
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-1" />
              Verwijderen
            </Button>
          </div>
        </div>

        {/* Lead details grid */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Bron</div>
            <div className="text-sm font-medium">{getSourceLabel(lead.source)}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Waarde type</div>
            <div className="text-sm font-medium">{getValueTypeLabel(lead.value_type)}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Bedrag</div>
            <div className="text-sm font-medium">
              {lead.value_amount > 0 ? formatCurrency(lead.value_amount) : '-'}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Aangemaakt</div>
            <div className="text-sm font-medium">{formatDateTime(lead.created_at)}</div>
          </div>
        </div>
      </div>

      {/* Notes section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <MessageSquare className="w-5 h-5 mr-2" />
          Notities
        </h2>

        {/* Add note form */}
        <form onSubmit={handleAddNote} className="mb-6">
          <div className="flex gap-3">
            <Input
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Voeg een notitie toe..."
              className="flex-1"
            />
            <Button type="submit" loading={addingNote} disabled={!newNote.trim()}>
              Toevoegen
            </Button>
          </div>
        </form>

        {/* Notes timeline */}
        {notes.length > 0 ? (
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="flex gap-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full" />
                </div>
                <div className="flex-1 bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-900">{note.note}</p>
                  <div className="mt-1 flex items-center text-xs text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatDateTime(note.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">
            Nog geen notities. Voeg er een toe hierboven.
          </p>
        )}
      </div>

      {/* Edit modal */}
      <Modal open={showEditModal} onClose={() => setShowEditModal(false)} title="Lead bewerken">
        <LeadForm
          lead={lead}
          onSubmit={handleUpdate}
          onCancel={() => setShowEditModal(false)}
          loading={updating}
        />
      </Modal>
    </div>
  );
}
