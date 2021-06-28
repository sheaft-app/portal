<script>
	import { onDestroy } from "svelte";
	import { fullScreenMap } from "../../../stores/app"; 
    import L from 'leaflet';
	
	fullScreenMap.set(true);

	let map;

	onDestroy(() => {
		fullScreenMap.set(false);
	})
    
    const meLocation = [45.784241690370365, 6.037268006613801];
    const destinationLocation = [45.87884472947742, 6.089757988365797];
    const otherStops = [
        [45.914398049039654, 6.092165631341254],
        [45.93926243060429, 6.122586492350054]
    ];

    const initialView = [45.914398049039654, 6.092165631341254];
    
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
		html: `<div class="marker"><div class="destination-icon"></div><div class="marker-text">Biocoop Semnoz</div></div>`,
		className: 'destination-marker'
	});
    
    const stopIcon = L.divIcon({
		html: `<div class="marker"><div class="stop-icon"></div></div>`,
		className: 'stop-marker'
	});
    
    function mapAction(container) {
        map = createMap(container); 
		
		const otherStopsLayer = L.layerGroup();
		const meLayer = L.layerGroup();
        const destinationLayer = L.layerGroup();
        
 		for(let location of otherStops) {
 			let m = L.marker(location, { icon: stopIcon })
            otherStopsLayer.addLayer(m);
         }
        
		meLayer.addLayer(L.marker(meLocation, { icon: meIcon }));
        destinationLayer.addLayer(L.marker(destinationLocation, { icon: destinationIcon }));
        
        otherStopsLayer.addTo(map);
        meLayer.addTo(map);
		destinationLayer.addTo(map);
		
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

<div class="fixed left-0 bg-white w-full bottom-0 shadow-xl rounded-t-3xl py-2 px-4" style="z-index: 99999;">
	<p class="text-gray-600 text-lg">On se dirige vers...</p>
	<p class="text-primary text-2xl uppercase font-semibold">Biocoop Semnoz</p>
	<div class="text-lg">
		<p>12 avenue du gadada</p>
		<p>74600 Seynod</p>
	</div>
	<div class="flex justify-end space-x-2">
		<button class="btn btn-outline btn-lg">Quitter le module</button>
		<button class="btn btn-accent btn-lg">Je suis arrivé</button>
	</div>
</div>

<style lang="scss">
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

<div class="map" style="height:100%;width:100%" use:mapAction />