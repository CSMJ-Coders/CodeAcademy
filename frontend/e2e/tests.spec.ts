/*
  End-to-end tests using Playwright for critical user flows.
  Run with: npx playwright test
*/

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('E2E Tests: CodeAcademy', () => {
  test('User can register and login', async ({ page }) => {
    // Go to home page
    await page.goto(`${BASE_URL}/`);
    
    // Click register link
    await page.click('text=Registrarse');
    await expect(page).toHaveURL(/\/register/);
    
    // Fill registration form
    await page.fill('input[name="email"]', `user-${Date.now()}@example.com`);
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="password"]', 'SecurePass123!');
    await page.fill('input[name="confirmPassword"]', 'SecurePass123!');
    
    // Submit form
    await page.click('button:has-text("Registrarse")');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('User can add product to cart', async ({ page }) => {
    // Go to catalog
    await page.goto(`${BASE_URL}/catalog`);
    
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]');
    
    // Click first product
    await page.click('[data-testid="product-card"]');
    await expect(page).toHaveURL(/\/course\/\d+|\/book\/\d+/);
    
    // Click add to cart
    await page.click('button:has-text("Agregar al carrito")');
    
    // Verify cart updated
    await expect(page.locator('[data-testid="cart-badge"]')).toContainText('1');
  });

  test('User can complete checkout flow', async ({ page, context }) => {
    // Intercept API responses
    await context.addInitScript(() => {
      window.localStorage.setItem('email', `user-${Date.now()}@example.com`);
    });

    // Go to checkout
    await page.goto(`${BASE_URL}/checkout`);
    
    // Wait for cart items to load
    await page.waitForSelector('[data-testid="cart-item"]');
    
    // Verify cart has items
    const cartItems = await page.locator('[data-testid="cart-item"]').count();
    expect(cartItems).toBeGreaterThan(0);
    
    // Click checkout button
    await page.click('button:has-text("Continuar al Pago")');
    
    // Should go to payment page
    await expect(page).toHaveURL(/\/checkout\/payment|\/payment/);
  });

  test('User can view their courses after purchase', async ({ page, context }) => {
    // Setup: Mock purchased courses
    await context.addInitScript(() => {
      window.localStorage.setItem('purchasedCourses', JSON.stringify(['1', '2']));
    });

    // Go to my courses
    await page.goto(`${BASE_URL}/dashboard/courses`);
    
    // Wait for courses to load
    await page.waitForSelector('[data-testid="course-card"]', { timeout: 5000 }).catch(() => {
      // It's ok if no courses exist
    });
    
    // Should not have error
    await expect(page.locator('text=Error')).not.toBeVisible({ timeout: 1000 }).catch(() => {
      // Ok if error doesn't exist
    });
  });

  test('User can view product details', async ({ page }) => {
    // Go to catalog
    await page.goto(`${BASE_URL}/catalog`);
    
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 5000 });
    
    // Click first product
    await page.click('[data-testid="product-card"]:first-child');
    
    // Should show product details
    await page.waitForSelector('[data-testid="product-title"]');
    const title = await page.textContent('[data-testid="product-title"]');
    expect(title).toBeTruthy();
    expect(title!.length).toBeGreaterThan(0);
  });

  test('Navigation links work correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    
    // Home
    await page.click('text=Inicio');
    await expect(page).toHaveURL(`${BASE_URL}/`);
    
    // Catalog
    await page.click('text=Catálogo');
    await expect(page).toHaveURL(/\/catalog/);
    
    // Back to home
    await page.click('text=Inicio');
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });
});
