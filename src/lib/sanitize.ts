export const sanitizeHtml = (html: string): string => {
  if (!html) return '';
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const sanitizeUrl = (url: string): string => {
  if (!url) return '';
  // Only allow http and https protocols
  if (!url.match(/^https?:\/\//i)) {
    return '';
  }
  return encodeURI(url);
};

export const stripHtmlTags = (html: string): string => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
};
