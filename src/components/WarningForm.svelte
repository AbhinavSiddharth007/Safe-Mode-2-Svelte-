<svelte:options runes={false} />

<script lang="ts">
	import { addWarning } from '$lib/api';
	import { formatLocationInput, type Coordinates } from '$lib/location';

	export let selectedLocation: Coordinates | null;
	export let onLocationClear: () => void;
	export let onCreated: (() => Promise<void> | void) | undefined = undefined;

	let message = '';
	let errorMessage: string | null = null;
	let isSubmitting = false;

	$: isDisabled = isSubmitting || !selectedLocation;

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		const nextMessage = message.trim();

		if (!nextMessage) {
			errorMessage = 'Enter a warning message before submitting.';
			return;
		}

		if (!selectedLocation) {
			errorMessage = 'Select a location on the map before submitting.';
			return;
		}

		try {
			isSubmitting = true;
			errorMessage = null;

			await addWarning({
				message: nextMessage,
				latitude: selectedLocation.latitude,
				longitude: selectedLocation.longitude
			});

			message = '';
			onLocationClear();
			await onCreated?.();
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Unable to submit warning.';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<section
	class="rounded-[28px] border border-black/10 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)]"
	data-testid="warning-form"
>
	<div class="flex items-start justify-between gap-4">
		<div>
			<p class="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">Submit warning</p>
			<h2 class="mt-1 text-xl font-semibold text-slate-950">Report a location-based warning</h2>
		</div>
		<span
			class={`rounded-full px-3 py-1 text-xs font-medium ${
				selectedLocation ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
			}`}
		>
			{selectedLocation ? 'Location selected' : 'Select map location'}
		</span>
	</div>

	<form on:submit={handleSubmit} class="mt-5 space-y-4">
		<label class="block">
			<span class="mb-2 block text-sm font-medium text-slate-700">Message</span>
			<textarea
				bind:value={message}
				placeholder="Describe the warning for people near this location."
				rows="4"
				class="w-full resize-none rounded-2xl border border-black/10 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:bg-white"
			></textarea>
		</label>

		<div class="block">
			<div class="mb-2 flex items-center justify-between gap-4">
				<span class="text-sm font-medium text-slate-700">Selected location</span>
				{#if selectedLocation}
					<button
						type="button"
						on:click={onLocationClear}
						class="text-xs font-medium text-slate-500 transition hover:text-slate-900"
					>
						Clear
					</button>
				{/if}
			</div>
			<div
				class="rounded-2xl border border-black/10 bg-slate-50 px-4 py-3 font-mono text-sm text-slate-950"
			>
				{#if selectedLocation}
					{formatLocationInput(selectedLocation)}
				{:else}
					Click a point on the map to attach a location.
				{/if}
			</div>
			<p class="mt-2 text-xs text-slate-500">
				Warnings are submitted for the location you pick on the map.
			</p>
		</div>

		{#if errorMessage}
			<p class="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</p>
		{/if}

		<button
			type="submit"
			disabled={isDisabled}
			class="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
		>
			{isSubmitting ? 'Submitting...' : 'Submit warning'}
		</button>
	</form>
</section>
