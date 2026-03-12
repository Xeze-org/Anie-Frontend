# Troubleshooting Guide

Common issues and their solutions.

## Installation Issues

### Peer Dependency Conflicts

**Problem**: `npm install` fails with `ERESOLVE` error about peer dependencies.

```
npm error ERESOLVE could not resolve
npm error peer vite@"^3.1.0 || ^4.0.0 || ^5.0.0" from vite-plugin-pwa
```

**Solution**: Use `--legacy-peer-deps` flag:

```bash
npm install --legacy-peer-deps
```

**Why**: Some packages haven't updated their peer dependencies to support the latest Vite version yet. The `--legacy-peer-deps` flag tells npm to use the old peer dependency resolution algorithm.

**Alternative**: If you want to avoid this flag, you can downgrade Vite:

```json
{
  "devDependencies": {
    "vite": "^5.4.0"
  }
}
```

### High Severity Vulnerabilities

**Problem**: After install, you see:

```
4 high severity vulnerabilities
```

**Check vulnerabilities**:
```bash
npm audit
```

**Fix automatically** (may cause breaking changes):
```bash
npm audit fix --force
```

**Manual fix**: Update specific packages that have vulnerabilities.

## Build Issues

### TypeScript Errors

**Problem**: Build fails with TypeScript errors.

**Solution 1**: Check TypeScript version compatibility:
```bash
npm install typescript@~5.7.2 --save-dev
```

**Solution 2**: Clear TypeScript cache:
```bash
rm -rf node_modules/.tmp
npm run build
```

### Vite Build Errors

**Problem**: `vite build` fails.

**Solution**: Clear Vite cache:
```bash
rm -rf node_modules/.vite
npm run build
```

## Runtime Issues

### IndexedDB Errors

**Problem**: "Failed to open database" errors in console.

**Solution**: Clear browser data or use incognito mode for testing.

**Check**: Make sure you're not in private/incognito mode (some browsers restrict IndexedDB).

### API Connection Errors

**Problem**: "Connection Error" when sending messages.

**Check**:
1. API URL is correct in `.env`
2. API key is configured in Settings
3. Backend server is running
4. CORS is properly configured on backend

**Debug**:
```typescript
// Check settings
const settings = SettingsManager.getInstance().getSettings();
console.log('API Key:', settings.apiKey ? 'Set' : 'Not set');
console.log('Using Custom API:', settings.useCustomApi);
```

### Firebase Initialization Errors

**Problem**: Firebase warnings in console.

**Solution**: Make sure all Firebase environment variables are set in `.env`:

```env
VITE_FIREBASE_API_KEY=your-key
VITE_FIREBASE_AUTH_DOMAIN=your-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

**Note**: Firebase is optional. The app will work without it (analytics will be disabled).

## Development Issues

### Hot Module Replacement (HMR) Not Working

**Problem**: Changes don't reflect in browser.

**Solution**:
1. Restart dev server: `Ctrl+C` then `npm run dev`
2. Clear browser cache
3. Check if file is being watched (not in node_modules)

### Port Already in Use

**Problem**: `Error: Port 5173 is already in use`

**Solution 1**: Kill the process using the port:

Windows:
```bash
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

Linux/Mac:
```bash
lsof -ti:5173 | xargs kill -9
```

**Solution 2**: Use a different port:
```bash
npm run dev -- --port 3000
```

## Service/Repository Issues

### Service Instance Not Updating

**Problem**: Service doesn't reflect updated configuration.

**Solution**: Make sure you're using `useMemo` in hooks:

```typescript
// ❌ Wrong - Creates new instance every render
const service = new GeminiService(apiKey, model);

// ✅ Correct - Memoized
const service = useMemo(
  () => new GeminiService(apiKey, model),
  [apiKey, model]
);
```

### Repository Data Not Persisting

**Problem**: Data disappears after page reload.

**Check**:
1. Repository methods are being called correctly
2. No errors in console
3. Browser storage is not full
4. Not in private/incognito mode

**Debug**:
```typescript
const repo = new MessageRepository();
const messages = await repo.getAll();
console.log('Stored messages:', messages.length);
```

## Testing Issues

### Tests Failing

**Problem**: Tests fail with "Cannot find module" errors.

**Solution**: Make sure test setup includes proper module resolution:

```typescript
// jest.config.js or vitest.config.ts
export default {
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
}
```

### Mock Issues

**Problem**: Services/repositories not mocking properly.

**Solution**: Use proper mocking:

```typescript
// Mock service
jest.mock('@/services/GeminiService');

// Mock repository
jest.mock('@/repositories/MessageRepository', () => ({
  MessageRepository: jest.fn().mockImplementation(() => ({
    getAll: jest.fn().mockResolvedValue([]),
    add: jest.fn().mockResolvedValue(undefined)
  }))
}));
```

## Performance Issues

### Slow Initial Load

**Possible causes**:
1. Large bundle size
2. Too many dependencies
3. Unoptimized images

**Solutions**:
1. Check bundle size: `npm run build` and check `dist/` folder
2. Use code splitting for routes
3. Lazy load heavy components
4. Optimize images

### Memory Leaks

**Problem**: Browser becomes slow over time.

**Check**:
1. Cleanup in useEffect hooks
2. Unsubscribe from events
3. Clear intervals/timeouts

**Example**:
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    // Do something
  }, 1000);
  
  // ✅ Cleanup
  return () => clearInterval(interval);
}, []);
```

## Getting Help

If you're still stuck:

1. Check the [Architecture Documentation](./ARCHITECTURE.md)
2. Review relevant service/repository docs
3. Look at existing code examples
4. Check browser console for errors
5. Enable verbose logging

### Enable Debug Logging

```typescript
// In your component
console.log('State:', { messages, settings, isLoading });

// In services
console.log('API Request:', { endpoint, data });
console.log('API Response:', response);

// In repositories
console.log('Saving to DB:', item);
console.log('Loaded from DB:', items);
```

## Common Error Messages

### "API key is required"

**Cause**: Trying to use Gemini service without API key.

**Fix**: Configure API key in Settings page or use backend API.

### "Failed to fetch"

**Cause**: Network error or CORS issue.

**Fix**: 
1. Check network connection
2. Verify API URL
3. Check CORS configuration on backend

### "Database version change"

**Cause**: IndexedDB schema changed.

**Fix**: Clear browser data or increment DB version in repository.

### "Module not found"

**Cause**: Import path is incorrect.

**Fix**: Use correct import path with `@/` alias:
```typescript
// ❌ Wrong
import { MyService } from '../../../services/MyService';

// ✅ Correct
import { MyService } from '@/services';
```

---

**Still having issues?** Open an issue on GitHub with:
- Error message
- Steps to reproduce
- Browser/Node version
- Relevant code snippet
