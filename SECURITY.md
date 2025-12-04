# Security Policy

## Supported Versions

The following versions of ForgeGrid are currently supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

### Do Not

- Do not open a public GitHub issue for security vulnerabilities
- Do not disclose the vulnerability publicly until it has been addressed

### Do

1. **Email us directly** at dev@forgelab.io with:
   - A description of the vulnerability
   - Steps to reproduce the issue
   - Potential impact assessment
   - Any suggested fixes (optional)

2. **Allow time for response**
   - We aim to acknowledge receipt within 48 hours
   - We will provide an estimated timeline for a fix
   - We will keep you informed of our progress

3. **Coordinated disclosure**
   - We will work with you to understand and address the issue
   - Once fixed, we will publicly acknowledge your contribution (unless you prefer to remain anonymous)

## Security Best Practices

This project follows security best practices including:

- Regular dependency updates
- Content Security Policy headers (when deployed)
- HTTPS enforcement
- Input validation and sanitization
- No sensitive data storage in client-side code

## Scope

The following are in scope for security reports:

- The landing page application (index.html, en.html)
- JavaScript files (assets/js/)
- CSS files (assets/css/)
- GitHub Actions workflows

Out of scope:

- Third-party CDN resources (Tailwind CSS, Google Fonts)
- Issues in dependencies that have been reported upstream

## Recognition

We appreciate the security research community's efforts in helping keep ForgeGrid secure. Contributors who report valid security issues will be acknowledged in our release notes (unless they prefer anonymity).

Thank you for helping keep ForgeGrid and its users safe!
