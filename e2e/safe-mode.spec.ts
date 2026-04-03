import { expect, test } from '@playwright/test';

const clusteredWarnings = Array.from({ length: 11 }, (_, index) => ({
	id: `cluster-${index + 1}`,
	message: index === 0 ? 'Road blocked near Sol' : `Cluster warning ${index + 1}`,
	latitude: 40.4168 + index * 0.00001,
	longitude: -3.7038 - index * 0.00001,
	timestamp: 1712481000000 - index * 60_000
}));

const initialWarnings = [
	...clusteredWarnings,
	{
		id: 'secondary-1',
		message: 'Large crowd near Plaza Mayor',
		latitude: 40.4179,
		longitude: -3.7101,
		timestamp: 1712480400000
	}
];

test.describe('Safe Mode', () => {
	test.beforeEach(async ({ page }) => {
		let warnings = [...initialWarnings];

		await page.route('**/api/warnings', async (route) => {
			if (route.request().method() === 'GET') {
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify({ warnings })
				});
				return;
			}

			const payload = JSON.parse(route.request().postData() ?? '{}') as {
				latitude: number;
				longitude: number;
				message: string;
			};
			const warning = {
				id: 'created-warning',
				timestamp: 1712489000000,
				...payload
			};

			warnings = [warning, ...warnings];

			await route.fulfill({
				status: 201,
				contentType: 'application/json',
				body: JSON.stringify({ warning })
			});
		});
	});

	test('groups warnings and opens the selected location details', async ({ page }) => {
		await page.goto('/');

		await expect(page.getByText('12 warnings across 2 locations')).toBeVisible();
		await page.getByRole('button', { name: '11 warnings near 40.417, -3.704' }).click();

		await expect(page.getByTestId('warning-popup')).toContainText('11 warnings nearby');
		await expect(
			page.getByTestId('warning-popup').getByText('Road blocked near Sol')
		).toBeVisible();
	});

	test('submits a warning from the map and shows it in the feed', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByText('12 warnings across 2 locations')).toBeVisible();

		await page.getByTestId('fallback-map').evaluate((element) => {
			const bounds = element.getBoundingClientRect();
			element.dispatchEvent(
				new MouseEvent('click', {
					bubbles: true,
					clientX: bounds.left + 80,
					clientY: bounds.top + 320
				})
			);
		});
		await expect(page.getByText('Location selected')).toBeVisible();
		await page.getByRole('textbox', { name: 'Message' }).fill('Bridge temporarily closed');
		await page.getByRole('button', { name: 'Submit warning' }).click();

		await expect(page.getByText('Bridge temporarily closed')).toBeVisible();

		await page.goto('/feed');

		await expect(page.getByText('Bridge temporarily closed')).toBeVisible();
		await expect(page.getByText('13 warnings')).toBeVisible();
	});
});
