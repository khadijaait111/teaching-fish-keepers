



###  Step 1 : Add test Front end 

```bash
bun test              # Run tests once
bun test:watch        # Watch mode
bun test:ui           # UI mode
bun test:coverage     # With coverage report
```

### Test Structure

Tests are organized alongside the source code with `.test.ts` or `.test.tsx` extensions:

```
api/auth.test.ts          # API function tests
components/ EventCard.test.tsx    # Component tests
hooks/useAuth.test.tsx      # Custom hook tests
test/setup.ts              # Test configuration and mocks
```

