import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  go: { label: 'Go', color: 'text-green-700', bg: 'bg-green-100' },
  gesprek: { label: 'Gesprek', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  wacht: { label: 'Wacht', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  rejected: { label: 'Rejected', color: 'text-red-700', bg: 'bg-red-100' },
  'geen-reactie': { label: 'Geen reactie', color: 'text-red-700', bg: 'bg-red-100' },
};

const SOURCE_CONFIG: Record<string, { label: string }> = {
  hoofdkraan: { label: 'Hoofdkraan' },
  freelancermap: { label: 'Freelancermap' },
  'eigen-netwerk': { label: 'Eigen netwerk' },
};

const VALUE_TYPE_CONFIG: Record<string, { label: string }> = {
  eenmalig: { label: 'Eenmalig' },
  recurring: { label: 'Recurring' },
  tbd: { label: 'TBD' },
};

export function LeadStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || { label: status, color: 'text-gray-700', bg: 'bg-gray-100' };
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', config.bg, config.color)}>
      {config.label}
    </span>
  );
}

export function getSourceLabel(source: string): string {
  return SOURCE_CONFIG[source]?.label || source;
}

export function getValueTypeLabel(valueType: string): string {
  return VALUE_TYPE_CONFIG[valueType]?.label || valueType;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(amount);
}
