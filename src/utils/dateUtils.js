// Parse and sort community post dates in descending order (newest first)
export function parsePostDateToTimestamp(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return 0;
  const str = dateStr.trim();

  if (/just now|agora|recém/i.test(str)) {
    return Date.now();
  }

  // Relative hours/minutes ago
  const hoursAgoMatch = str.match(/(\d+)\s*(?:hours?|horas?|hrs?|h)\s*(?:ago|atrás)?/i);
  if (hoursAgoMatch) {
    return Date.now() - parseInt(hoursAgoMatch[1], 10) * 3600000;
  }
  const minsAgoMatch = str.match(/(\d+)\s*(?:mins?|minutes?|minutos?|m)\s*(?:ago|atrás)?/i);
  if (minsAgoMatch) {
    return Date.now() - parseInt(minsAgoMatch[1], 10) * 60000;
  }
  const daysAgoMatch = str.match(/(\d+)\s*(?:days?|dias?|d)\s*(?:ago|atrás)?/i);
  if (daysAgoMatch) {
    return Date.now() - parseInt(daysAgoMatch[1], 10) * 86400000;
  }

  // Check Yesterday at hh:mm AM/PM or Yesterday at HH:mm
  const yesterdayMatch = str.match(/yesterday|ontem\s*(?:at|às|as)?\s*(\d{1,2}):(\d{1,2})(?::\d{2})?(?:\s*(AM|PM))?/i);
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

  // Standard Date parse
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
    const updA = a?._updatedAt || 0;
    const updB = b?._updatedAt || 0;
    return updB - updA;
  });
}
