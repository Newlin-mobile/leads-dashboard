'use client';

import { useState } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';

interface Lead {
  id?: string;
  name: string;
  source: string;
  status: string;
  value_type: string;
  value_amount: number;
  follow_up_date?: string | null;
}

interface LeadFormProps {
  lead?: Lead;
  onSubmit: (data: Omit<Lead, 'id'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function LeadForm({ lead, onSubmit, onCancel, loading }: LeadFormProps) {
  const [name, setName] = useState(lead?.name || '');
  const [source, setSource] = useState(lead?.source || 'hoofdkraan');
  const [status, setStatus] = useState(lead?.status || 'wacht');
  const [valueType, setValueType] = useState(lead?.value_type || 'tbd');
  const [valueAmount, setValueAmount] = useState(lead?.value_amount?.toString() || '0');
  const [followUpDate, setFollowUpDate] = useState(lead?.follow_up_date || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      name: name.trim(),
      source,
      status,
      value_type: valueType,
      value_amount: parseFloat(valueAmount) || 0,
      follow_up_date: followUpDate || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Naam</label>
        <Input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Lead naam / bedrijf"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bron</label>
          <Select value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="hoofdkraan">Hoofdkraan</option>
            <option value="freelancermap">Freelancermap</option>
            <option value="eigen-netwerk">Eigen netwerk</option>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="wacht">Wacht</option>
            <option value="gesprek">Gesprek</option>
            <option value="go">Go</option>
            <option value="rejected">Rejected</option>
            <option value="geen-reactie">Geen reactie</option>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Waarde type</label>
          <Select value={valueType} onChange={(e) => setValueType(e.target.value)}>
            <option value="tbd">TBD</option>
            <option value="eenmalig">Eenmalig</option>
            <option value="recurring">Recurring</option>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bedrag (EUR)</label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={valueAmount}
            onChange={(e) => setValueAmount(e.target.value)}
            placeholder="0.00"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Opvolging datum
          <span className="text-gray-500 text-xs ml-1">(optioneel - voor reminders)</span>
        </label>
        <Input
          type="date"
          value={followUpDate}
          onChange={(e) => setFollowUpDate(e.target.value)}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuleren
        </Button>
        <Button type="submit" loading={loading}>
          {lead?.id ? 'Opslaan' : 'Lead toevoegen'}
        </Button>
      </div>
    </form>
  );
}
