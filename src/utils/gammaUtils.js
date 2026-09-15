/**
 * Formats or normalizes any Gamma App URL or iframe snippet into a working embed URL
 */
export function normalizeGammaUrl(input) {
  if (!input) return '';

  let url = input.trim();

  // If user pasted an entire iframe tag like <iframe src="..." ...>
  const iframeMatch = url.match(/src=["']([^"']+)["']/i);
  if (iframeMatch && iframeMatch[1]) {
    url = iframeMatch[1];
  }

  // If it's already an embed link
  if (url.includes('/embed/')) {
    return url;
  }

  // Handle gamma.site domains (e.g., https://a-inflamacao-comeca-no-i-bhez2d8.gamma.site/)
  if (url.includes('.gamma.site')) {
    return url;
  }

  // Handle gamma.app/docs/ID or gamma.app/public/ID
  // Example: https://gamma.app/docs/Ancestral-Diet-Part-1-abc12345
  if (url.includes('gamma.app/docs/')) {
    return url.replace('gamma.app/docs/', 'gamma.app/embed/');
  }

  if (url.includes('gamma.app/public/')) {
    return url.replace('gamma.app/public/', 'gamma.app/embed/');
  }

  return url;
}
