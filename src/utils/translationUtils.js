/**
 * Auto-sanitizer and translator for any residual Portuguese texts
 * that might have been synced from legacy Firestore records.
 */

const PORTUGUESE_DICTIONARY = [
  {
    pt: 'Descubra como transformar sua rotina em uma caminhada diária de serenidade, confiança divina e paz inabalável.',
    en: 'Discover how to transform your daily routine into a path of deep serenity, divine trust, and unshakable inner calm.'
  },
  {
    pt: 'Um refúgio de paz com os Salmos mais reconfortantes comentados e orações diárias de proteção.',
    en: 'A sacred haven of comfort featuring in-depth reflections on comforting Psalms and daily protection decrees.'
  },
  {
    pt: 'Silenciando os ruídos do mundo para ouvir a voz divina',
    en: 'Silencing the noise of the world to hear the divine whisper'
  },
  {
    pt: 'Como a gratidão abre portas para bênçãos e milagres cotidianos',
    en: 'How gratitude unlocks doors for daily miracles and joy'
  },
  {
    pt: 'Superando mágoas, dores do passado e acolhendo o perdão libertador',
    en: 'Overcoming past wounds, letting go of resentment, and embracing forgiveness'
  },
  {
    pt: 'Oração de cobertura e escudo espiritual contra todo o mal',
    en: 'A prayer of spiritual shield and divine refuge against all fear'
  },
  {
    pt: 'Nada me faltará: paz, provisão e águas tranquilas',
    en: 'You lack nothing: restoration, peace, and still waters'
  },
  {
    pt: 'Alinhando suas decisões cotidianas ao seu propósito espiritual superior',
    en: 'Aligning your everyday decisions with your highest spiritual calling'
  },
  {
    pt: 'Práticas espirituais, respiração consciente e sabedoria contemplativa para dissolver a angústia.',
    en: 'Spiritual practices, calming breathwork, and contemplative wisdom to dissolve worry, fear, and emotional strain.'
  },
  {
    pt: 'Suplemento',
    en: 'Supplement'
  },
  {
    pt: 'Conteúdo',
    en: 'Content'
  },
  {
    pt: 'Principal',
    en: 'Main'
  },
  {
    pt: 'Bônus',
    en: 'Bonus'
  },
  {
    pt: 'Liberado',
    en: 'Released'
  },
  {
    pt: 'Bloqueado',
    en: 'Blocked'
  },
  {
    pt: 'Imediato',
    en: 'Immediate'
  },
  {
    pt: 'Manual',
    en: 'Manual'
  },
  {
    pt: 'Via Integração',
    en: 'Via Integration'
  },
  {
    pt: 'Dias após a compra',
    en: 'Days After Purchase'
  }
];

export function translateResidualText(text) {
  if (!text || typeof text !== 'string') return text || '';
  
  let result = text;
  for (const item of PORTUGUESE_DICTIONARY) {
    if (result.includes(item.pt)) {
      result = result.replaceAll(item.pt, item.en);
    }
  }

  // Common quick word replacements
  result = result
    .replace(/^Parte\s+(\d+)/i, 'Part $1')
    .replace(/^Capítulo\s+(\d+)/i, 'Chapter $1')
    .replace(/dias\s+após\s+a\s+compra/gi, 'Days After Purchase');

  return result;
}

export function sanitizeEbookObject(eb) {
  if (!eb) return eb;
  return {
    ...eb,
    title: translateResidualText(eb.title),
    subtitle: translateResidualText(eb.subtitle),
    description: translateResidualText(eb.description),
    category: translateResidualText(eb.category || 'Content'),
    type: translateResidualText(eb.type || 'Main'),
    releaseType: translateResidualText(eb.releaseType || eb.release_mode || 'Immediate'),
    tag: translateResidualText(eb.tag || 'Released'),
    chapters: (eb.chapters || []).map(ch => ({
      ...ch,
      title: translateResidualText(ch.title),
      subtitle: translateResidualText(ch.subtitle),
      description: translateResidualText(ch.description)
    }))
  };
}
