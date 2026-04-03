<svelte:options runes={false} />

<script lang="ts">
	import { browser } from '$app/environment';
	import type { Coordinates } from '$lib/location';
	import type { WarningLocationGroup } from '$lib/types';
	import MarkerComponent from '$components/Marker.svelte';
	import { mount, onMount, unmount } from 'svelte';
	import type { Map as MapboxMap, Marker as MapboxMarker } from 'mapbox-gl';

	const DEFAULT_CENTER: [number, number] = [-3.7038, 40.4168];
	const FALLBACK_LONGITUDE_SPAN = 0.08;
	const FALLBACK_LATITUDE_SPAN = 0.05;
	const MAPBOX_TOKEN =
		import.meta.env.NEXT_PUBLIC_MAPBOX_TOKEN || import.meta.env.PUBLIC_MAPBOX_TOKEN || '';

	type MountedMarker = {
		marker: MapboxMarker;
		component: object;
	};

	export let warningGroups: WarningLocationGroup[] = [];
	export let className = '';
	export let selectedLocation: Coordinates | null = null;
	export let onLocationSelect: ((location: Coordinates) => void) | undefined = undefined;
	export let onWarningSelect: ((warningGroup: WarningLocationGroup) => void) | undefined =
		undefined;

	let mapContainer: HTMLDivElement | null = null;
	let map: MapboxMap | null = null;
	let userMarker: MapboxMarker | null = null;
	let selectedLocationMarker: MapboxMarker | null = null;
	let warningMarkers: MountedMarker[] = [];
	let message = MAPBOX_TOKEN
		? 'Loading map...'
		: 'Maps: ';
	let mapReady = false;
	let mapboxglModule: typeof import('mapbox-gl') | null = null;

	function clamp(value: number, min: number, max: number) {
		return Math.min(Math.max(value, min), max);
	}

	function longitudeToPercent(longitude: number) {
		const minLongitude = DEFAULT_CENTER[0] - FALLBACK_LONGITUDE_SPAN / 2;
		return clamp(((longitude - minLongitude) / FALLBACK_LONGITUDE_SPAN) * 100, 4, 96);
	}

	function latitudeToPercent(latitude: number) {
		const maxLatitude = DEFAULT_CENTER[1] + FALLBACK_LATITUDE_SPAN / 2;
		return clamp(((maxLatitude - latitude) / FALLBACK_LATITUDE_SPAN) * 100, 6, 94);
	}

	function clearWarningMarkers() {
		for (const mountedMarker of warningMarkers) {
			void unmount(mountedMarker.component);
			mountedMarker.marker.remove();
		}

		warningMarkers = [];
	}

	function syncWarningMarkers() {
		if (!browser || !map) {
			return;
		}

		clearWarningMarkers();

		for (const warningGroup of warningGroups) {
			const target = document.createElement('div');
			const component = mount(MarkerComponent, {
				target,
				props: {
					totalWarnings: warningGroup.totalWarnings,
					latitude: warningGroup.latitude,
					longitude: warningGroup.longitude,
					interactive: Boolean(onWarningSelect),
					onSelect: () => onWarningSelect?.(warningGroup)
				}
			});

			if (!mapboxglModule) {
				continue;
			}

			const marker = new mapboxglModule.default.Marker(target)
				.setLngLat([warningGroup.longitude, warningGroup.latitude])
				.addTo(map);

			warningMarkers = [...warningMarkers, { marker, component }];
		}
	}

	function syncSelectedLocationMarker() {
		if (!browser || !map) {
			return;
		}

		selectedLocationMarker?.remove();
		selectedLocationMarker = null;

		if (!selectedLocation) {
			return;
		}

		if (!mapboxglModule) {
			return;
		}

		selectedLocationMarker = new mapboxglModule.default.Marker({
			color: '#10b981'
		})
			.setLngLat([selectedLocation.longitude, selectedLocation.latitude])
			.addTo(map);
	}

	function handleFallbackClick(event: MouseEvent) {
		const target = event.currentTarget as HTMLDivElement | null;

		if (!target) {
			return;
		}

		const bounds = target.getBoundingClientRect();
		const relativeX = (event.clientX - bounds.left) / bounds.width;
		const relativeY = (event.clientY - bounds.top) / bounds.height;
		const minLongitude = DEFAULT_CENTER[0] - FALLBACK_LONGITUDE_SPAN / 2;
		const maxLatitude = DEFAULT_CENTER[1] + FALLBACK_LATITUDE_SPAN / 2;

		onLocationSelect?.({
			latitude: Number((maxLatitude - relativeY * FALLBACK_LATITUDE_SPAN).toFixed(6)),
			longitude: Number((minLongitude + relativeX * FALLBACK_LONGITUDE_SPAN).toFixed(6))
		});
	}

	function handleFallbackKeydown(event: KeyboardEvent) {
		if (event.key !== 'Enter' && event.key !== ' ') {
			return;
		}

		event.preventDefault();
		handleFallbackClick(event as unknown as MouseEvent);
	}

	$: if (mapReady) {
		syncWarningMarkers();
	}

	$: if (mapReady) {
		syncSelectedLocationMarker();
	}

	onMount(() => {
		if (!browser || !mapContainer || !MAPBOX_TOKEN) {
			return () => undefined;
		}

		let destroyed = false;

		void (async () => {
			try {
				const module = await import('mapbox-gl');
				const mapboxgl = module.default;
				mapboxglModule = module;
				mapboxgl.accessToken = MAPBOX_TOKEN;

				const nextMap = new mapboxgl.Map({
					container: mapContainer,
					style: 'mapbox://styles/mapbox/streets-v12',
					center: DEFAULT_CENTER,
					zoom: 11,
					pitch: 55,
					antialias: true
				});

				if (destroyed) {
					nextMap.remove();
					return;
				}

				map = nextMap;
				map.addControl(new mapboxgl.NavigationControl(), 'top-right');
				map.on('load', () => {
					message = 'Map ready. Click to choose a location.';
					mapReady = true;
				});
				map.on('click', (mapEvent) => {
					onLocationSelect?.({
						latitude: Number(mapEvent.lngLat.lat.toFixed(6)),
						longitude: Number(mapEvent.lngLat.lng.toFixed(6))
					});
				});
				map.on('error', () => {
					message = 'Map tiles could not be loaded.';
				});

				if (navigator.geolocation) {
					navigator.geolocation.getCurrentPosition(
						({ coords }) => {
							if (!map) {
								return;
							}

							map.flyTo({
								center: [coords.longitude, coords.latitude],
								zoom: 13,
								essential: true
							});
							userMarker?.remove();
							userMarker = new mapboxgl.Marker({ color: '#0f172a' })
								.setLngLat([coords.longitude, coords.latitude])
								.addTo(map);
							message = 'Centered on your location.';
						},
						() => {
							message = 'Using the default map center.';
						},
						{ enableHighAccuracy: true }
					);
				}
			} catch {
				message = 'Map preview mode. Add a valid Mapbox token for live tiles.';
			}
		})();

		return () => {
			destroyed = true;
			clearWarningMarkers();
			userMarker?.remove();
			userMarker = null;
			selectedLocationMarker?.remove();
			selectedLocationMarker = null;
			map?.remove();
			map = null;
			mapReady = false;
			mapboxglModule = null;
		};
	});
</script>

<section
	class={`relative w-full overflow-hidden ${className || 'h-screen'}`}
	data-testid="map-view"
>
	{#if MAPBOX_TOKEN}
		<div bind:this={mapContainer} class="h-full w-full"></div>
	{:else}
		<div
			class="fallback-map-surface h-full w-full"
			data-testid="fallback-map"
			role="button"
			tabindex="0"
			on:click={handleFallbackClick}
			on:keydown={handleFallbackKeydown}
		>
			<div
				class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.18),transparent_35%),linear-gradient(135deg,#0f172a_0%,#1e293b_55%,#334155_100%)]"
			></div>
			<div
				class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px]"
			></div>
		</div>

		<div class="pointer-events-none absolute inset-0">
			{#each warningGroups as warningGroup (warningGroup.key)}
				<div
					class="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2"
					style:left={`${longitudeToPercent(warningGroup.longitude)}%`}
					style:top={`${latitudeToPercent(warningGroup.latitude)}%`}
					style:z-index={String(warningGroup.totalWarnings)}
				>
					<MarkerComponent
						totalWarnings={warningGroup.totalWarnings}
						latitude={warningGroup.latitude}
						longitude={warningGroup.longitude}
						interactive={Boolean(onWarningSelect)}
						onSelect={() => onWarningSelect?.(warningGroup)}
					/>
				</div>
			{/each}

			{#if selectedLocation}
				<div
					class="absolute -translate-x-1/2 -translate-y-1/2"
					style:left={`${longitudeToPercent(selectedLocation.longitude)}%`}
					style:top={`${latitudeToPercent(selectedLocation.latitude)}%`}
				>
					<div class="h-4 w-4 rounded-full border-2 border-white bg-emerald-500 shadow-lg"></div>
				</div>
			{/if}
		</div>
	{/if}

	<div
		class="pointer-events-none absolute left-4 top-4 rounded-full bg-white/90 px-4 py-2 text-sm text-slate-700 shadow-lg backdrop-blur"
	>
		{message}
	</div>
</section>
