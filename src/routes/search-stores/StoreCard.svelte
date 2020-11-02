<script>
  import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
  import Icon from "svelte-awesome";
  import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
  import { selectedItem } from "./../../stores/app.js";
  import { GetDistanceInfos } from "./../../helpers/distances";

  export let store, hoveredStore = null, businessLocation = null;

  const observer = new IntersectionObserver(onIntersect);
  let src = "";

  function lazyLoad(node) {
    observer.observe(node);
    return {
      destroy() {
        observer.unobserve(node);
      }
    };
  }

  function onIntersect(entries) {
    if (!src && entries[0].isIntersecting) {
      const img = new Image();
      img.src =
        "https://images.unsplash.com/photo-1560493676-04071c5f467b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1868&q=80"; // store.image
      img.onload = () => {
        src =
          "https://images.unsplash.com/photo-1560493676-04071c5f467b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1868&q=80"; // store.image
      };

      return;
    }
  }

  const hoverStore = store => {
    hoveredStore = {
      id: store.id,
      name: store.name,
      latitude: store.address.latitude,
      longitude: store.address.longitude
    };
  };
  
  let distanceInfos = null;

  $: if (businessLocation) {
     distanceInfos = GetDistanceInfos(
        businessLocation.latitude,
        businessLocation.longitude,
        store.address.latitude,
        store.address.longitude
      );
  }
</script>

<div
  style="margin-bottom:1px;"
  class="cursor-pointer rounded hover:bg-gray-100 transition duration-200
  ease-in-out focus:outline-none"
  use:lazyLoad
  on:click={() => selectedItem.set(store)}
  on:mouseenter={() => hoverStore(store)}
  on:mouseleave={() => (hoveredStore = null)}>
  <div class="shadow-md h-full bg-white">
    <div
      class="relative pb-5/6 overflow-hidden bg-black rounded-t-md lg:block
      hidden">
      {#if store.hasAgreement || store.hasPendingAgreement}
        <div class="absolute w-full h-full" style="z-index: 1; top: 40%;">
          {#if store.hasAgreement}
            <span class="bg-white px-3 py-2 uppercase">déjà partenaire</span>
          {/if}
          {#if store.hasPendingAgreement}
            <span class="bg-blue-400 text-white px-3 py-2 uppercase">en attente</span>
          {/if}
        </div>
      {/if}
      <div
        style="height: 150px; background-image: url({src}); background-size:
        cover; background-position: center;"
        class:skeleton-box={!src}
        class:opacity-50={store.hasAgreement || store.hasPendingAgreement}
        class="transition duration-200 ease-in-out w-full rounded-t-md" />
    </div>
    <div class="relative lg:block flex p-3 lg:p-0">
      <div class="block lg:hidden w-1/4 text-xs">
        <div
          style="background-image: url({src}); background-size: cover;
          background-position: center; max-width: 60px;"
          class:skeleton-box={!src}
          class="h-10 mt-1 rounded-lg block" />
      </div>
      <div class="bg-white rounded-lg p-0 pl-3 lg:p-4 w-full">
        <div style="width: 20px; right: 15px;" class="absolute">
          {#if store.tags && store.tags.find(c => c.name == 'bio') != null}
            <img src="https://content.sheaft.com/pictures/tags/icons/bio.png" alt="Bio" class="mb-3" />
          {/if}
        </div>
        <div class="pr-8">
          <div
            class="distance-badge inline-block text-xs font-bold text-white px-2
            py-1 rounded-full border" style="color: {distanceInfos.color}; border-color: {distanceInfos.color};">
            <div class="inline distance-badge-content">
              <Icon
                data={faMapMarkerAlt}
                scale=".8"
                class="ml-1 mr-1 distance-icon"
                style="margin-top:-4px;" />
              {distanceInfos.label}
            </div>
          </div>
          <h4
            class="font-semibold text-base lg:text-lg leading-tight
            mb-1 mt-3">
            {store.name}
          </h4>
          <div
            class="text-xs text-gray-600 uppercase font-semibold">
            <p>{store.address.zipcode} {store.address.city}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
