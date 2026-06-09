import { test, expect } from '@playwright/test';

test.describe('Admin Access & Security', () => {
  test('typing /admin in chatbot redirects to admin page', async ({ page }) => {
    await page.goto('/');

    // The chatbot is already open in the DOM but maybe we need to click the toggle button
    const toggleButton = page.locator('button.bg-\\[\\#DBAC35\\]').last();
    await toggleButton.click();

    // Type /admin in the textarea
    const input = page.locator('#chat-input-textarea');
    await input.fill('/admin');
    await input.press('Enter');

    // Should be redirected to Login page because not authenticated
    await expect(page).toHaveURL(/\/Account\/Login/);
  });

  test('unauthenticated user cannot access /admin directly', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/Account\/Login/);
  });

  test('admin can login and access dashboard', async ({ page }) => {
    await page.goto('/Account/Login');

    // Use test credentials
    await page.fill('input[name*="Email"]', 'test@gmail.com');
    await page.fill('input[name*="Password"]', 'Test1234!');
    await page.click('button[type="submit"]');

    // Should be redirected to /admin
    await expect(page).toHaveURL(/\/admin/);
    // Use a more specific locator for the main header to avoid strict mode violation
    await expect(page.locator('main header h1')).toContainText('Course Catalog');
  });
});

test.describe('Admin Dashboard Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/Account/Login');
    await page.fill('input[name*="Email"]', 'test@gmail.com');
    await page.fill('input[name*="Password"]', 'Test1234!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin/);
  });

  test('can add and then delete a course', async ({ page }) => {
    // Click Add Course
    await page.click('button:has-text("Add Course")');

    // Fill course details - use the layout since aria-labels might be missing
    // The modal has z-50 and backdrop-blur-sm
    const modal = page.locator('div.fixed.inset-0.z-50').filter({ hasText: 'Add New Course' });
    await modal.waitFor({ state: 'visible' });

    await modal.locator('input').first().fill('E2E Test Course'); // Title
    await modal.locator('input').nth(1).fill('Test Category'); // Category

    await page.click('button:has-text("Save Course")');

    // Verify course appears in list
    await expect(page.locator('table')).toContainText('E2E Test Course');

    // Delete the course
    await page.locator('tr:has-text("E2E Test Course") button').last().click();
    await page.click('button:has-text("Yes, Delete It")');

    // Verify it's gone
    await expect(page.locator('table')).not.toContainText('E2E Test Course');
  });

  test('can switch between admin tabs', async ({ page }) => {
    await page.click('button:has-text("Configuration")');
    await expect(page.locator('main header h1')).toContainText('Bot Configuration');

    await page.click('button:has-text("User Management")');
    await expect(page.locator('main header h1')).toContainText('User Management');
  });
});
