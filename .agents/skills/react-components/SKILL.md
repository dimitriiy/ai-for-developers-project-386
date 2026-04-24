---
name: react-architecture
description: Use when working with React components. Keep components reasonably small, avoid pointless over-splitting, and extract heavy logic into custom hooks.
---

# React Architecture

- Do not write large components.
- Split components when it improves readability, separation of responsibility, or reuse.
- Do not create tiny components without a clear reason.
- Keep components focused on UI and composition.
- Move heavy business logic, side effects, async flows, and data transformations into custom hooks.
- If JSX becomes noisy, extract components.
- If logic becomes heavy, extract a hook.