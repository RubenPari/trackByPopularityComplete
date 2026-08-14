# Repository Guidelines

## Project Structure & Module Organization

This repository contains two applications. `tracksByPopularity/` is an ASP.NET Core backend organized by Clean Architecture: `Domain/` holds business rules, `Application/` contains use cases and interfaces, `Infrastructure/` integrates Spotify, Redis, and persistence, and `Presentation/` exposes HTTP endpoints. Backend xUnit tests live in `tracksByPopularity/tests/tracksByPopularity.Tests/`.

`tracksByPopularityFront/` is a Vue 3 and TypeScript client. Application code is under `src/`, grouped into `components/`, `views/`, `composables/`, `services/`, `stores/`, `types/`, and `utils/`. Unit tests are in `src/__tests__/`; Playwright scenarios are in `e2e/`. Static files belong in `public/` or `src/assets/`.

## Build, Test, and Development Commands

- `cd tracksByPopularity && dotnet build`: compile the backend solution.
- `cd tracksByPopularity && dotnet run`: start the API on `http://localhost:8080`.
- `cd tracksByPopularity && dotnet test`: run all xUnit tests.
- `cd tracksByPopularityFront && npm install`: install frontend dependencies.
- `npm run dev`: start Vite on `http://localhost:5173`.
- `npm run build`: type-check and create the production bundle.
- `npm run lint && npm run type-check`: apply ESLint fixes and validate TypeScript.
- `npm run test:unit -- --run`: run Vitest once; `npm run test:e2e` runs Playwright.

## Coding Style & Naming Conventions

Use file-scoped C# namespaces, nullable reference types, dependency injection, and asynchronous methods ending in `Async`. Name C# types and members in `PascalCase`, private fields `_camelCase`, and keep one public class per file.

Vue components use `<script setup lang="ts">` and `PascalCase` filenames; composables start with `use`. Use `camelCase` for TypeScript values, `PascalCase` for types, and `SCREAMING_SNAKE_CASE` for constants. Prefer `const`, explicit parameter and return types, and `unknown` over `any`. Prettier uses no semicolons, single quotes, and a 100-character line width.

## Testing Guidelines

Add focused tests for new behavior and bug fixes. Name frontend tests `*.spec.ts` and backend tests `*Tests.cs`; use descriptive `describe`/`it` or method names. Run the affected suite first, then the complete relevant test command. No coverage threshold is currently enforced.

## Commit & Pull Request Guidelines

Recent history favors concise, imperative Conventional Commit subjects such as `feat(frontend): ...`, `fix(frontend): ...`, and `refactor(backend): ...`. Keep commits atomic and scoped. Pull requests should explain the change, list verification commands, link related issues, and include screenshots for visible UI changes. Call out migrations or configuration changes explicitly.

## Security & Configuration

Never commit Spotify credentials, tokens, or production connection strings. Keep secrets in environment variables or ignored local configuration. Review `appsettings*.json`, frontend environment values, and `docker-compose.yml` carefully before publishing changes.
