<script>
  import DeliveryKind from "../../enums/DeliveryKind";
  import { onMount, onDestroy, getContext } from "svelte";
  import Icon from "svelte-awesome";
  import {
    faMapMarkerAlt,
    faPhone,
    faEnvelope,
    faTimesCircle,
    faHandshake,
    faEye
  } from "@fortawesome/free-solid-svg-icons";
  import GetRouterInstance from "../../services/SheaftRouter.js";
  import { GetDistanceInfos } from "./../../helpers/distances";
  import { formatMoney, formatConditioningDisplay } from "./../../helpers/app";
  import { GET_PRODUCER_DETAILS, GET_PRODUCER_DELIVERIES, GET_PRODUCER_AGREEMENTS, GET_PRODUCER_PRODUCTS } from "./queries.js";
  import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
  import CreateAgreementModal from "./CreateAgreementModal.svelte";
  import GetAuthInstance from "./../../services/SheaftAuth.js";
  import { selectedItem } from "./../../stores/app.js";
  import RatingStars from "./../../components/rating/RatingStars.svelte";
  import AgreementRoutes from "../agreements/routes";
  import GetNotificationsInstance from "./../../services/SheaftNotifications.js";
import { config } from "../../configs/config";

  const graphQLInstance = GetGraphQLInstance();
  const routerInstance = GetRouterInstance();
  const notificationsInstance = new GetNotificationsInstance();
  const { open } = getContext("modal");
  const values = routerInstance.getQueryParams();

  let producer = null;
  let isLoading = true;
  let producerDoesntExist = false;
  let distanceInfos = null;

  const openAndLoad = async () => {
    history.pushState({ selected: $selectedItem}, "Détails du producteur");

    const values = routerInstance.getQueryParams();
    isLoading = true;

    const producerDetails = document.getElementById("producer-details");

    if (producerDetails) {
      producerDetails.scrollTop = 0;
    }

    var res = await graphQLInstance.query(GET_PRODUCER_DETAILS, {
      id: $selectedItem.id
    });

    if (!res.success) {
      // TODO
      isLoading = false;
      console.error("No producer found for this ID");
      producerDoesntExist = true;
      return;
    }

    const products = await loadProducts(res.data.id);
    const delivery = await loadDelivery(res.data.id);
    const agreements = await loadAgreements(res.data.id);

    distanceInfos = GetDistanceInfos(
      values["latitude"],
      values["longitude"],
      res.data.address.latitude,
      res.data.address.longitude
    );

    producer = {
      ...res.data,
      products,
      delivery: delivery.deliveries[0],
      agreement: agreements.length > 0 ? agreements[0] : null
    };
  }

  const loadProducts = async (id) => {
    var res = await graphQLInstance.query(GET_PRODUCER_PRODUCTS, {
      companyId: id
    });

    if (!res.success) {
      // todo
      return;
    }

    if (res.data.length <= 0) {
      return [];
    }

    return res.data;
  }

  const loadDelivery = async (id) =>  {
    var res = await graphQLInstance.query(GET_PRODUCER_DELIVERIES, { 
      input: {
        ids: [id],
        kinds: [DeliveryKind.ProducerToStore.Value]
      } 
    });

    if (!res.success) {
      // todo
      return;
    }

    if (res.data.length <= 0) {
      return [];
    }

    return res.data[0];
  }

  const loadAgreements = async (id) =>  {
    var res = await graphQLInstance.query(GET_PRODUCER_AGREEMENTS, { id } );

    if (!res.success) {
      //todo
      return [];
    }

    return res.data;
  }

  const openAgreement = () => {
    selectedItem.set(null);
    routerInstance.goTo(AgreementRoutes.Details, { id: producer.agreement.id })
  }

  const showCreateAgreementModal = () => {
    open(CreateAgreementModal, {
      submit: () => {},
      producer,
      storeId: GetAuthInstance().user.profile.sub,
      onClosed: (res) => {
        if (res.success) {
          producer.agreement = { id: res.data.id, status: res.data.status };
          producer.hasAgreement = true;
          notificationsInstance.success("Votre demande d'accord commercial a bien été envoyée.");
        }
      }
    });
  };

  function focus(node) {
    node.focus();
    node.scrollIntoView();
  }

  const handleKeyup = ({ key }) => {
    if ($selectedItem && key === "Escape") {
      event.preventDefault();
      selectedItem.set(null);
    }
  };

  $: if ($selectedItem) openAndLoad($selectedItem);
</script>

<svelte:window on:keyup={handleKeyup} />

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
  <div
    class:opacity-0={!$selectedItem}
    class="transition duration-500 ease-in-out px-4 sm:px-6">
    <div class="-mx-10 relative">
        <div
        style="background-position: center; background-image: url('https://images.unsplash.com/photo-1482049016688-2d3e1b311543?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=953&q=80  '); background-size: cover;"
        class="w-full rounded-t-md shadow-md h-40 lg:h-64"
        />
        {#if producer.agreement}
          <button
            on:click={openAgreement}
            class="flex items-center justify-center p-2 uppercase bg-white
            rounded-full shadow absolute cursor-pointer text-sm text-accent"
            style="right: 40px; bottom: -20px;">
            <Icon data={faEye} scale="1.3" class="mr-2" />
            voir accord
          </button>
        {:else if !producer.delivery}
          <button disabled class="flex items-center justify-center p-2 uppercase
           disabled rounded-full shadow absolute cursor-blocked text-sm"
           style="right: 40px; bottom: -20px;">
            <Icon data={faHandshake} scale="1.3" class="mr-2" /> accord impossible
          </button>
        {:else}
          <button on:click={showCreateAgreementModal} class="flex items-center justify-center 
          p-2 uppercase bg-accent rounded-full shadow absolute cursor-pointer text-sm" 
          style="right: 40px; bottom: -20px;">
            <Icon data={faHandshake} scale="1.3" class="mr-2" /> demander accord
          </button>
        {/if}
    </div>
    <div class="title-margin lg:text-center" style="margin-bottom: 20px;">
      <div class="flex justify-between lg:justify-center">
        <p class="text-xl lg:text-3xl font-semibold">{producer.name}</p>
        {#if producer.tags && producer.tags && producer.tags.length > 0 && producer.tags.find((t) => t.name === "Bio")}
          <div class="text-center ml-3">
            <img src="{config.content + '/pictures/tags/icons/bio.png'}" alt="Bio" class="m-auto mb-1" style="max-width: 30px;" />
          </div>
        {/if}
      </div>
      {#if producer.summary}
        <p
          class="text-sm lg:text-base text-justify lg:text-center">
          {producer.summary}
        </p>
      {/if}
    </div>
    <div class="mt-5">
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
      <div class="text-base flex">
        <Icon
          data={faMapMarkerAlt}
          class="mr-2 inline"
          style="margin-bottom: 3px; width: 20px;" />
        <div class="leading-none">
          <div class="mb-1">{producer.address.line1}</div>
          {#if producer.address.line2}
            <div>{producer.address.line2}</div>
          {/if}
          <div>{producer.address.zipcode} {producer.address.city}</div>
        </div>
      </div>
    </div>
    {#if producer.tags && producer.tags.length > 0}
      <div class="mt-5">
          <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">Catégories</label>
          <div class="flex flex-wrap">
              {#each producer.tags as tag}
                  <span class="mx-2 mb-2 px-4 h-6 rounded-full text-xs font-semibold flex items-center cursor-pointer bg-gray-100 text-gray-600">{tag.name}</span>
              {/each}
          </div>
      </div>
    {/if}
    <div class="mt-5 -mx-4">
      <p class="text-2xl font-semibold mb-0 px-4">Produits</p>
      {#each producer.products as product, index}
        <div 
        style="margin-bottom:1px;"
        class="rounded hover:bg-gray-100 transition duration-200
        ease-in-out focus:outline-none">
        <div class="h-full bg-white border-gray-400" class:border-b={index !== producer.products.length - 1}>
          <div class="relative p-4 w-full">
            <div class="bg-white rounded-lg p-0 w-full flex justify-between">
              <div class="pr-8">
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
    </div>
  </div>
{/if}

<style>
  .title-margin {
    margin-top: 30px;
  }
</style>
