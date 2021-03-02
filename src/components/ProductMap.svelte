<script>
  import { onMount } from "svelte";
  import cartStore from "./../stores/cart";
  import "leaflet/dist/leaflet.css";
  import L from "leaflet";

  export let id, height, hoveredProduct, userPosition;

  var map = null;
  var currentMarker = null;
  var userMarker = null;
  var itemsMarkers = null;
  var position = {
    latitude: 0,
    longitude: 0
  };

  const renderMarker = () => {
    return L.divIcon({
      className: "custom-marker",
      html: `<svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="-46 0 512 512" width="25px" class="hovered-paths"><g><path d="m177.128906 232.5h64.609375l25.210938-55h-101.953125zm0 0" data-original="#000000" class="hovered-path active-path" data-old_color="#000000" fill="#205164"/><path d="m210 0c-115.792969 0-210 94.207031-210 210 0 93.359375 61.519531 175.210938 150.441406 201.429688l46.140625 92.277343c2.539063 5.082031 7.734375 8.292969 13.417969 8.292969 5.679688 0 10.875-3.210938 13.414062-8.292969l46.140626-92.277343c88.925781-26.214844 150.445312-108.070313 150.445312-201.429688 0-115.792969-94.207031-210-210-210zm-39.671875 304.5c-8.261719 0-15-6.738281-15-15s6.738281-15 15-15 15 6.738281 15 15-6.738281 15-15 15zm75 0c-8.261719 0-15-6.738281-15-15s6.738281-15 15-15 15 6.738281 15 15-6.738281 15-15 15zm58.636719-135.75-38.96875 85c-2.441406 5.332031-7.769532 8.75-13.632813 8.75h-86.289062c-7.039063 0-13.132813-4.894531-14.648438-11.769531l-23.867187-108.230469h-8.835938c-8.285156 0-15-6.714844-15-15s6.714844-15 15-15h20.886719c7.042969 0 13.132813 4.894531 14.648437 11.769531l5.125 23.230469h131.945313c5.109375 0 9.867187 2.601562 12.625 6.898438 2.761719 4.300781 3.140625 9.707031 1.011719 14.351562zm0 0" data-original="#000000" class="hovered-path active-path" data-old_color="#000000" fill="#205164"/></g> </svg>`      
    });
  };

  const hoverMarker = L.divIcon({
    className: "custom-marker",
    html: `<svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="-46 0 512 512" width="25px"><g><path d="m177.128906 232.5h64.609375l25.210938-55h-101.953125zm0 0" data-original="#000000" class="active-path" data-old_color="#000000" fill="#009688"/><path d="m210 0c-115.792969 0-210 94.207031-210 210 0 93.359375 61.519531 175.210938 150.441406 201.429688l46.140625 92.277343c2.539063 5.082031 7.734375 8.292969 13.417969 8.292969 5.679688 0 10.875-3.210938 13.414062-8.292969l46.140626-92.277343c88.925781-26.214844 150.445312-108.070313 150.445312-201.429688 0-115.792969-94.207031-210-210-210zm-39.671875 304.5c-8.261719 0-15-6.738281-15-15s6.738281-15 15-15 15 6.738281 15 15-6.738281 15-15 15zm75 0c-8.261719 0-15-6.738281-15-15s6.738281-15 15-15 15 6.738281 15 15-6.738281 15-15 15zm58.636719-135.75-38.96875 85c-2.441406 5.332031-7.769532 8.75-13.632813 8.75h-86.289062c-7.039063 0-13.132813-4.894531-14.648438-11.769531l-23.867187-108.230469h-8.835938c-8.285156 0-15-6.714844-15-15s6.714844-15 15-15h20.886719c7.042969 0 13.132813 4.894531 14.648437 11.769531l5.125 23.230469h131.945313c5.109375 0 9.867187 2.601562 12.625 6.898438 2.761719 4.300781 3.140625 9.707031 1.011719 14.351562zm0 0" data-original="#000000" class="active-path" data-old_color="#000000" fill="#009688"/></g> </svg>`
  });

  const meMarker = L.divIcon({
    className: "custom-marker-me",
    html: `<svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="-46 0 512 512" width="25px"><g><path d="m178.179688 133.199219c-11.523438 0-23.046876 4.390625-31.820313 13.160156-17.542969 17.546875-17.542969 46.09375 0 63.640625 17.546875 17.546875 46.097656 17.546875 63.640625 0 17.546875-17.546875 17.546875-46.09375 0-63.640625-8.773438-8.769531-20.296875-13.160156-31.820312-13.160156zm0 0" data-original="#000000" class="active-path" data-old_color="#000000" fill="#FF4081"/><path d="m210 0c-115.792969 0-210 94.207031-210 210 0 93.359375 61.519531 175.210938 150.441406 201.429688l46.140625 92.277343c2.542969 5.082031 7.734375 8.292969 13.417969 8.292969 5.679688 0 10.875-3.210938 13.414062-8.292969l46.140626-92.277343c88.925781-26.214844 150.445312-108.070313 150.445312-201.429688 0-115.792969-94.207031-210-210-210zm84.851562 294.851562c-2.925781 2.929688-6.765624 4.394532-10.605468 4.394532s-7.675782-1.464844-10.605469-4.394532l-54.101563-54.097656c-12.488281 8.257813-26.921874 12.390625-41.355468 12.390625-19.207032 0-38.414063-7.308593-53.035156-21.929687-29.242188-29.242188-29.242188-76.824219 0-106.066406 29.242187-29.242188 76.824218-29.242188 106.066406 0 25.609375 25.609374 28.789062 65.285156 9.539062 94.390624l54.101563 54.101563c5.855469 5.855469 5.855469 15.355469-.003907 21.210937zm0 0" data-original="#000000" class="active-path" data-old_color="#000000" fill="#FF4081"/></g> </svg>`
  });

  const handleUserMarker = location => {
    if(!location || !location.latitude || !location.longitude)
      return;

    if (map && position.latitude != location.latitude && position.longitude != location.longitude)
    {
      position = location;
      if (userMarker) 
        map.removeLayer(userMarker);

      userMarker = L.marker([position.latitude, position.longitude], {
        icon: meMarker
      }).addTo(map);

      map.setView([position.latitude, position.longitude], 10);
    }
  };

  $: handleUserMarker(userPosition);

  onMount(() => {
    map = L.map(id).setView([45.77166358, 2.9666628], 4);

    L.tileLayer(
      "https://api.maptiler.com/maps/positron/{z}/{x}/{y}.png?key=xdycAkqlmra0OjZw2dPy",
      {
        attribution:
          'Map data &copy; OpenStreetMap contributors, CC-BY-SA',
        maxZoom: 18,
        tileSize: 512,
        zoomOffset: -1
      }
    ).addTo(map);
  });

  $: if (map) {
    if (itemsMarkers) map.removeLayer(itemsMarkers);

    let producerWithProductsCount = [];

    // on regroupe tous les produits par producteur pour afficher des marqueurs avec un nombre d'articles
    $cartStore.items
      .map(cartItem => {
        let producer = producerWithProductsCount.find(
          c =>
            c.latitude === cartItem.producer.address.latitude &&
            c.longitude === cartItem.producer.address.longitude
        );
        producer
          ? (producer.nbProducts += cartItem.quantity)
          : (producerWithProductsCount = [
              ...producerWithProductsCount,
              { ...cartItem.producer, nbProducts: cartItem.quantity }
            ]);
      });

    const coordonnates = producerWithProductsCount.map(producer => 
      L.marker([producer.address.latitude, producer.address.longitude], {
        icon: renderMarker()
      }).bindPopup(`<p style="margin: 0"><b>${producer.nbProducts} article${producer.nbProducts > 1 ? 's' : ''}</b></p><p style="margin: 0">${producer.name}</p><p style="margin: 0">${producer.address.zipcode} ${producer.address.city}</p>`) 
    );

    itemsMarkers = L.layerGroup(coordonnates).addTo(map);
  }

  $: if (hoveredProduct) {
    if (currentMarker) map.removeLayer(currentMarker);

    if (hoveredProduct.producer.address.latitude && hoveredProduct.producer.address.longitude) {
      currentMarker = L.marker([hoveredProduct.producer.address.latitude, hoveredProduct.producer.address.longitude], { icon: hoverMarker }).addTo(map);
      currentMarker.bindPopup(`<b>${hoveredProduct.name}</b><br>${hoveredProduct.producer.name}`).openPopup();
    }
  } else {
    if (currentMarker) map.removeLayer(currentMarker);
    currentMarker = null;
  }
</script>

<div {id} style="height: {height}; z-index: 1;" />
