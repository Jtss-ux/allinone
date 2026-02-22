import { test, expect } from '@playwright/test';

test.describe('File Converter Tool', () => {
    test('should load the file converter interface', async ({ page }) => {
        // Navigate to the app (assuming default port 3000)
        await page.goto('/');

        // Click on the File Converter in the sidebar
        await page.click('button:has-text("File Converter")');

        // Check if the component rendered
        await expect(page.locator('h3:has-text("Universal File Converter")')).toBeVisible();

        // Verify file input exists
        await expect(page.locator('input[type="file"]')).toBeAttached();
    });
});
