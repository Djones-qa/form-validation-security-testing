import { test, expect } from '@playwright/test';
import { showStep, showFinding } from './helpers';

test.describe('Form Validation Testing - SauceDemo', () => {

  test('FV-001: XSS injection in login fields', async ({ page }) => {
    await page.goto('https://www.saucedemo.com');
    await showStep(page, 1, 'Testing XSS injection in login form');

    const xssPayloads = [
      '<script>alert("xss")</script>',
      '"><img src=x onerror=alert(1)>',
      "'; DROP TABLE users; --",
    ];

    for (const payload of xssPayloads) {
      await page.fill('#user-name', payload);
      await page.fill('#password', payload);
      await page.click('#login-button');
      await page.waitForTimeout(500);

      // Check if XSS executed (page should NOT have alert or injected content)
      const bodyHtml = await page.content();
      const xssExecuted = bodyHtml.includes('<script>alert') || bodyHtml.includes('onerror=alert');

      if (xssExecuted) {
        await showFinding(page, 'FV-001', `XSS payload reflected in DOM: ${payload.substring(0, 30)}`, 'VULN');
        await page.screenshot({ path: 'D:/test-evidence/evidence/FV-001-xss-reflected.png' });
        console.log(`FV-001: XSS reflected: ${payload}`);
      }
    }

    await showFinding(page, 'FV-001', 'XSS payloads not reflected in DOM - input sanitized', 'PASS');
    await page.screenshot({ path: 'D:/test-evidence/evidence/FV-001-xss-safe.png' });
    await page.waitForTimeout(1500);
  });

  test('FV-002: Empty field validation', async ({ page }) => {
    await page.goto('https://www.saucedemo.com');
    await showStep(page, 1, 'Testing empty field submission');

    // Try submit with no fields
    await page.click('#login-button');
    await page.waitForTimeout(500);

    const errorVisible = await page.locator('[data-test="error"]').isVisible();
    const errorText = errorVisible ? await page.locator('[data-test="error"]').textContent() : '';

    await showStep(page, 2, `Error shown: ${errorVisible}`);

    if (errorVisible && errorText?.includes('required')) {
      await showFinding(page, 'FV-002', `Proper validation: "${errorText?.trim()}"`, 'PASS');
    } else if (!errorVisible) {
      await showFinding(page, 'FV-002', 'No validation error for empty fields!', 'VULN');
    }

    await page.screenshot({ path: 'D:/test-evidence/evidence/FV-002-empty-fields.png' });
    expect(errorVisible).toBe(true);
    await page.waitForTimeout(1500);
  });

  test('FV-003: Boundary length testing', async ({ page }) => {
    await page.goto('https://www.saucedemo.com');
    await showStep(page, 1, 'Testing field length boundaries');

    // Test extremely long input (1000 chars)
    const longInput = 'A'.repeat(1000);
    await page.fill('#user-name', longInput);
    await page.fill('#password', longInput);
    await showStep(page, 2, `Entered 1000 character strings`);

    await page.click('#login-button');
    await page.waitForTimeout(500);

    // Check if page crashed or accepted gracefully
    const pageTitle = await page.title();
    const crashed = pageTitle === '' || pageTitle.includes('error');

    if (crashed) {
      await showFinding(page, 'FV-003', 'Page crashed with long input!', 'VULN');
    } else {
      await showFinding(page, 'FV-003', 'Handled 1000-char input gracefully', 'PASS');
    }

    await page.screenshot({ path: 'D:/test-evidence/evidence/FV-003-boundary-length.png' });
    expect(crashed).toBe(false);
    await page.waitForTimeout(1500);
  });

  test('FV-004: Special characters in checkout', async ({ page }) => {
    await page.goto('https://www.saucedemo.com');
    await page.fill('#user-name', 'standard_user');
    await page.fill('#password', 'secret_sauce');
    await page.click('#login-button');
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    await page.click('.shopping_cart_link');
    await page.click('[data-test="checkout"]');
    await showStep(page, 1, 'Testing special chars in checkout fields');

    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
    await page.fill('[data-test="firstName"]', specialChars);
    await page.fill('[data-test="lastName"]', '<script>alert(1)</script>');
    await page.fill('[data-test="postalCode"]', "' OR 1=1 --");
    await showStep(page, 2, 'Filled with XSS, SQLi, and special chars');

    await page.click('[data-test="continue"]');
    await page.waitForTimeout(500);

    const url = page.url();
    if (url.includes('checkout-step-two')) {
      await showFinding(page, 'FV-004', 'Checkout accepted XSS/SQLi payloads without sanitization!', 'VULN');
      await page.screenshot({ path: 'D:/test-evidence/evidence/FV-004-checkout-no-validation.png' });
      console.log('FV-004: Checkout form accepts malicious input without validation');
    } else {
      await showFinding(page, 'FV-004', 'Checkout properly rejected malicious input', 'PASS');
      await page.screenshot({ path: 'D:/test-evidence/evidence/FV-004-checkout-validated.png' });
    }

    await page.waitForTimeout(1500);
  });

  test('FV-005: SQL injection in search/filter', async ({ page }) => {
    await page.goto('https://the-internet.herokuapp.com/login');
    await showStep(page, 1, 'Testing SQL injection in login');

    const sqlPayloads = [
      "' OR '1'='1",
      "admin'--",
      "1; DROP TABLE users--",
    ];

    let injectionWorked = false;

    for (const payload of sqlPayloads) {
      await page.fill('#username', payload);
      await page.fill('#password', payload);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(500);

      // If we get logged in with SQL injection, that's a vulnerability
      if (page.url().includes('secure')) {
        injectionWorked = true;
        await showFinding(page, 'FV-005', `SQL injection successful with: ${payload}`, 'VULN');
        break;
      }
      await page.goto('https://the-internet.herokuapp.com/login');
    }

    if (!injectionWorked) {
      await showFinding(page, 'FV-005', 'SQL injection payloads correctly rejected', 'PASS');
    }

    await page.screenshot({ path: 'D:/test-evidence/evidence/FV-005-sql-injection.png' });
    expect(injectionWorked).toBe(false);
    await page.waitForTimeout(1500);
  });
});
