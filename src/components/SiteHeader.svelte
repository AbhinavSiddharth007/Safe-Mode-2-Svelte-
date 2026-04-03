<svelte:options runes={false} />

<script lang="ts">
	import { resolve } from '$app/paths';

	const links = [
		{ href: '/', label: 'Map' },
		{ href: '/feed', label: 'Feed' }
	] as const;
</script>

<header class="border-b border-black/10 bg-white/90 backdrop-blur">
	<div class="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
		<div>
			<p class="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Safe Mode</p>
			<h1 class="text-lg font-semibold text-slate-950">Live disruption tracker</h1>
		</div>
		<nav class="flex items-center gap-2 rounded-full border border-black/10 bg-slate-50 p-1">
			{#each links as link (link.href)}
				<a
					href={resolve(link.href)}
					class="rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-white hover:text-slate-950"
				>
					{link.label}
				</a>
			{/each}
		</nav>
	</div>
</header>
