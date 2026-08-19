# Form Validation Security Testing

[![CI Pipeline](https://github.com/Djones-qa/form-validation-security-testing/actions/workflows/ci.yml/badge.svg)](https://github.com/Djones-qa/form-validation-security-testing/actions/workflows/ci.yml)
[![Playwright](https://img.shields.io/badge/Playwright-45ba4b.svg?logo=playwright&logoColor=white)](https://playwright.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![OWASP](https://img.shields.io/badge/OWASP-Security-red.svg)](https://owasp.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

Form validation and input sanitization testing - XSS injection, SQL injection, boundary lengths, special characters. Found a real vulnerability: checkout form accepts malicious payloads without sanitization.

## Findings

| ID | Test | Result | Finding |
|----|------|--------|---------|
| FV-001 | XSS injection in login | PASS | Payloads not reflected in DOM |
| FV-002 | Empty field validation | PASS | Proper error messages shown |
| FV-003 | 1000-char boundary | PASS | Handled gracefully, no crash |
| FV-004 | XSS/SQLi in checkout | VULN | Accepts malicious input, proceeds to next page! |
| FV-005 | SQL injection in login | PASS | Payloads correctly rejected |

## Vulnerability Found

**FV-004: Checkout form accepts XSS and SQL injection payloads**

The checkout form on SauceDemo accepts these inputs without any validation:
- First Name: `!@#$%^&*()_+-=[]{}|;:,.<>?/~`
- Last Name: `<script>alert(1)</script>`
- Zip Code: `' OR 1=1 --`

All are accepted and the form proceeds to the order overview page. No input sanitization is applied.

## Tests Performed

- **XSS Injection** - script tags, img onerror, event handlers
- **SQL Injection** - OR 1=1, admin'--, DROP TABLE
- **Empty Fields** - Verify required field enforcement
- **Boundary Length** - 1000 character strings
- **Special Characters** - All keyboard special chars

## Video Evidence

Each test has video with green step labels and color-coded finding badges:
- Green PASS badge when validation works
- Red VULN badge when security gap detected

## Getting Started

```bash
git clone https://github.com/Djones-qa/form-validation-security-testing.git
cd form-validation-security-testing
npm install
npx playwright install chromium
npx playwright test --reporter=list
```

## Author

**Darrius Jones**

- GitHub: [@Djones-qa](https://github.com/Djones-qa)
- LinkedIn: [darrius-jones-28226b350](https://www.linkedin.com/in/darrius-jones-28226b350)

## License

MIT - 2026 Darrius Jones

See [LICENSE](./LICENSE) for details.
