<svelte:options runes={false} />

<script lang="ts">
	import { onMount } from 'svelte';
	import { getWarnings } from '$lib/api';
	import { formatTimestamp } from '$lib/utils';
	import type { Warning } from '$lib/types';

	let warnings: Warning[] = [];
	let errorMessage: string | null = null;

	async function refreshWarnings() {
		try {
			warnings = await getWarnings();
			errorMessage = null;
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Unable to load warnings.';
		}
	}

	onMount(() => {
		void refreshWarnings();
	});
</script>

<div class="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
	<section
		class="rounded-[32px] border border-black/10 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-6"
	>
		<div class="flex items-end justify-between gap-4 border-b border-black/10 pb-4">
			<div>
				<p class="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Live feed</p>
				<h2 class="mt-1 text-2xl font-semibold text-slate-950">Most recent warnings</h2>
			</div>
			<p class="text-sm text-slate-500">{warnings.length} warnings</p>
		</div>

		{#if errorMessage}
			<p class="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</p>
		{/if}

		<div class="mt-5 space-y-3">
			{#if warnings.length}
				{#each warnings as warning (warning.id)}
					<article class="rounded-3xl border border-black/10 bg-slate-50 p-4">
						<div class="flex items-start justify-between gap-4">
							<div>
								<h3 class="mt-2 text-lg font-semibold text-slate-950">{warning.message}</h3>
							</div>
							<time class="text-right text-sm text-slate-500">
								{formatTimestamp(warning.timestamp)}
							</time>
						</div>
						<p class="mt-3 text-sm text-slate-600">
							{warning.latitude.toFixed(4)}, {warning.longitude.toFixed(4)}
						</p>
					</article>
				{/each}
			{:else}
				<p class="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-600">
					No warnings yet. New reports will appear here instantly.
				</p>
			{/if}
		</div>
	</section>
</div>
