import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import WarningForm from '$components/WarningForm.svelte';
import { addWarning } from '$lib/api';

vi.mock('$lib/api', () => ({
	addWarning: vi.fn()
}));

describe('WarningForm', () => {
	beforeEach(() => {
		vi.mocked(addWarning).mockReset();
	});

	it('disables submission until a map location has been selected', () => {
		render(WarningForm, {
			selectedLocation: null,
			onLocationClear: vi.fn()
		});

		expect(screen.getByRole('button', { name: 'Submit warning' })).toBeDisabled();
	});

	it('submits a warning and clears the selected location', async () => {
		const user = userEvent.setup();
		const onLocationClear = vi.fn();
		const onCreated = vi.fn();

		vi.mocked(addWarning).mockResolvedValue({
			id: 'warning-1',
			message: 'Bridge temporarily closed',
			latitude: 40.4168,
			longitude: -3.7038,
			timestamp: 1712488200000
		});

		render(WarningForm, {
			selectedLocation: {
				latitude: 40.4168,
				longitude: -3.7038
			},
			onLocationClear,
			onCreated
		});

		await user.type(
			screen.getByRole('textbox', { name: 'Message' }),
			'  Bridge temporarily closed  '
		);
		await user.click(screen.getByRole('button', { name: 'Submit warning' }));

		await waitFor(() => {
			expect(addWarning).toHaveBeenCalledWith({
				message: 'Bridge temporarily closed',
				latitude: 40.4168,
				longitude: -3.7038
			});
		});

		expect(onLocationClear).toHaveBeenCalledTimes(1);
		expect(onCreated).toHaveBeenCalledTimes(1);
	});
});
