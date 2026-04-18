type SsoExtractionResult = {
  ssoToken: string;
  cleanRelativeUrl: string;
};

export function extractSsoTokenFromLocation(rawUrl: string): SsoExtractionResult {
  const parsed = new URL(rawUrl, 'https://studynavi.local');

  const tokenFromQuery = parsed.searchParams.get('ssoToken') || '';
  const rawHash = parsed.hash.startsWith('#') ? parsed.hash.slice(1) : parsed.hash;
  const hashParams = new URLSearchParams(rawHash);
  const tokenFromHash = hashParams.get('ssoToken') || '';
  const ssoToken = (tokenFromHash || tokenFromQuery).trim();

  parsed.searchParams.delete('ssoToken');
  hashParams.delete('ssoToken');

  const remainingHash = hashParams.toString();
  const cleanRelativeUrl = `${parsed.pathname}${parsed.search}${remainingHash ? `#${remainingHash}` : ''}`;

  return {
    ssoToken,
    cleanRelativeUrl,
  };
}
