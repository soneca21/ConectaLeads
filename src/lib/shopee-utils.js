
import { format } from 'date-fns';

export const validateShopeeSignature = async (payload, signature, partnerKey) => {
  // This function is mostly for backend use but kept here for reference or if we do client-side validation for some reason
  // Implementation omitted as it requires crypto library unavailable in browser environment securely without exposing secrets
  console.warn("Signature validation should happen server-side");
  return true;
};

export const matchLeadByPhone = (leads, phone) => {
  if (!phone) return null;
  // Normalize phone
  const cleanPhone = phone.replace(/\D/g, '');
  return leads.find(l => l.phone && l.phone.replace(/\D/g, '') === cleanPhone);
};

export const formatShopeeOrder = (rawOrder) => {
  return {
    orderSn: rawOrder.order_sn,
    status: rawOrder.order_status,
    total: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: rawOrder.currency || 'BRL' }).format(rawOrder.total_amount),
    itemsCount: rawOrder.items ? rawOrder.items.length : 0,
    date: rawOrder.created_at ? format(new Date(rawOrder.created_at), 'dd/MM/yyyy HH:mm') : '-'
  };
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'COMPLETED': return 'bg-green-500/20 text-green-500';
    case 'SHIPPED': return 'bg-blue-500/20 text-blue-500';
    case 'CANCELLED': return 'bg-red-500/20 text-red-500';
    case 'UNPAID': return 'bg-yellow-500/20 text-yellow-500';
    default: return 'bg-gray-500/20 text-gray-500';
  }
};
