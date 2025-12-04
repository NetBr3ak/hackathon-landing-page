# Contributing to ForgeGrid

Thank you for your interest in contributing to ForgeGrid! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue using the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md). Include:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected vs. actual behavior
- Screenshots if applicable
- Browser and OS information

### Suggesting Features

Feature requests are welcome! Please use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md) and include:

- A clear description of the feature
- The problem it solves
- Any alternative solutions you've considered

### Pull Requests

1. **Fork the repository** and create your branch from `main`.
2. **Make your changes** following our coding standards.
3. **Test your changes** thoroughly.
4. **Update documentation** if needed.
5. **Submit a pull request** using our [PR template](.github/pull_request_template.md).

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/NetBr3ak/forge-page.git
   cd forge-page
   ```

2. Open `index.html` in your browser or use a local server:
   ```bash
   python -m http.server 8000
   # or
   npx serve
   ```

## Coding Standards

- Use semantic HTML5 elements
- Follow existing code style and formatting
- Keep CSS utility classes organized
- Write clear, descriptive commit messages using [Conventional Commits](https://www.conventionalcommits.org/)

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Example: `feat(hero): add video rotation animation`

## Questions?

Feel free to open an issue with your question or reach out to the maintainers.

Thank you for contributing!
