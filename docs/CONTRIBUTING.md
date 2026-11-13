# 🤝 Contributing to PayFlow

Contributions are welcome! Please follow these development standards:

## Branching Strategy
- `main`: Production-ready code only.
- `develop`: Integration branch.
- `feature/<name>`: Feature slices and milestone deliverables.

## Code Standards
- **TypeScript**: Strict mode enabled (`strict: true`). No `any` types where possible.
- **Linting & Formatting**:
  ```bash
  npm run lint
  npm run format
  ```
- **Tests**: Write unit tests for all domain logic and integration tests for new endpoints.
  ```bash
  npm test
  ```

## Commit Message Convention
Follow Conventional Commits:
- `feat: ...` for new features
- `fix: ...` for bug fixes
- `docs: ...` for documentation
- `test: ...` for adding tests
- `chore: ...` for build and tooling changes
