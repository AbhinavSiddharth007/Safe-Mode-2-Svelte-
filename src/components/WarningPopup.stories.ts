import type { Meta, StoryObj } from '@storybook/sveltekit';
import WarningPopup from '$components/WarningPopup.svelte';

const meta = {
	title: 'Components/WarningPopup',
	component: WarningPopup,
	args: {
		warningGroup: {
			key: '40.417,-3.704',
			latitude: 40.417,
			longitude: -3.704,
			totalWarnings: 3,
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
					message: 'Large crowd near Plaza Mayor',
					latitude: 40.4169,
					longitude: -3.7039,
					timestamp: 1712484600000
				},
				{
					id: 'warning-3',
					message: 'Police redirecting traffic',
					latitude: 40.4171,
					longitude: -3.704,
					timestamp: 1712488200000
				}
			]
		}
	},
	tags: ['autodocs']
} satisfies Meta<typeof WarningPopup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
