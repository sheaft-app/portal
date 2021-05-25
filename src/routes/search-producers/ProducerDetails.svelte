<script>
  import { getContext } from "svelte";
  import Icon from "svelte-awesome";
	import ProducerReadMoreModal from "../external/ProducerReadMoreModal.svelte";
  import {
    faPhone,
    faEnvelope,
    faTimesCircle,
    faHandshake,
    faEye
  } from "@fortawesome/free-solid-svg-icons";
  import GetRouterInstance from "../../services/SheaftRouter.js";
  import { GET_PRODUCER_DETAILS, GET_PRODUCER_DELIVERIES } from "./queries.js";
  import { formatMoney, formatConditioningDisplay, encodeQuerySearchUrl, timeSpanToFrenchHour } from "./../../helpers/app";
  import CreateAgreementModal from "./CreateAgreementModal.svelte";
  import GetAuthInstance from "./../../services/SheaftAuth.js";
  import { selectedItem } from "./../../stores/app.js";
  import RatingStars from "./../../components/rating/RatingStars.svelte";
	import DayOfWeekKind from "./../../enums/DayOfWeekKind";
  import AgreementRoutes from "../agreements/routes";
  import { config } from "../../configs/config";
  import SheaftErrors from "../../services/SheaftErrors";

  const routerInstance = GetRouterInstance();
  const errorsHandler = new SheaftErrors();
  const { open } = getContext("modal");
  const { query } = getContext("api");

  let producer = null;
  let producerDoesntExist = false;

  const openAndLoad = async () => {
    history.pushState({ selected: $selectedItem}, "Détails du producteur");

    const producerDetails = document.getElementById("producer-details");

    if (producerDetails) {
      producerDetails.scrollTop = 0;
    }

    await query({
			query: GET_PRODUCER_DETAILS,
			variables: { id: $selectedItem.id },
      errorsHandler,
      success: async (res) => {
        const deliveries = res.agreement && res.agreement.delivery ? [res.agreement.delivery] : await loadDeliveries(res.id);
        producer = { ...res, deliveries }
      },
			error: () => producerDoesntExist = true,
			errorNotification: "Impossible de récupérer les informations du producteur."
    });
  }

  const loadDeliveries = async (id) =>  {
    const res = await query({
			query: GET_PRODUCER_DELIVERIES,
			variables: { input: [id] },
      errorsHandler,
			error: () => routerInstance.goTo(ReturnableRoutes.List),
			errorNotification: "Impossible de récupérer les informations de livraison."
    });

    return res[0] ? res[0].deliveries : [] 
  }

  const openAgreement = () => {
    selectedItem.set(null);
    routerInstance.goTo(AgreementRoutes.Details, { id: producer.agreement.id })
  }

  const showCreateAgreementModal = () => open(CreateAgreementModal, {
    submit: () => {},
    producer: producer,
    storeId: GetAuthInstance().user.profile.id,
    onClosed: (res) => {
        producer.agreement = { id: res.id, status: res.status };
        producer.hasAgreement = true;
    }
  });

  const handleKeyup = ({ key }) => {
    if ($selectedItem && key === "Escape") {
      selectedItem.set(null);
    }
  };

  const openReadMoreModal = () =>	open(ProducerReadMoreModal, {
    producer
  });

  $: if ($selectedItem) openAndLoad($selectedItem);
</script>

<svelte:window on:keyup={handleKeyup} />

<div class="relative">
<div
  class="py-3 px-4 sm:px-6 bg-white top-0 left-0 w-full h-12 sticky shadow hidden lg:block"
  style="z-index: 2;">
  <button
    on:click={() => selectedItem.set(null)}
    aria-label="Fermer"
    class="font-bold flex items-center">
    <Icon data={faTimesCircle} class="mr-2" />
    <span>Fermer</span>
  </button>
</div>
{#if producerDoesntExist}
  <div class="mb-10 p-4 border border-red-500 text-red-500 lg:flex flex-row justify-center">
    <p class="text-center">Mince, il semblerait que ce producteur n'existe plus !</p>
  </div>
{:else if !producer}
  <div class="px-4 sm:px-6">
    <div class="-mx-10">
      <div class="skeleton-box w-full rounded-t-md shadow-md h-40 lg:h-64" />
    </div>
    <div class="text-center m-auto" style="margin-top: 20px;">
      <div class="w-64 h-10 skeleton-box mb-2 m-auto" />
      <div class="w-48 h-10 skeleton-box mb-2 m-auto" />
      <div class="w-80 h-24 skeleton-box mb-2 m-auto" />
      <div class="w-48 h-10 skeleton-box m-auto mb-2" />
      <div class="w-full skeleton-box m-auto" style="height: 190px;" />
      <div class="mt-5">
        <div class="w-48 skeleton-box h-10 mb-2" />
        <div class="w-full skeleton-box m-auto" style="height: 190px;" />
      </div>
    </div>
  </div>
{:else}
  <div class="mt-5 mb-5">
    <img
      class="h-20 w-20 md:h-32 md:w-32 rounded-full p-1 border
      border-gray-800 border-solid m-auto"
      src={producer.picture ? producer.picture : 'img/icons/farmer.svg'}
      alt="Photo du producteur"/>
    <div class="w-full">
      <div
        class:opacity-0={!$selectedItem}
        class="transition duration-500 ease-in-out px-4 sm:px-6">
        <div class="title-margin lg:text-center" style="margin-bottom: 10px;">
          <div class="flex justify-center">
            <p class="text-xl lg:text-3xl font-semibold">{producer.name}</p>
          </div>
        </div>
      </div>
      {#if producer.summary}
        <div class="w-full px-4 text-center mb-5">
          <p class="text-sm">{producer.summary}</p>
          {#if producer.description}
            <button on:click={openReadMoreModal} class="btn btn-link mt-2 m-auto">Lire plus</button>
          {/if}
        </div>
      {:else if !producer.summary && producer.description}
        <p class="text-sm text-center px-4 mb-5">
          {#if producer.description.length > 300}
            <p>
              {producer.description.slice(0, 300).concat('...')}
              <button on:click={openReadMoreModal} class="btn-link m-auto">Lire plus</button>
            </p>
          {:else}
            {producer.description}
          {/if}
        </p>
      {/if}
      {#if producer.agreement}
        <button
          on:click={openAgreement}
          class="btn btn-outline flex items-center justify-center py-3 px-6 uppercase
          rounded-full cursor-pointer text-sm btn-outline text-accent mb-2 m-auto">
          <Icon data={faEye} scale="1.3" class="mr-2" />
          voir accord
        </button>
      {:else if producer.deliveries.length == 0}
        <button disabled class="flex items-center justify-center p-2 uppercase
        disabled rounded-full shadow cursor-blocked text-sm mb-2 m-auto">
          <Icon data={faHandshake} scale="1.3" class="mr-2" /> accord impossible
        </button>
      {:else}
        <button on:click={showCreateAgreementModal} class="flex py-3 px-6 items-center justify-center
        p-2 uppercase bg-accent rounded-full cursor-pointer text-sm mb-2 m-auto">
          <Icon data={faHandshake} scale="1.3" class="mr-2" /> demander accord
        </button>
      {/if}
      <div class="flex flex-wrap justify-between w-full px-4 mt-5">
        <div class={`flex flex-row justify-start items-start mb-3 w-2/3 ${producer.tags && producer.tags.length > 0 && producer.tags.find((t) => t.name === "Bio") ? 'lg:w-1/3' : ''}`}>
          <div>
              <p class="font-semibold">Site de production</p>
              <p>{producer.address.line1}</p>
              {#if producer.address.line2}
                <p>{producer.address.line2}</p>
              {/if}
              <p>{producer.address.zipcode} {producer.address.city}</p>
              <a
                class="mt-1"
                target="_blank"
                href={`https://www.google.com/maps/search/?api=1&query=${encodeQuerySearchUrl(producer.address)}`}>
                Voir sur Google Maps
              </a>
            </div>
          </div>
          {#if producer.tags && producer.tags.length > 0 && producer.tags.find((t) => t.name === "Bio")}
            <div class="text-center ml-3">
              <img src="{config.content + '/pictures/tags/icons/bio.png'}" alt="Bio" class="m-auto mb-1" style="max-width: 30px;" />
            </div>
          {/if}
          <div>
            <p class="text-base mb-1">
              <Icon
                data={faPhone}
                class="mr-1 inline"
                style="margin-bottom: 1px; width: 20px;" />
              {#if producer.phone}
                <a href="tel:{producer.phone}">
                  {producer.phone}
                </a>
              {:else}
                <span>Non renseigné</span>
              {/if}
            </p>
            <p class="text-base mb-1">
              <Icon
                data={faEnvelope}
                class="mr-1 inline"
                style="margin-bottom: 3px; width: 20px;" />
              <a href="mailto:{producer.email}">
                {producer.email}
              </a>
            </p>
          </div>
      </div>
      {#if producer.facebook || producer.instagram}
        <p class="text-gray-600 mb-2 text-sm mt-4">Retrouvez-nous sur les réseaux
          sociaux !</p>
        <div class="flex flex-row flex-wrap social-medias justify-center">
          {#if producer.facebook}
            <a href={producer.facebook} target="_blank">
              <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#1877F2"><title>
                Facebook</title>
                <path
                  d="M23.9981 11.9991C23.9981 5.37216 18.626 0 11.9991 0C5.37216 0 0 5.37216 0 11.9991C0 17.9882 4.38789 22.9522 10.1242 23.8524V15.4676H7.07758V11.9991H10.1242V9.35553C10.1242 6.34826 11.9156 4.68714 14.6564 4.68714C15.9692 4.68714 17.3424 4.92149 17.3424 4.92149V7.87439H15.8294C14.3388 7.87439 13.8739 8.79933 13.8739 9.74824V11.9991H17.2018L16.6698 15.4676H13.8739V23.8524C19.6103 22.9522 23.9981 17.9882 23.9981 11.9991Z"/>
              </svg>
            </a>
          {/if}
          {#if producer.instagram}
            <a href={producer.instagram} target="_blank">
              <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#E4405F"><title>
                Instagram</title>
                <path
                  d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
              </svg>
            </a>
          {/if}
        </div>
      {/if}
      {#if producer.tags && producer.tags.length > 0}
        <div class="mt-5 px-4">
            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">Catégories</label>
            <div class="flex flex-wrap">
                {#each producer.tags as tag}
                    <span class="mx-2 mb-2 h-6 px-4 rounded-full text-xs font-semibold flex items-center bg-gray-100 text-gray-600">{tag.name}</span>
                {/each}
            </div>
        </div>
      {/if}
      <div class="w-full px-4 mt-5">
        <p class="text-2xl font-semibold mb-0">Livraisons</p>
        {#if producer.deliveries && producer.deliveries.length > 0}
        {#each producer.deliveries as delivery, index}
          <div class="bg-gray-100 rounded-lg p-4 px-5 mb-2">
            <p class="font-semibold mb-2">{delivery.name}</p>
            {#each delivery.deliveryHours as deliveryHour, index}
              <div class="flex mb-2 border-gray-300"
                  class:pb-2={index !== delivery.length - 1}
                  class:border-b={index !== delivery.length - 1}>
                <p style="min-width: 100px;">
                  {DayOfWeekKind.label(deliveryHour.day)}
                </p>
                <div>
                    <p>{`${timeSpanToFrenchHour(deliveryHour.from)} à ${timeSpanToFrenchHour(deliveryHour.to)}`}</p>
                </div>
              </div>
            {/each}
          </div>
        {/each}
        {:else}
        <p>Ce producteur n'a pas configuré de créneau de livraison</p>
        {/if}
      </div>
      <div class="w-full px-4 mt-5">
        <p class="text-2xl font-semibold mb-0">Produits</p>
        {#if producer.products && producer.products.length > 0}
        {#each producer.products as product, index}
          <div
          style="margin-bottom:1px;"
          class="rounded hover:bg-gray-100 transition duration-200
          ease-in-out focus:outline-none">
          <div class="h-full bg-white border-gray-400" class:border-b={index !== producer.products.length - 1}>
            <div class="relative py-4 w-full">
              <div class="bg-white rounded-lg p-0 w-full flex justify-between">
                <div
                style="background-image: url({product.imageSmall}); background-size: cover;
                background-position: top;"
                class="h-12 w-12 mr-2 mt-1 rounded-lg items-center justify-center mb-2 relative" />
                <div class="pr-8 w-8/12">
                  <h4
                    class="font-semibold text-base lg:text-lg leading-tight -mb-2
                    lg:mb-0">
                    {product.name}
                  </h4>
                  <div class="mt-2 md:mt-0 w-full text-xs">
                    <RatingStars rating={product.rating} />
                    <span class="text-gray-600">
                      {product.rating || 'Aucun avis'}
                    </span>
                  </div>
                </div>
                <div
                  class="text-base text-right font-semibold">
                  {formatMoney(product.wholeSalePricePerUnit)} H.T
                  <div class="text-xs">{formatConditioningDisplay(product.conditioning, product.quantityPerUnit, product.unit)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/each}
        {:else}
          <p>Ce producteur ne possède pas de produits à vendre pour le moment</p>
        {/if}
      </div>
    </div>
  </div>
  {/if}
</div>
