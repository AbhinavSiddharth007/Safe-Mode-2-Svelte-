import type { Meta, StoryObj } from '@storybook/sveltekit';
import WarningForm from '$components/WarningForm.svelte';

const meta = {
	title: 'Components/WarningForm',
	component: WarningForm,
	args: {
		selectedLocation: {
			latitude: 40.4168,
			longitude: -3.7038
		},
		onLocationClear: () => undefined,
		onCreated: () => undefined
	},
	tags: ['autodocs']
} satisfies Meta<typeof WarningForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutLocation: Story = {
	args: {
		selectedLocation: null
	}
};
