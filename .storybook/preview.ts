import '../src/app.css';
import type { Preview } from '@storybook/sveltekit';

const preview: Preview = {
	parameters: {
		layout: 'centered',
		controls: {
			matchers: {
				color: /(background|color)$/i
			}
		}
	}
};

export default preview;
