## Contributing

Thanks for your interest in contributing! This short guide explains how to get the project running locally and the preferred workflow for small changes.

1. Fork the repository and create a feature branch from `main`:

```bash
git checkout -b feat/your-feature
```

2. Set up the project locally (see DEV_COMMANDS.md for full commands).

3. Make small, focused commits with clear messages. Keep changes scoped to a single concern per branch.

4. Follow the existing code style:
- JavaScript/React: follow the project's lint rules (if present) and use Prettier formatting.
- Tailwind utility classes are used for styling — keep class order readable.

5. Testing & checks:
- Run the app locally and manually verify your feature.
- If you add server logic, include basic validation and consider adding tests.

6. Push your branch and open a Pull Request (PR):
- Describe the purpose of the change and include screenshots or steps to reproduce where relevant.
- Keep PRs small; large refactors are easier to review when broken into parts.

7. Respond to review feedback and update your PR until it is approved.

Thanks — contributions are welcome! If you're planning larger architecture changes (storage, auth, or DB migrations), open an issue first to discuss design and impact.
