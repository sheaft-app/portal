<script>
	import { onDestroy } from "svelte";
	import { fullScreenMap } from "../../../stores/app"; 
    import L from 'leaflet';
	import GetRouterInstance from "../../../services/SheaftRouter";
import DeliveryBatchesRoutes from "../routes";

    export let meLocation;
	export let otherStops;
	export let destination;

	const routerInstance = GetRouterInstance();

	fullScreenMap.set(true);

	let map;

	onDestroy(() => {
		fullScreenMap.set(false);
	})

    const initialView = [destination.address.latitude, destination.address.longitude];
    
	function createMap(container) {
	    let m = L.map(container, { preferCanvas: true }).setView(initialView, 11);
        L.tileLayer(
            'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
            {
            attribution: `&copy;<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>,
                &copy;<a href="https://carto.com/attributions" target="_blank">CARTO</a>`,
            subdomains: 'abcd',
            maxZoom: 14,
            }
        ).addTo(m);

        return m;
    }
	
	const meIcon = L.divIcon({
		html: `<div class="marker"><div class="me-icon"></div><div class="marker-text">Vous</div></div>`,
		className: 'me-marker'
	});
    
    const destinationIcon = L.divIcon({
		html: `<div class="marker"><div class="destination-icon flex"><span class="text-white m-auto">${destination.position + 1}</span></div><div class="marker-text">${destination.client}</div></div>`,
		className: 'destination-marker'
	});
    
    const stopIcon = L.divIcon({
		html: `<div class="marker"><div class="stop-icon"></div></div>`,
		className: 'stop-marker'
	});
    
    function mapAction(container) {
        map = createMap(container); 
		
		const otherStopsLayer = L.featureGroup();
		const meLayer = L.featureGroup();
        const destinationLayer = L.featureGroup();
        
 		for(let location of otherStops) {
 			let m = L.marker(location, { icon: stopIcon })
            otherStopsLayer.addLayer(m);
         }
        
		meLayer.addLayer(L.marker(meLocation, { icon: meIcon }));
        destinationLayer.addLayer(L.marker([destination.address.latitude, destination.address.longitude], { icon: destinationIcon }));
        
        otherStopsLayer.addTo(map);
        meLayer.addTo(map);
		destinationLayer.addTo(map);

		map.fitBounds([
			meLayer.getBounds(),
			destinationLayer.getBounds(),
			otherStopsLayer.getBounds()
		]);
		
        return {
            destroy: () => {
                map.remove();
                map = null;
            }
        };
	}

	function resizeMap() {
	  if(map) { map.invalidateSize(); }
  }

</script>

<svelte:window on:resize={resizeMap} />
<button on:click={() => routerInstance.goTo(DeliveryBatchesRoutes.List)} class="absolute btn btn-lg btn-outline bg-white exit-button" style="z-index: 999;">Quitter le module</button>
<div class="map" style="height:100%;width:100%" use:mapAction />

<style>
	.exit-button {
		top: 1em;
		right: 1em;
	}
    .exit-button:not(:hover) {
        @apply bg-white !important;
    }

	.map :global(.marker-text) {
		@apply bg-white text-gray-800 shadow px-2 py-1 rounded-full shadow;
		text-align:center;
		width: max-content;
		font-weight:600;
		margin-top: 5px;
	}

	.map :global(.marker) {
		width: fit-content;
		max-width: 140px;
	}

	
	.map :global(.destination-icon) {
		@apply w-6 h-6 rounded-full shadow;
		background-color: #009688;
	}

	.map :global(.stop-icon) {
		@apply w-6 h-6 rounded-full opacity-75;
		background-color: #009688;
	}

	.map :global(.me-icon) {
		@apply w-8 h-8 rounded-full shadow-lg text-white;
		background-color: #ff4081;
	}

	.map :global(.map-marker) {
		width:30px;
		transform:translateX(-50%) translateY(-25%);
	}
</style>
