<svelte:options runes={false} />

<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import SiteHeader from '$components/SiteHeader.svelte';
</script>

<svelte:head>
	<title>Safe Mode | Live Disruption Tracker</title>
	<meta name="description" content="Track live public disruptions on a real-time city map." />
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="flex min-h-screen flex-col">
	<SiteHeader />
	<slot />
</div>
