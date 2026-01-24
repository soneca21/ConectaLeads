
export function calculateLeadScore(lead, qualifications = {}, interactions = []) {
  let score = 0;

  // Regra 1: Urgência "Quero comprar hoje" -> +40
  if (qualifications.urgency === 'high' || qualifications.urgency === 'Quero comprar hoje') {
    score += 40;
  }

  // Regra 2: Interesse em Link/Preço/Cupom -> +25
  if (qualifications.interest_type === 'specific' || lead.last_message_intent === 'price_inquiry') {
    score += 25;
  }

  // Regra 3: Categoria + Faixa de Preço definida -> +15
  if (qualifications.category_interest && qualifications.budget_range) {
    score += 15;
  }

  // Regra 4: Sem resposta por 24h -> -10
  // (Assumindo que a verificação é feita contra last_contact_at)
  const now = new Date();
  if (lead.last_contact_at && (now - new Date(lead.last_contact_at) > 24 * 60 * 60 * 1000)) {
    score -= 10;
  }

  // Regra 5: Clique em Oferta -> +10 por clique distinto
  const offerClicks = interactions.filter(i => i.type === 'offer_click').length;
  score += (offerClicks * 10);

  // Regra 6: Clique no WhatsApp -> +15
  const whatsappClicks = interactions.filter(i => i.type === 'whatsapp_click').length;
  score += (whatsappClicks * 15);

  return Math.max(0, score); // Score não deve ser negativo
}

export function getLeadCategory(score) {
  if (score >= 70) return { label: 'Quente', color: 'text-red-500', bg: 'bg-red-500/10' };
  if (score >= 40) return { label: 'Morno', color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
  return { label: 'Frio', color: 'text-blue-500', bg: 'bg-blue-500/10' };
}
