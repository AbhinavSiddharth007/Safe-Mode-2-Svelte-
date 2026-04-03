import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Marker from '$components/Marker.svelte';

describe('Marker', () => {
	it('renders the grouped warning label and count', () => {
		render(Marker, {
			totalWarnings: 4,
			latitude: 40.4168,
			longitude: -3.7038
		});

		expect(
			screen.getByRole('button', { name: '4 warnings near 40.417, -3.704' })
		).toHaveTextContent('4');
	});

	it('calls onSelect when interactive', async () => {
		const user = userEvent.setup();
		const onSelect = vi.fn();

		render(Marker, {
			totalWarnings: 11,
			latitude: 40.4168,
			longitude: -3.7038,
			interactive: true,
			onSelect
		});

		await user.click(screen.getByRole('button', { name: '11 warnings near 40.417, -3.704' }));

		expect(onSelect).toHaveBeenCalledTimes(1);
	});
});
