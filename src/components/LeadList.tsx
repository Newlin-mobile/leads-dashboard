'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { Modal } from './ui/Modal';
import { LeadForm } from './LeadForm';
import { LeadStatusBadge, getSourceLabel, getValueTypeLabel, formatCurrency } from './LeadStatusBadge';
import { Plus, Trash2, Eye } from 'lucide-react';

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

interface LeadListProps {
  leads: Lead[];
}

export function LeadList({ leads: initialLeads }: LeadListProps) {
  const router = useRouter();
  const [leads, setLeads] = useState(initialLeads);
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const filteredLeads = leads.filter((lead) => {
    if (statusFilter && lead.status !== statusFilter) return false;
    if (sourceFilter && lead.source !== sourceFilter) return false;
    return true;
  });

  const handleCreate = async (data: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
    setCreating(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create lead');
      const result = await res.json();
      setLeads([result.lead, ...leads]); // Add new lead to top of list
      setShowCreateModal(false);
      router.refresh();
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    } catch (error) {
      console.error('Status update failed:', error);
    }
  };

  const handleDelete = async (leadId: string) => {
    if (!confirm('Weet je zeker dat je deze lead wilt verwijderen?')) return;
    try {
      const res = await fetch(`/api/leads/${leadId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete lead');
      setLeads(leads.filter(l => l.id !== leadId));
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  return (
    <div>
      {/* Filters and actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex gap-3">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-40"
          >
            <option value="">Alle statussen</option>
            <option value="go">Go</option>
            <option value="gesprek">Gesprek</option>
            <option value="wacht">Wacht</option>
            <option value="rejected">Rejected</option>
            <option value="geen-reactie">Geen reactie</option>
          </Select>

          <Select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="w-40"
          >
            <option value="">Alle bronnen</option>
            <option value="hoofdkraan">Hoofdkraan</option>
            <option value="freelancermap">Freelancermap</option>
            <option value="eigen-netwerk">Eigen netwerk</option>
          </Select>
        </div>

        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nieuwe lead
        </Button>
      </div>

      {/* Lead table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Naam</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bron</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Waarde</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Geen leads gevonden
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                      <Link href={`/dashboard/leads/${lead.id}`} className="hover:text-purple-600">
                        {lead.name}
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {getSourceLabel(lead.source)}
                    </td>
                    <td className="px-4 py-4">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className="text-xs rounded-full border-0 py-1 px-2 font-medium cursor-pointer focus:ring-2 focus:ring-purple-500"
                        style={{
                          backgroundColor: lead.status === 'go' ? '#dcfce7' : ['gesprek', 'wacht'].includes(lead.status) ? '#fef9c3' : '#fee2e2',
                          color: lead.status === 'go' ? '#15803d' : ['gesprek', 'wacht'].includes(lead.status) ? '#a16207' : '#b91c1c',
                        }}
                      >
                        <option value="wacht">Wacht</option>
                        <option value="gesprek">Gesprek</option>
                        <option value="go">Go</option>
                        <option value="rejected">Rejected</option>
                        <option value="geen-reactie">Geen reactie</option>
                      </select>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {getValueTypeLabel(lead.value_type)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 text-right font-medium">
                      {lead.value_amount > 0 ? formatCurrency(lead.value_amount) : '-'}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Link href={`/dashboard/leads/${lead.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(lead.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create modal */}
      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Nieuwe lead">
        <LeadForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreateModal(false)}
          loading={creating}
        />
      </Modal>
    </div>
  );
}
