import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import WarningPopup from '$components/WarningPopup.svelte';

const warningGroup = {
	key: '40.417,-3.704',
	latitude: 40.417,
	longitude: -3.704,
	totalWarnings: 2,
	warnings: [
		{
			id: 'warning-1',
			message: 'Road blocked near Sol',
			latitude: 40.4168,
			longitude: -3.7038,
			timestamp: 1712481000000
		},
		{
			id: 'warning-2',
			message: 'Police redirecting traffic',
			latitude: 40.4171,
			longitude: -3.704,
			timestamp: 1712484600000
		}
	]
};

describe('WarningPopup', () => {
	it('renders the selected location details and messages', () => {
		render(WarningPopup, {
			warningGroup
		});

		expect(screen.getByText('2 warnings nearby')).toBeInTheDocument();
		expect(screen.getByText('Road blocked near Sol')).toBeInTheDocument();
		expect(screen.getByText('Police redirecting traffic')).toBeInTheDocument();
	});

	it('notifies the parent when closed', async () => {
		const user = userEvent.setup();
		const onClose = vi.fn();

		render(WarningPopup, {
			warningGroup,
			onClose
		});

		await user.click(screen.getByRole('button', { name: 'Close' }));

		expect(onClose).toHaveBeenCalledTimes(1);
	});
});
