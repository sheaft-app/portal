<script>
  import { onMount } from "svelte";
  import { cartItems, cartItemsOrderedByProducer } from "../../stores/app.js";
  import { querystring } from "svelte-spa-router";
  import "leaflet/dist/leaflet.css";
  import L from "leaflet";
  import GetRouterInstance from "../../services/SheaftRouter.js";

  const routerInstance = GetRouterInstance();
  export let id, height;

  var map = null;
  var userMarker = null;
  var cartItemsMarkers = null;
  var position = {
    latitude: 0,
    longitude: 0
  };

  const renderMarkerWithNumber = number => {
    return L.divIcon({
      className: "custom-marker",
      html: `<div style="
          position: absolute;
          bottom: 3px;
          font-weight: 600;
          z-index: 1000;
          color: #ffffff;
      "><span>${number}</span></div>
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="xMidYMid meet" viewBox="0 0 640 640" height="70"><defs><path d="M297.21 309.7L383.28 309.7L416.86 236.44L281.05 236.44L297.21 309.7Z" id="b18nvS8h29"></path><path d="M171.25 138.56L512.07 138.56L512.07 416.44L171.25 416.44L171.25 138.56Z" id="b3QnO13cL6"></path><path d="M61.27 258.83C61.27 373.9 137.14 474.78 246.8 507.1C252.49 518.47 298.01 609.46 303.7 620.84C306.83 627.1 313.24 631.06 320.25 631.06C327.25 631.06 333.66 627.1 336.79 620.84C342.48 609.46 388 518.47 393.69 507.1C503.35 474.79 579.22 373.9 579.22 258.83C579.22 116.11 463.04 0 320.25 0C177.45 0 61.27 116.11 61.27 258.83ZM252.82 356.82C252.82 346.64 261.13 338.33 271.32 338.33C281.51 338.33 289.82 346.64 289.82 356.82C289.82 367 281.51 375.31 271.32 375.31C261.13 375.31 252.82 367 252.82 356.82ZM345.31 356.82C345.31 346.64 353.62 338.33 363.81 338.33C374 338.33 382.31 346.64 382.31 356.82C382.31 367 374 375.31 363.81 375.31C353.62 375.31 345.31 367 345.31 356.82ZM388.07 312.76C385.06 319.33 378.49 323.54 371.25 323.54C360.61 323.54 275.48 323.54 264.84 323.54C256.16 323.54 248.65 317.51 246.78 309.03C244.82 300.14 235.01 255.67 217.35 175.64C210.81 175.64 207.18 175.64 206.45 175.64C196.23 175.64 187.95 167.36 187.95 157.15C187.95 146.94 196.23 138.66 206.45 138.66C209.02 138.66 229.63 138.66 232.21 138.66C240.89 138.66 248.4 144.69 250.27 153.17C250.69 155.08 252.8 164.62 256.59 181.8C354.22 181.8 408.46 181.8 419.31 181.8C425.61 181.8 431.47 185.01 434.88 190.3C438.28 195.6 438.75 202.27 436.12 207.99C426.51 228.94 392.87 302.28 388.07 312.76Z" id="aFsFqTVks"></path></defs><g><g><g><use xlink:href="#b18nvS8h29" opacity="1" fill="#009688" fill-opacity="1"></use><g><use xlink:href="#b18nvS8h29" opacity="1" fill-opacity="0" stroke="#009688" stroke-width="1" stroke-opacity="0"></use></g></g><g><use xlink:href="#b3QnO13cL6" opacity="1" fill="#009688" fill-opacity="1"></use></g><g><use xlink:href="#aFsFqTVks" opacity="1" fill="#009688" fill-opacity="1"></use><g><use xlink:href="#aFsFqTVks" opacity="1" fill-opacity="0" stroke="#009688" stroke-width="1" stroke-opacity="0"></use></g></g></g></g></svg>`
    })
  }

  const meMarker = L.divIcon({
    className: "custom-marker-me",
    html: `<svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="-46 0 512 512" width="25px"><g><path d="m178.179688 133.199219c-11.523438 0-23.046876 4.390625-31.820313 13.160156-17.542969 17.546875-17.542969 46.09375 0 63.640625 17.546875 17.546875 46.097656 17.546875 63.640625 0 17.546875-17.546875 17.546875-46.09375 0-63.640625-8.773438-8.769531-20.296875-13.160156-31.820312-13.160156zm0 0" data-original="#000000" class="active-path" data-old_color="#000000" fill="#FF4081"/><path d="m210 0c-115.792969 0-210 94.207031-210 210 0 93.359375 61.519531 175.210938 150.441406 201.429688l46.140625 92.277343c2.542969 5.082031 7.734375 8.292969 13.417969 8.292969 5.679688 0 10.875-3.210938 13.414062-8.292969l46.140626-92.277343c88.925781-26.214844 150.445312-108.070313 150.445312-201.429688 0-115.792969-94.207031-210-210-210zm84.851562 294.851562c-2.925781 2.929688-6.765624 4.394532-10.605468 4.394532s-7.675782-1.464844-10.605469-4.394532l-54.101563-54.097656c-12.488281 8.257813-26.921874 12.390625-41.355468 12.390625-19.207032 0-38.414063-7.308593-53.035156-21.929687-29.242188-29.242188-29.242188-76.824219 0-106.066406 29.242187-29.242188 76.824218-29.242188 106.066406 0 25.609375 25.609374 28.789062 65.285156 9.539062 94.390624l54.101563 54.101563c5.855469 5.855469 5.855469 15.355469-.003907 21.210937zm0 0" data-original="#000000" class="active-path" data-old_color="#000000" fill="#FF4081"/></g> </svg>`
  });

  const determineLocation = querystring => {
    let values = routerInstance.getQueryParams();
    let newPosition = null;

    if (values["latitude"] && values["longitude"]) {
      newPosition = {
        latitude: values["latitude"],
        longitude: values["longitude"]
      };
    } else if (localStorage.getItem("user_location")) {
      newPosition = JSON.parse(localStorage.getItem("user_location"));
    }

    if (
      map &&
      newPosition &&
      (newPosition.latitude !== position.latitude ||
        newPosition.longitude !== position.longitude)
    ) {
      position = newPosition;
      if (userMarker) map.removeLayer(userMarker);
      userMarker = L.marker([position.latitude, position.longitude], {
        icon: meMarker
      }).addTo(map);
      map.setView([position.latitude, position.longitude], 10);
    }
  };

  $: determineLocation($querystring);

  onMount(() => {
    map = L.map(id).setView([45.77166358, 2.9666628], 4);

    L.tileLayer(
      "https://api.maptiler.com/maps/positron/{z}/{x}/{y}.png?key=xdycAkqlmra0OjZw2dPy",
      {
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
        maxZoom: 18,
        tileSize: 512,
        zoomOffset: -1
      }
    ).addTo(map);

    determineLocation();
  });

  $: if (map) {
    if (cartItemsMarkers) map.removeLayer(cartItemsMarkers);

    let producerWithProductsCount = [];

    // on regroupe tous les produits par producteur pour afficher des marqueurs avec un nombre d'articles
    $cartItems
      .filter(c => c.producer.delivery && c.producer.delivery.address && c.producer.delivery.address.latitude && c.producer.delivery.address.longitude)
      .map((cartItem, i) => {
        let producer = producerWithProductsCount.find(
          c => {
            return c.delivery.address.latitude === cartItem.producer.delivery.address.latitude &&
            c.delivery.address.longitude === cartItem.producer.delivery.address.longitude
          }
        );

        producer
          ? (producer.nbProducts += cartItem.quantity)
          : (producerWithProductsCount = [
              ...producerWithProductsCount,
              { ...cartItem.producer, nbProducts: cartItem.quantity, index: producerWithProductsCount.length + 1 }
            ]);
      });

    cartItemsOrderedByProducer.set(producerWithProductsCount);

    const coordonnates = producerWithProductsCount.map((producer, i) =>
      L.marker([producer.delivery.address.latitude, producer.delivery.address.longitude], {
        icon: renderMarkerWithNumber(i + 1)
      }).bindPopup(`<p style="margin: 0"><b>${producer.nbProducts} articles</b></p><p style="margin: 0">${producer.name}</p><p style="margin: 0">${producer.delivery.address.zipcode} ${producer.delivery.address.city}</p>`)
    );

    cartItemsMarkers = L.featureGroup(coordonnates);

    cartItemsMarkers.addTo(map);
    if (coordonnates.length > 0) {
      map.fitBounds(cartItemsMarkers.getBounds(), { maxZoom: 10});
    }
  }
</script>

<div {id} style="height: {height}; z-index: 1;" />
