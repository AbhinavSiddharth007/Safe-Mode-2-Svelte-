<svelte:options runes={false} />

<script lang="ts">
	import { onMount } from 'svelte';
	import MapView from '$components/MapView.svelte';
	import WarningForm from '$components/WarningForm.svelte';
	import WarningPopup from '$components/WarningPopup.svelte';
	import { getWarnings } from '$lib/api';
	import type { Coordinates } from '$lib/location';
	import type { Warning, WarningLocationGroup } from '$lib/types';
	import { formatTimestamp, groupWarningsByLocation } from '$lib/utils';

	let warnings: Warning[] = [];
	let errorMessage: string | null = null;
	let isLoading = true;
	let selectedWarningGroup: WarningLocationGroup | null = null;
	let selectedLocation: Coordinates | null = null;
	let statusOverride: string | null = null;
	let isMounted = false;

	async function refreshWarnings() {
		if (!isMounted) {
			return;
		}

		isLoading = true;

		try {
			warnings = await getWarnings();
			errorMessage = null;
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Unable to load warnings.';
		} finally {
			if (isMounted) {
				isLoading = false;
			}
		}
	}

	$: latestWarning = warnings[0] ?? null;
	$: warningGroups = groupWarningsByLocation(warnings);
	$: topRiskAreas = warningGroups.slice(0, 5);
	$: statusMessage =
		statusOverride ??
		(isLoading
			? 'Loading warnings...'
			: warnings.length
				? `${warnings.length} warnings across ${warningGroups.length} locations`
				: 'No warnings yet. Create the first one.');

	onMount(() => {
		isMounted = true;
		void refreshWarnings();

		return () => {
			isMounted = false;
		};
	});
</script>

<div
	class="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1.7fr)_360px] lg:px-8"
>
	<section
		class="overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]"
	>
		<div class="flex items-center justify-between border-b border-black/10 px-5 py-4">
			<div>
				<h2 class="text-lg font-semibold text-slate-950">City map</h2>
				<p class="text-sm text-slate-600">{errorMessage ?? statusMessage}</p>
			</div>
			<p class="text-sm font-medium text-slate-500">Warnings</p>
		</div>

		<MapView
			{warningGroups}
			className="h-[62vh] min-h-[420px]"
			{selectedLocation}
			onLocationSelect={(location) => {
				selectedLocation = location;
			}}
			onWarningSelect={(warningGroup) => {
				selectedWarningGroup = warningGroup;
			}}
		/>
	</section>

	<aside class="space-y-6">
		{#if selectedWarningGroup}
			<WarningPopup
				warningGroup={selectedWarningGroup}
				onClose={() => {
					selectedWarningGroup = null;
				}}
			/>
		{/if}

		<WarningForm
			{selectedLocation}
			onLocationClear={() => {
				selectedLocation = null;
			}}
			onCreated={async () => {
				selectedWarningGroup = null;
				statusOverride = 'Warning submitted. Refreshing...';
				await refreshWarnings();
				statusOverride = null;
			}}
		/>

		<section
			class="rounded-[28px] border border-black/10 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)]"
		>
			<p class="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
				Latest activity
			</p>
			{#if latestWarning}
				<div class="mt-3 rounded-3xl bg-slate-50 p-4">
					<p class="text-sm font-medium text-slate-500">Warning</p>
					<h3 class="mt-1 text-lg font-semibold text-slate-950">{latestWarning.message}</h3>
					<p class="mt-2 text-sm text-slate-600">{formatTimestamp(latestWarning.timestamp)}</p>
				</div>
			{:else}
				<p class="mt-3 text-sm text-slate-600">
					The feed is empty right now. Add the first warning from the form above.
				</p>
			{/if}
		</section>

		<section
			class="rounded-[28px] border border-black/10 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)]"
		>
			<p class="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Top risk areas</p>
			{#if topRiskAreas.length}
				<div class="mt-3 space-y-3">
					{#each topRiskAreas as group, index (group.key)}
						<button
							type="button"
							on:click={() => {
								selectedWarningGroup = group;
							}}
							class="w-full rounded-3xl bg-slate-50 p-4 text-left text-sm text-slate-600 transition hover:bg-slate-100"
						>
							<div class="flex items-start justify-between gap-4">
								<div>
									<p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
										#{index + 1} risk area
									</p>
									<p class="mt-2 font-semibold text-slate-950">
										{group.latitude.toFixed(3)}, {group.longitude.toFixed(3)}
									</p>
									<p class="mt-1 text-xs text-slate-500">Tap to inspect reported messages</p>
								</div>
								<span class="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
									{group.totalWarnings}
								</span>
							</div>
						</button>
					{/each}
				</div>
			{:else}
				<p class="mt-3 text-sm text-slate-600">
					The highest-risk locations will appear here as warnings accumulate.
				</p>
			{/if}
		</section>
	</aside>
</div>
