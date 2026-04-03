import type { Meta, StoryObj } from '@storybook/sveltekit';
import Marker from '$components/Marker.svelte';

const meta = {
	title: 'Components/Marker',
	component: Marker,
	args: {
		totalWarnings: 4,
		latitude: 40.4168,
		longitude: -3.7038,
		interactive: true
	},
	tags: ['autodocs']
} satisfies Meta<typeof Marker>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const HighRisk: Story = {
	args: {
		totalWarnings: 12
	}
};
