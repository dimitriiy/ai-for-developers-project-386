# AGENTS.md - Coding Guidelines

## Project Overview

- **Root**: Plain JavaScript (ES modules)
- **Frontend**: Vite + React + TypeScript + Mantine UI

---

## Build & Development

```bash
cd frontend
yarn dev       # Dev server on http://localhost:5173
yarn build     # Production build
yarn preview   # Preview production build
yarn lint      # ESLint
```

---

## Code Style

### JavaScript/TypeScript

- **Quotes**: Single
- **Semicolons**: Required
- **Indentation**: 2 spaces
- **Line endings**: LF
- **Module system**: ES modules

### Naming

- **Components**: PascalCase (`UserProfile.tsx`)
- **Functions/Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Interfaces/Types**: PascalCase

### Imports

```typescript
// React/libraries first, then local
import { useState } from "react";
import { fetchUser } from "@/api/user";
import Button from "./components/Button";
```

- Use named exports

```typescript
export const Component = () =>{};

### Architecture

- Use fsd architecture

### TypeScript

- Strict mode enabled
- Prefer `interface` for objects, `type` for unions

### React

- Functional components only
- Destructure props in parameters
- Include all dependencies in `useEffect`

---

## Technology Stack

- Vite 8, React 19, TypeScript 5.9, Mantine UI
- ESLint 9, ES2023 target

---

## CI/CD

- Hexlet automated checking (`.github/workflows/hexlet-check.yml`)
- **Do not modify** the Hexlet workflow file
```
