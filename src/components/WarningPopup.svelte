<svelte:options runes={false} />

<script lang="ts">
	import { formatTimestamp } from '$lib/utils';
	import type { WarningLocationGroup } from '$lib/types';

	export let warningGroup: WarningLocationGroup;
	export let onClose: (() => void) | undefined = undefined;
</script>

<section
	class="rounded-[28px] border border-black/10 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)]"
	data-testid="warning-popup"
>
	<div class="flex items-start justify-between gap-4">
		<div>
			<p class="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
				Selected location
			</p>
			<h2 class="mt-1 text-xl font-semibold text-slate-950">
				{warningGroup.totalWarnings} warnings nearby
			</h2>
			<p class="mt-2 text-sm text-slate-600">
				{warningGroup.latitude.toFixed(3)}, {warningGroup.longitude.toFixed(3)}
			</p>
		</div>
		{#if onClose}
			<button
				type="button"
				on:click={onClose}
				class="text-sm text-slate-500 transition hover:text-slate-900"
			>
				Close
			</button>
		{/if}
	</div>

	<div class="mt-4 rounded-3xl bg-slate-50 p-4">
		<div class="flex items-center justify-between gap-4">
			<p class="text-sm font-medium text-slate-500">Reported messages</p>
			<p class="text-sm text-slate-500">{warningGroup.totalWarnings} total</p>
		</div>

		<div class="mt-3 max-h-72 space-y-3 overflow-y-auto pr-1">
			{#each warningGroup.warnings as warning (warning.id)}
				<article class="rounded-2xl border border-black/10 bg-white px-4 py-3">
					<p class="text-sm font-medium text-slate-950">{warning.message}</p>
					<p class="mt-1 text-xs text-slate-500">{formatTimestamp(warning.timestamp)}</p>
				</article>
			{/each}
		</div>
	</div>
</section>
