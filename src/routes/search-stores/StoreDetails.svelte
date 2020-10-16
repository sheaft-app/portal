<script>
  import DayOfWeekKind from "./../../enums/DayOfWeekKind.js";
  import { onMount, onDestroy, getContext } from "svelte";
  import Icon from "svelte-awesome";
  import { faMapMarkerAlt, faPhone, faEnvelope, faTimesCircle, faHandshake, faEye } from "@fortawesome/free-solid-svg-icons";
  import GetRouterInstance from "../../services/SheaftRouter.js";
  import CreateAgreementModal from "./CreateAgreementModal.svelte";
  import { GetDistanceInfos } from "./../../helpers/distances";
  import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
  import { GET_STORE_DETAILS, GET_STORE_AGREEMENTS } from "./queries.js";
  import { selectedItem } from "./../../stores/app.js";
  import { groupBy } from "./../../helpers/app";
  import AgreementRoutes from "../agreements/routes";

  const graphQLInstance = GetGraphQLInstance();
  const routerInstance = GetRouterInstance();
  const { open } = getContext("modal");

  let store = null;
  let storeDoesntExist = false;
  let distanceInfos = null;
  let isLoading = false;
  let openings = [];

  async function loadAgreements(id) {
    var res = await graphQLInstance.query(GET_STORE_AGREEMENTS, { id });

    if (!res.success) {
      //todo
      return [];
    }

    return res.data;
  }

  const handleKeyup = ({ key }) => {
    if ($selectedItem && key === "Escape") {
      event.preventDefault();
      selectedItem.set(null);
    }
  };

  const openAndLoad = async () => {
    history.pushState({ selected: $selectedItem}, "Détails du magasin");

    const values = routerInstance.getQueryParams();
    isLoading = true;

    const storeDetails = document.getElementById("store-details");

    if (storeDetails) {
      storeDetails.scrollTop = 0;
    }

    var res = await graphQLInstance.query(GET_STORE_DETAILS, {
      id: $selectedItem.id
    });

    if (!res.success) {
      //TODO
      isLoading = false;
      console.error("No store found for this ID");
      storeDoesntExist = true;
      return;
    }

    openings = groupBy(res.data.openingHours, item => [item.day]);
    distanceInfos = GetDistanceInfos(
      values["latitude"],
      values["longitude"],
      res.data.address.latitude,
      res.data.address.longitude
    );

    const agreements = await loadAgreements(res.data.id);

    store = {
      ...res.data,
      agreement: agreements.length > 0 ? agreements[0] : null
    };
  }

  const openAgreement = () => {
    selectedItem.set(null);
    routerInstance.goTo(AgreementRoutes.Details, { id: store.agreement.id })
  }

  const showCreateAgreementModal = () => {
    open(CreateAgreementModal, {
      submit: () => {},
      store,
      onClosed: res => {
        if (res.success) {
          store.agreement = res.data;
        }
      }
    });
  };
  
  onDestroy(() => openings = []);

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
{#if storeDoesntExist} 
  <div class="mb-10 p-4 border border-red-500 text-red-500 lg:flex flex-row justify-center">
    <p class="text-center">Mince, il semblerait que ce magasin n'existe plus !</p>
  </div>
{:else if !store}
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
        style="background-position: center; background-image:
        url('https://images.unsplash.com/photo-1482049016688-2d3e1b311543?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=953&q=80
        '); background-size: cover;"
        class="w-full rounded-t-md shadow-md h-40 lg:h-64" />
      {#if !store.agreement}
        <button
          on:click={showCreateAgreementModal}
          class="flex items-center justify-center p-2 uppercase bg-accent
          rounded-full shadow absolute cursor-pointer text-sm"
          style="right: 40px; bottom: -20px;">
          <Icon data={faHandshake} scale="1.3" class="mr-2" />
          demander accord
        </button>
      {:else}
        <button
          on:click={openAgreement}
          class="flex items-center justify-center p-2 uppercase bg-white
          rounded-full shadow absolute cursor-pointer text-sm text-accent"
          style="right: 40px; bottom: -20px;">
          <Icon data={faEye} scale="1.3" class="mr-2" />
          voir accord
        </button>
      {/if}
    </div>
    <div class="title-margin lg:text-center" style="margin-bottom: 20px;">
      <div class="flex justify-between lg:justify-center">
        <p class="text-xl lg:text-3xl font-semibold">{store.name}</p>
        {#if store.tags && store.tags.length > 0 && store.tags.find(t => t.name === 'Bio')}
          <div class="text-center ml-3">
            <img
              src="./img/labels/bio.png"
              alt="Bio"
              class="m-auto mb-1"
              style="max-width: 30px;" />
          </div>
        {/if}
      </div>
      {#if store.description}
        <p class="text-sm lg:text-base text-justify lg:text-center">
          {store.description}
        </p>
      {/if}
    </div>
    <div class="mt-5">
      <p class="text-base mb-1">
        <Icon
          data={faPhone}
          class="mr-1 inline"
          style="margin-bottom: 1px; width: 20px;" />
        {#if store.phone}
          <a href="tel:{store.phone}">{store.phone}</a>
        {:else}
          <span>Non renseigné</span>
        {/if}
      </p>
      <p class="text-base mb-1">
        <Icon
          data={faEnvelope}
          class="mr-1 inline"
          style="margin-bottom: 3px; width: 20px;" />
        <a href="mailto:{store.email}">{store.email}</a>
      </p>
      <div class="text-base flex">
        <Icon
          data={faMapMarkerAlt}
          class="mr-2 inline"
          style="margin-bottom: 3px; width: 20px;" />
        <div class="leading-none">
          <div class="mb-1">{store.address.line1}</div>
          {#if store.address.line2}
            <div>{store.address.line2}</div>
          {/if}
          <div>{store.address.zipcode} {store.address.city}</div>
        </div>
      </div>
    </div>
    {#if store.tags && store.tags.length > 0}
      <div class="mt-5">
        <label
          class="block uppercase tracking-wide text-gray-700 text-xs font-bold
          mb-2">
          Catégories
        </label>
        <div class="flex flex-wrap">
          {#each store.tags as tag}
            <span
              class="mx-2 mb-2 px-4 h-6 rounded-full text-xs font-semibold flex
              items-center cursor-pointer bg-gray-100 text-gray-600">
              {tag.name}
            </span>
          {/each}
        </div>
      </div>
    {/if}
    {#if openings.length > 0}
      <div class="mt-5">
        <label
          class="block uppercase tracking-wide text-gray-700 text-xs font-bold
          mb-2">
          Horaires d'ouverture
        </label>
        {#each openings as opening}
          <div class="flex mb-2">
            <p style="min-width: 100px;">
              {DayOfWeekKind.label(opening[0].day)}
            </p>
            <div class="ml-3">
              {#each opening as openingHour}
                <p>{`${opening.from} à ${opening.to}`}</p>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style>
  .title-margin {
    margin-top: 20px;
  }
</style>
