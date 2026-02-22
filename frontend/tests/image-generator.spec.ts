import { test, expect } from '@playwright/test';

test.describe('Image Generator Tool', () => {
    test('should load the image generator interface', async ({ page }) => {
        // Navigate to the app (assuming default port 3000)
        await page.goto('/');

        // Click on the Image Generator in the sidebar
        await page.click('button:has-text("Image Generator")');

        // Check if the component rendered
        await expect(page.locator('h3:has-text("AI Image Generator")')).toBeVisible();

        // Verify inputs exist
        await expect(page.locator('textarea[placeholder*="Describe the image"]')).toBeVisible();
        await expect(page.locator('button:has-text("Generate Image")')).toBeVisible();

        // Try to type a prompt
        await page.fill('textarea[placeholder*="Describe the image"]', 'A futuristic cyber city at sunset');
        await expect(page.locator('textarea[placeholder*="Describe the image"]')).toHaveValue('A futuristic cyber city at sunset');
    });
});
