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
###  Step 2 : Add test Back end
bun test              # Run backend tests once
bun test --watch      # Watch mode

### Test Structure
auth/auth.test.ts           # Authentication logic tests
events/events.test.ts       # Event service logic tests
events/api.test.ts       # API route tests for events

