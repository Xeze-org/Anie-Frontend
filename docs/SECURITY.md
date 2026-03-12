# Security & Vulnerabilities

## Current Vulnerabilities

### serialize-javascript (High Severity)

**Status**: Present in dev dependencies via `vite-plugin-pwa`

**Affected Package Chain**:
```
vite-plugin-pwa@0.21.1
  └── workbox-build
      └── @rollup/plugin-terser
          └── serialize-javascript <=7.0.2
```

**Risk Level**: Low for this project
- Only affects dev dependencies
- Not used in production runtime
- Vulnerability is in build tooling, not deployed code

**Why Not Fixed**:
- `vite-plugin-pwa` hasn't updated to fix this yet
- Waiting for upstream package updates
- No security risk to end users

## Options to Address

### Option 1: Keep PWA (Recommended)

Accept the dev dependency vulnerability since it doesn't affect production:

```bash
npm install --legacy-peer-deps
```

**Pros**:
- Keep PWA functionality (offline support, installable app)
- No code changes needed
- Vulnerability only in build tools

**Cons**:
- Audit warnings remain
- Need to wait for upstream fix

### Option 2: Remove PWA Plugin

Remove PWA functionality to eliminate vulnerabilities:

**Step 1**: Remove the package
```bash
npm uninstall vite-plugin-pwa --legacy-peer-deps
```

**Step 2**: Update `vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://anie-grade-service-271230242037.asia-south1.run.app',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  plugins: [react()],
})
```

**Pros**:
- No vulnerabilities
- Smaller bundle size
- Faster builds

**Cons**:
- Lose PWA features (offline support, installable)
- Lose service worker caching

### Option 3: Wait for Update

Monitor for updates to `vite-plugin-pwa`:

```bash
npm outdated vite-plugin-pwa
```

Check for new versions that fix the vulnerability.

## Understanding the Vulnerability

**CVE**: GHSA-5c6j-r48x-rmvq

**Description**: RCE via RegExp.flags and Date.prototype.toISOString()

**Impact**: 
- Allows remote code execution in build environment
- Does NOT affect production runtime
- Only exploitable during build process

**Mitigation**:
- Use trusted dependencies only
- Run builds in isolated environments
- Don't run untrusted code during builds

## Security Best Practices

### 1. Regular Audits

Run security audits regularly:

```bash
npm audit
```

### 2. Update Dependencies

Keep dependencies updated:

```bash
npm outdated
npm update
```

### 3. Use Lock Files

Always commit `package-lock.json`:
- Ensures consistent installs
- Prevents supply chain attacks
- Documents exact versions

### 4. Environment Variables

Never commit sensitive data:

```bash
# .env (DO NOT COMMIT)
VITE_API_KEY=your-secret-key
VITE_FIREBASE_API_KEY=your-firebase-key
```

Use `.env.example` for documentation:

```bash
# .env.example (SAFE TO COMMIT)
VITE_API_KEY=your-api-key-here
VITE_FIREBASE_API_KEY=your-firebase-key-here
```

### 5. API Key Security

**Client-side API keys** (like Gemini API):
- Are visible in browser
- Should have usage limits
- Should have domain restrictions
- Should be rotated regularly

**Backend API keys**:
- Never expose in frontend code
- Store in environment variables
- Use backend proxy for sensitive operations

### 6. Content Security Policy

Add CSP headers to prevent XSS:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
               font-src 'self' https://fonts.gstatic.com;">
```

### 7. HTTPS Only

Always use HTTPS in production:
- Protects data in transit
- Required for PWA features
- Prevents MITM attacks

## Monitoring

### Check for New Vulnerabilities

Set up automated monitoring:

1. **GitHub Dependabot**: Enable in repository settings
2. **npm audit**: Run in CI/CD pipeline
3. **Snyk**: Use for continuous monitoring

### CI/CD Security Checks

Add to your CI pipeline:

```yaml
# .github/workflows/security.yml
name: Security Audit
on: [push, pull_request]
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm audit --audit-level=high
```

## Reporting Security Issues

If you find a security vulnerability:

1. **DO NOT** open a public issue
2. Email: admin@xeze.org
3. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Security Checklist

- [ ] All dependencies audited
- [ ] No high/critical vulnerabilities in production code
- [ ] Environment variables not committed
- [ ] API keys have usage limits
- [ ] HTTPS enabled in production
- [ ] CSP headers configured
- [ ] Regular security updates scheduled
- [ ] Dependabot enabled
- [ ] Security policy documented

## Additional Resources

- [npm Security Best Practices](https://docs.npmjs.com/security-best-practices)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [React Security Best Practices](https://react.dev/learn/security)
- [Vite Security](https://vitejs.dev/guide/security.html)

---

**Last Updated**: March 2026
**Next Review**: Check monthly for updates
