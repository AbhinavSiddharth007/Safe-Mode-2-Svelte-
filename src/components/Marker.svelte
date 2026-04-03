<svelte:options runes={false} />

<script lang="ts">
	import { getWarningMarkerColor } from '$lib/warning-marker-color';

	export let totalWarnings: number;
	export let latitude: number | null = null;
	export let longitude: number | null = null;
	export let interactive = false;
	export let onSelect: (() => void) | undefined = undefined;

	$: backgroundColor = getWarningMarkerColor(totalWarnings);
	$: textColor = totalWarnings >= 10 ? '#ffffff' : '#0f172a';
	$: ariaLabel =
		latitude === null || longitude === null
			? `${totalWarnings} warnings`
			: `${totalWarnings} warnings near ${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;

	function handleClick(event: MouseEvent) {
		if (!interactive || !onSelect) {
			return;
		}

		event.stopPropagation();
		onSelect();
	}
</script>

<button
	type="button"
	aria-label={ariaLabel}
	title={`${totalWarnings} warnings`}
	class={`flex min-h-7 min-w-7 items-center justify-center rounded-full border-2 border-white px-2 text-xs font-semibold shadow-lg transition ${
		interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
	}`}
	style:background-color={backgroundColor}
	style:color={textColor}
	on:click={handleClick}
>
	{totalWarnings}
</button>
