# AGENTS.md

This file provides guidance for agentic coding agents working in this repository.

## Project Overview

Two projects: ASP.NET Core backend (`tracksByPopularity/`) and Vue 3 frontend (`tracksByPopularityFront/`).

---

## Build, Lint, and Test Commands

### Backend (`tracksByPopularity/`)

```bash
# Build
cd tracksByPopularity && dotnet build

# Run
dotnet run                    # http://localhost:8080
dotnet watch run              # Hot reload

# Test (xUnit)
dotnet test
dotnet test --filter "FullyQualifiedName~TestClassName"   # Run single test class
dotnet test --filter "FullyQualifiedName~TestMethodName" # Run single test

# Format (using dotnet-format)
dotnet format
```

### Frontend (`tracksByPopularityFront/`)

```bash
cd tracksByPopularityFront

# Install dependencies
npm install

# Development
npm run dev                   # Vite dev server at http://localhost:5173

# Build
npm run build                 # Type-check + production build
npm run build-only            # Vite build without type-check

# Lint & Format
npm run lint                  # ESLint with auto-fix
npm run format                # Prettier (write mode)

# Type Check
npm run type-check            # vue-tsc type checking

# Testing
npm run test:unit             # Vitest unit tests
npm run test:unit -- src/__tests__/App.spec.ts   # Run single test file
npm run test:unit -- --run src/__tests__/App.spec.ts  # Run with --run flag
npm run test:e2e              # Playwright e2e tests
```

---

## Architecture Conventions

### Backend (Clean Architecture)

```
src/
├── Domain/           # Entities, Value Objects, Domain Services (no external deps)
│   ├── Entities/
│   ├── ValueObjects/
│   ├── Enums/
│   ├── Exceptions/
│   └── Services/
├── Application/      # Interfaces, DTOs, Application Services
│   ├── Interfaces/
│   ├── DTOs/
│   ├── Services/
│   ├── Validators/
│   └── Mapping/
├── Infrastructure/   # External services, Redis, Spotify API
│   ├── Services/
│   ├── Configuration/
│   ├── Data/
│   ├── Background/
│   ├── Logging/
│   └── Helpers/
└── Presentation/     # Controllers, Middleware, Filters
    ├── Controllers/
    ├── Middlewares/
    └── Filters/
```

### Frontend (Vue 3 + TypeScript)

```
src/
├── composables/      # Vue composables (useXxx naming)
├── services/         # API clients (xxxApi naming)
├── stores/           # Pinia stores
├── router/
├── i18n/
├── types/
├── utils/
├── components/
└── __tests__/        # Unit tests
```

---

## Backend Conventions (C#/.NET)

### Naming Conventions
- Classes/Interfaces: `PascalCase` (e.g., `TrackOrganizationService`)
- Methods/Properties: `PascalCase` (e.g., `GetUserByIdAsync`)
- Private fields: `_camelCase` (e.g., `_cacheService`)
- Namespaces: Match folder structure (e.g., `tracksByPopularity.Application.Services`)
- Files: Match class name (e.g., `TrackOrganizationService.cs`)

### File Organization
- One public class per file (exception: tightly coupled small classes)
- Place interface and implementation in same folder under `Interfaces/` and `Services/`
- Use file-scoped namespaces: `namespace tracksByPopularity.Application.Services;`

### Imports
```csharp
using System.Collections.Generic;
using System.Threading.Tasks;
// Framework namespaces first, then third-party, then internal
using SpotifyAPI.Web;
using tracksByPopularity.Application.Interfaces;
```

### Nullable & Types
- Enable nullable reference types: `<Nullable>enable</Nullable>`
- Initialize strings with `string.Empty` or use `string?`
- Use `IList<T>` for method parameters, `List<T>` for concrete types
- Primary constructors for DI: `public class Service(IDependency dep) { }`

### Error Handling
- Use structured logging with Serilog: `logger.LogInformation("Message {Param}", value)`
- Domain exceptions for business rule violations
- Global exception middleware handles all unhandled exceptions
- Return `ApiResponse.Fail()` for expected failures

### API Response Pattern
```csharp
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public T? Data { get; set; }
    public string? Error { get; set; }
}

return ApiResponse<T>.Ok(data);
return ApiResponse.Fail("Error message");
```

### Async/Await
- Async methods must end with `Async` suffix
- Use `async Task<T>` for operations that return values
- Avoid blocking calls (`.Result`, `.Wait()`)

---

## Frontend Conventions (TypeScript/Vue 3)

### Naming Conventions
- Variables/functions: `camelCase` (e.g., `getUserData`, `isLoading`)
- Components: `PascalCase` (e.g., `PlaylistSelector.vue`)
- Types/Interfaces: `PascalCase` (e.g., `ApiResponse<T>`)
- Files: `kebab-case` (e.g., `use-playlists.ts`, `playlist-actions.ts`)
- Constants: `SCREAMING_SNAKE_CASE` (e.g., `ERROR_MESSAGES`)

### Imports
```typescript
// Vue/core first, then external, then internal
import { ref, computed } from 'vue'
import { defineComponent } from 'vue'
import axios from 'axios'
import { usePlaylists } from '@/composables/usePlaylists'
import { PLAYLIST_IDS } from '@/utils/constants'
import type { ApiResponse } from '@/types/api'
```

### TypeScript
- Use `interface` for object shapes, `type` for unions/intersections
- Always annotate function parameters and return types
- Use `unknown` instead of `any` for untyped data
- Prefer `const` over `let`

### Vue 3 Composition API
- Use `<script setup lang="ts">` for all components
- Composables prefixed with `use`: `usePlaylists()`, `useApiHealth()`
- Props defined with `defineProps<Props>()` and validated
- Emits defined with `defineEmits<Emits>()`

### Error Handling
- Wrap async operations in try/catch
- Return `ApiResponse` objects with `{ success: boolean, data?, error? }`
- Log errors with the logger utility: `logger.error('message', error)`
- Display errors to users via NotificationBanner component

### Formatting (Prettier)
```json
{
  "semi": false,
  "singleQuote": true,
  "printWidth": 100
}
```

### Testing (Vitest)
- Test files in `src/__tests__/` with `.spec.ts` suffix
- Use `describe`/`it` blocks with BDD-style naming
- Mock dependencies using `vi.fn()` or `vi.mock()`
- Use `@vue/test-utils` for component tests

---

## General Guidelines

1. **Never commit secrets** - Use `.env` files, never commit credentials
2. **Run lint/type-check before committing** - `npm run lint && npm run type-check` (frontend)
3. **Write tests for new features** - Follow existing test patterns
4. **Use domain-driven design** in backend - Keep business logic in Domain layer
5. **Prefer composition over inheritance** in frontend
6. **Use dependency injection** in backend via primary constructors
7. **Follow existing patterns** - Match surrounding code style
