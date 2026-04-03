import { describe, expect, it } from 'vitest';
import {
	getWarningMarkerColor,
	WARNING_MARKER_RED,
	WARNING_MARKER_YELLOW
} from '$lib/warning-marker-color';
import { groupWarningsByLocation } from '$lib/utils';

describe('groupWarningsByLocation', () => {
	it('groups warnings by rounded location and sorts highest risk first', () => {
		const groups = groupWarningsByLocation([
			{
				id: 'warning-1',
				message: 'Road closure',
				latitude: 40.41681,
				longitude: -3.70381,
				timestamp: 3
			},
			{
				id: 'warning-2',
				message: 'Police redirecting traffic',
				latitude: 40.41684,
				longitude: -3.70382,
				timestamp: 2
			},
			{
				id: 'warning-3',
				message: 'Transit disruption',
				latitude: 40.4301,
				longitude: -3.7012,
				timestamp: 1
			}
		]);

		expect(groups).toHaveLength(2);
		expect(groups[0]?.totalWarnings).toBe(2);
		expect(groups[0]?.warnings).toHaveLength(2);
	});
});

describe('getWarningMarkerColor', () => {
	it('uses yellow for low-risk clusters and red for high-risk clusters', () => {
		expect(getWarningMarkerColor(3)).toBe(WARNING_MARKER_YELLOW);
		expect(getWarningMarkerColor(10)).toBe(WARNING_MARKER_RED);
	});
});
