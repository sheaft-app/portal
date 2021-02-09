<script>
  import { onMount } from "svelte";
  import Icon from "svelte-awesome";
  import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
	import TransitionWrapper from "../../components/TransitionWrapper.svelte";
	import SearchProductsRoutes from "../search-products/routes";
  import GetRouterInstance from "../../services/SheaftRouter.js";
  import { GET_PRODUCER_DELIVERIES } from "./queries.js";
  import GetAuthInstance from "../../services/SheaftAuth.js";
  import GetGraphQLInstance from "../../services/SheaftGraphQL.js";
  import { timeSpanToFrenchHour } from "../../helpers/app.js";
  import DayOfWeekKind from "../../enums/DayOfWeekKind";
  import Roles from "../../enums/Roles";
  import SheaftErrors from "../../services/SheaftErrors";
  import DeliveryKind from "../../enums/DeliveryKind";
  import { groupBy, encodeQuerySearchUrl } from "../../helpers/app";
  import "leaflet/dist/leaflet.css";
  import L from "leaflet";

  const errorsHandler = new SheaftErrors();
  const routerInstance = GetRouterInstance();
  const authInstance = GetAuthInstance();
  const graphQLInstance = GetGraphQLInstance();

  export let params = {};

  let producer = null;
  let isLoading = true;
  let deliveries = [];
  let map = null;
  let deliveriesMarkers = [];

  onMount(async () => {
    await getProducerDetails(params.id);

    map = L.map("map").setView([45.77166358, 2.9666628], 4);

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

    const renderMarker = () => {
      return L.divIcon({
        className: "custom-marker",
        html: `<svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="-46 0 512 512" width="25px" class="hovered-paths"><g><path d="m177.128906 232.5h64.609375l25.210938-55h-101.953125zm0 0" data-original="#000000" class="hovered-path active-path" data-old_color="#000000" fill="#205164"/><path d="m210 0c-115.792969 0-210 94.207031-210 210 0 93.359375 61.519531 175.210938 150.441406 201.429688l46.140625 92.277343c2.539063 5.082031 7.734375 8.292969 13.417969 8.292969 5.679688 0 10.875-3.210938 13.414062-8.292969l46.140626-92.277343c88.925781-26.214844 150.445312-108.070313 150.445312-201.429688 0-115.792969-94.207031-210-210-210zm-39.671875 304.5c-8.261719 0-15-6.738281-15-15s6.738281-15 15-15 15 6.738281 15 15-6.738281 15-15 15zm75 0c-8.261719 0-15-6.738281-15-15s6.738281-15 15-15 15 6.738281 15 15-6.738281 15-15 15zm58.636719-135.75-38.96875 85c-2.441406 5.332031-7.769532 8.75-13.632813 8.75h-86.289062c-7.039063 0-13.132813-4.894531-14.648438-11.769531l-23.867187-108.230469h-8.835938c-8.285156 0-15-6.714844-15-15s6.714844-15 15-15h20.886719c7.042969 0 13.132813 4.894531 14.648437 11.769531l5.125 23.230469h131.945313c5.109375 0 9.867187 2.601562 12.625 6.898438 2.761719 4.300781 3.140625 9.707031 1.011719 14.351562zm0 0" data-original="#000000" class="hovered-path active-path" data-old_color="#000000" fill="#205164"/></g> </svg>`      
      });
    };
    
    const coordonnates = deliveries.map((delivery, i) =>
      L.marker([delivery.address.latitude, delivery.address.longitude], {
        icon: renderMarker()
      }).bindPopup(`<p style="margin: 0"><b>${DeliveryKind.label(delivery.kind)}</b></p><p style="margin: 0">${delivery.address.line1}</p><p style="margin: 0">${delivery.address.zipcode} ${delivery.address.city}</p>`)
    );

    deliveriesMarkers = L.featureGroup(coordonnates);

    deliveriesMarkers.addTo(map);
    if (coordonnates.length > 0) {
      map.fitBounds(deliveriesMarkers.getBounds(), { maxZoom: 10});
    }
  })

  const getProducerDetails = async id => {
    isLoading = true;
    var res = await graphQLInstance.query(GET_PRODUCER_DETAILS, { id: id }, errorsHandler.Uuid);

    if (!res.success) {
      isLoading = false;
      //TODO
      return;
    }

    var deliveriesResult = await graphQLInstance.query(GET_PRODUCER_DELIVERIES, {
      input: {
        ids: [res.data.id],
        kinds: [
          DeliveryKind.Farm.Value,
          DeliveryKind.Market.Value,
          DeliveryKind.Collective.Value
        ] 
      }
    }, errorsHandler.Uuid);

    if (!deliveriesResult.success) {
      isLoading = false;
      //TODO
    }

    if (deliveriesResult.data.length == 0) {
      deliveries = [];
    } else {
      deliveries = deliveriesResult.data[0].deliveries.map((d) => {
        return {
          ...d,
          deliveryHours: groupBy(d.deliveryHours, item => [item.day]).map((g) => g.filter((delivery, index, self) =>
            index === self.findIndex((d) => (
              d.day === delivery.day && d.from === delivery.from && d.to === delivery.to
            ))
          ))
        }
      });
    }

    producer = res.data;

    isLoading = false;
  };
</script>

<TransitionWrapper hasRightPanel style="margin: 0">
  <div class="details-container">
    {#if !authInstance.isInRole([Roles.Producer.Value])}
      <button
        class="text-gray-600 items-center flex uppercase mb-2"
        on:click={() => routerInstance.goTo(SearchProductsRoutes.Search)}>
        <Icon data={faChevronLeft} scale=".8" class="mr-2 inline" />
        Retourner à la recherche
      </button>
    {/if}
    {#if !producer || isLoading}
      <div>
        <div class="flex flex-wrap lg:justify-between flex-col-reverse lg:flex-row">
          <div class="lg:w-1/2 lg:pr-3 mt-2 lg:mt-0"> 
            <div class="w-64 h-10 skeleton-box mb-2" />
            <div class="w-48 h-10 skeleton-box mb-2" />
            <div class="w-80 h-24 skeleton-box mb-2" />
            <div class="w-48 h-10 skeleton-box mb-2" />
          </div>
          <div class="skeleton-box w-full lg:w-1/2 rounded-t-md shadow-md h-40 lg:h-64" />
        </div>
        <div style="margin-top: 20px;">
          <div class="mt-5">
            <div class="w-48 skeleton-box h-10 mb-2" />
            <div class="w-full skeleton-box" style="height: 190px;" />
          </div>
        </div>
      </div>
    {:else}
      <div class="flex flex-wrap justify-between mt-5">
        <div class="flex flex-wrap">
          <img
            class="h-10 w-10 md:h-24 md:w-24 rounded-full p-1 md:mx-0 border
            border-gray-800 border-solid"
            src={producer.picture ? producer.picture : 'img/icons/farmer.svg'}
            alt="Producteur" />
          <div class="w-7/12 md:w-6/12 lg:pl-5 pl-3">
            <p class="text-base lg:text-lg">{producer.description}</p>
          </div>
        </div>
        <div class="lg:w-2/3 w-full">
          <div
            id="producer-card"
            class="bg-white overflow-hidden rounded-l p-3 lg:p-6 shadow
            relative">
            <p class="mt-3 font-semibold">Lieux et horaires de récupération</p>
            {#each deliveries as delivery}
              <div class="bg-gray-100 rounded-lg p-4 px-5 mt-2 w-full">
                <div class="flex flex-row justify-between items-start mb-3">
                  <div>
                    <p class="font-semibold">{DeliveryKind.label(delivery.kind)}</p>
                    <p>{delivery.address.line1}</p>
                    {#if delivery.address.line2}
                      <p>
                        {delivery.address.line2}
                      </p>
                    {/if}
                    <p>{delivery.address.zipcode} {delivery.address.city}</p>
                    <a 
                      class="mt-1"
                      target="_blank"
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeQuerySearchUrl(delivery.address)}`}>
                      Voir sur Google Maps
                    </a>
                  </div>
                </div>
                <div class="mt-2">
                  {#each delivery.deliveryHours as deliveryHour, index}
                    <div class="flex mb-2 border-gray-300" 
                      class:pb-2={index !== delivery.deliveryHours.length - 1}
                      class:border-b={index !== delivery.deliveryHours.length - 1}>
                      <p style="min-width: 100px;">
                        {DayOfWeekKind.label(deliveryHour[0].day)}
                      </p>
                      <div>
                        {#each deliveryHour as hours} 
                          <p>{`${timeSpanToFrenchHour(hours.from)} à ${timeSpanToFrenchHour(hours.to)}`}</p>
                        {/each}
                      </div>
                    </div>
                  {/each}
                </div>
              </div>
            {:else}
              <p class="text-gray-600">Il semblerait que ce producteur n'ait aucun point de récupération.</p>
            {/each}
          </div>
        </div>
        <div class="lg:w-1/3 w-full">
          <div id="map" class="rounded-r shadow lg:h-full" style="z-index: 0;" />
        </div>
      </div>
    {/if}
  </div>
</TransitionWrapper>