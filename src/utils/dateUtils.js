// Parse and sort community post dates in descending order (newest first)
export function parsePostDateToTimestamp(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return 0;
  const str = dateStr.trim();

  // "Just now", "Agora", "Recém"
  if (/^(just now|agora|recém|moments? ago)$/i.test(str)) {
    return Date.now();
  }

  // Relative seconds: "30 seconds ago", "45s ago"
  const secMatch = str.match(/^(\d+)\s*(?:seconds?|secs?|segundos?|s)\s*(?:ago|atrás)?$/i);
  if (secMatch) {
    return Date.now() - parseInt(secMatch[1], 10) * 1000;
  }

  // Relative minutes: "10 mins ago", "5 minutes ago", "15m ago"
  const minMatch = str.match(/^(\d+)\s*(?:mins?|minutes?|minutos?|min)\s*(?:ago|atrás)?$/i);
  if (minMatch) {
    return Date.now() - parseInt(minMatch[1], 10) * 60000;
  }

  // Relative hours: "1 hour ago", "4 hours ago", "2h ago"
  const hourMatch = str.match(/^(\d+)\s*(?:hours?|horas?|hrs?|hr|h)\s*(?:ago|atrás)?$/i);
  if (hourMatch) {
    return Date.now() - parseInt(hourMatch[1], 10) * 3600000;
  }

  // Relative days: "2 days ago", "15 days ago", "3d ago"
  const dayMatch = str.match(/^(\d+)\s*(?:days?|dias?|d)\s*(?:ago|atrás)?$/i);
  if (dayMatch) {
    return Date.now() - parseInt(dayMatch[1], 10) * 86400000;
  }

  // Relative weeks: "1 week ago", "2 weeks ago", "3 weeks ago", "4w ago"
  const weekMatch = str.match(/^(\d+)\s*(?:weeks?|semanas?|sem|wks?|w)\s*(?:ago|atrás)?$/i);
  if (weekMatch) {
    return Date.now() - parseInt(weekMatch[1], 10) * 7 * 86400000;
  }

  // Relative months: "1 month ago", "2 months ago", "3 months ago", "4 months ago"
  const monthMatch = str.match(/^(\d+)\s*(?:months?|meses?|mês|mo)\s*(?:ago|atrás)?$/i);
  if (monthMatch) {
    return Date.now() - parseInt(monthMatch[1], 10) * 30 * 86400000;
  }

  // Relative years: "1 year ago", "2 years ago"
  const yearMatch = str.match(/^(\d+)\s*(?:years?|anos?|yr|y)\s*(?:ago|atrás)?$/i);
  if (yearMatch) {
    return Date.now() - parseInt(yearMatch[1], 10) * 365 * 86400000;
  }

  // Check Yesterday at hh:mm AM/PM or just Yesterday / Ontem
  const yesterdayMatch = str.match(/^(?:yesterday|ontem)(?:\s*(?:at|às|as)?\s*(\d{1,2}):(\d{1,2})(?::\d{2})?(?:\s*(AM|PM))?)?$/i);
  if (yesterdayMatch) {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    let hr = yesterdayMatch[1] !== undefined ? parseInt(yesterdayMatch[1], 10) : 12;
    const mn = yesterdayMatch[2] !== undefined ? parseInt(yesterdayMatch[2], 10) : 0;
    const ampm = yesterdayMatch[3] ? yesterdayMatch[3].toUpperCase() : null;
    if (ampm === 'PM' && hr < 12) hr += 12;
    if (ampm === 'AM' && hr === 12) hr = 0;
    d.setHours(hr, mn, 0, 0);
    return d.getTime();
  }

  // Check MM/DD/YYYY or DD/MM/YYYY with optional time
  const matchDate = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(?:\s+(?:at|às|as)?\s*(\d{1,2}):(\d{1,2})(?::\d{2})?(?:\s*(AM|PM))?)?/i);
  if (matchDate) {
    const p1 = parseInt(matchDate[1], 10);
    const p2 = parseInt(matchDate[2], 10);
    const yr = parseInt(matchDate[3], 10);
    let hr = matchDate[4] !== undefined ? parseInt(matchDate[4], 10) : 12;
    const mn = matchDate[5] !== undefined ? parseInt(matchDate[5], 10) : 0;
    const ampm = matchDate[6] ? matchDate[6].toUpperCase() : null;

    if (ampm === 'PM' && hr < 12) hr += 12;
    if (ampm === 'AM' && hr === 12) hr = 0;

    let month = p1;
    let day = p2;
    if (month > 12 && day <= 12) {
      month = p2;
      day = p1;
    }
    const d = new Date(yr, month - 1, day, hr, mn, 0);
    return d.getTime();
  }

  // Standard Date parse fallback
  const parsed = Date.parse(str);
  if (!isNaN(parsed)) {
    return parsed;
  }

  return 0;
}

export function sortPostsByDateDesc(postList) {
  if (!Array.isArray(postList)) return [];
  return [...postList].sort((a, b) => {
    const timeA = parsePostDateToTimestamp(a?.date);
    const timeB = parsePostDateToTimestamp(b?.date);
    if (timeB !== timeA) {
      return timeB - timeA;
    }
    // Secondary fallback: _updatedAt or timestamp or id
    const updA = a?._updatedAt || a?.timestamp || 0;
    const updB = b?._updatedAt || b?.timestamp || 0;
    if (updB !== updA) {
      return updB - updA;
    }
    // Numeric part of id as fallback
    const idA = parseInt((a?.id || '').replace(/\D/g, ''), 10) || 0;
    const idB = parseInt((b?.id || '').replace(/\D/g, ''), 10) || 0;
    return idA - idB; // lower initial id was posted earlier if order is sequential
  });
}

