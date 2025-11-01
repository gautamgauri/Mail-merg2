# Security Guidelines

## Overview

This document outlines security best practices and guidelines for the AI Mail Merge Assistant.

## Current Security Measures

### 1. Environment Variable Management
- ✅ API keys stored in `.env.local` (not committed to git)
- ✅ `.env.example` template provided for setup
- ✅ Comprehensive `.gitignore` rules for environment files
- ✅ API key validation with helpful error messages

### 2. Client-Side Security
- ✅ No API keys exposed in browser bundle (injected at build time)
- ✅ Google OAuth for user authentication
- ✅ Scoped permissions (gmail.send, contacts.readonly)
- ✅ No token persistence (tokens used immediately)

### 3. Error Handling
- ✅ User-friendly error messages
- ✅ Specific error types (API key, quota, network)
- ✅ Console logging for debugging

## Known Security Considerations

### 1. Frontend API Key Usage

**Current State**: The Gemini API key is injected into the frontend bundle at build time via Vite.

**Risk**: While not visible in source code, the API key can still be extracted from the compiled JavaScript bundle by inspecting network requests or the browser's developer tools.

**Mitigation Options**:

#### Option A: Backend Proxy (Recommended for Production)
Move Gemini API calls to your backend service:

```javascript
// Instead of calling Gemini directly from frontend
const response = await fetch(`${backendUrl}/api/enhance`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ body: emailBody, prompt })
});
```

Benefits:
- API key never exposed to clients
- Centralized rate limiting and usage monitoring
- Better security posture

#### Option B: API Key Restrictions (Current Setup)
For the current frontend-based approach, set up API key restrictions in [Google Cloud Console](https://console.cloud.google.com/apis/credentials):

1. **HTTP Referrer Restrictions**:
   - Add your production domain (e.g., `https://yourdomain.com/*`)
   - Add localhost for development (`http://localhost:3000/*`)

2. **API Restrictions**:
   - Restrict to only "Generative Language API"

3. **Usage Quotas**:
   - Set daily/monthly quotas to limit potential abuse
   - Enable billing alerts

### 2. OAuth Token Management

**Current State**: Access tokens requested on-demand, not persisted.

**Good Practices**:
- ✅ Tokens used immediately for API calls
- ✅ No localStorage/sessionStorage persistence
- ✅ User must re-authenticate for sensitive operations

**Recommendation**: Current implementation is secure for this use case.

### 3. Backend Service Integration

**Current State**: Backend URL is user-configurable.

**Risks**:
- Users could point to malicious endpoints
- No SSL/certificate validation in documentation

**Recommendations**:
1. Hardcode production backend URL
2. Use HTTPS only
3. Implement certificate pinning for production
4. Add backend health check endpoint

### 4. Email Data Security

**Current State**: Email data processed in-memory, exported to CSV/text.

**Considerations**:
- Email addresses and personal data handled in browser
- No server-side storage by default (depends on backend)
- CSV exports contain sensitive data

**Recommendations**:
1. Add warning before exporting sensitive data
2. Implement data sanitization for CSV exports
3. Consider encryption for exported files
4. Add privacy policy regarding data handling

## Security Checklist for Production Deployment

### Before Launch:
- [ ] Generate new production API key (separate from development)
- [ ] Enable API key restrictions (HTTP referrer + API scope)
- [ ] Set up usage quotas and billing alerts
- [ ] Configure HTTPS only (no HTTP)
- [ ] Review and test error handling
- [ ] Implement rate limiting on backend
- [ ] Add Content Security Policy headers
- [ ] Enable CORS only for your domain
- [ ] Audit third-party dependencies (`npm audit`)
- [ ] Set up logging and monitoring
- [ ] Create incident response plan

### Regular Maintenance:
- [ ] Rotate API keys quarterly
- [ ] Monitor API usage for anomalies
- [ ] Update dependencies regularly (`npm audit fix`)
- [ ] Review access logs
- [ ] Test error handling and edge cases

## Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** open a public issue
2. Email security concerns to: [your-email@example.com]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## References

- [Google API Key Best Practices](https://cloud.google.com/docs/authentication/api-keys)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OAuth 2.0 Security Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

## License

This security document is part of the AI Mail Merge Assistant project.
