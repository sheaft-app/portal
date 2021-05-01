<script>
  import Icon from "svelte-awesome";
  import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
  import { selectedItem } from "./../../stores/app.js";
  import { GetDistanceInfos } from "./../../helpers/distances.js";
	import GetAuthInstance from "./../../services/SheaftAuth.js";
  import { config } from "./../../configs/config";

  export let producer,
    hoveredProducer = null,
    businessLocation = null;

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
      let picture = producer.picture || 'img/icons/farmer.svg';

      img.src = picture;
      img.onload = () => {
        src = picture;
      };

      return;
    }
  }

  const hoverProducer = producer => {
    hoveredProducer = {
      id: producer.id,
      name: producer.name,
      latitude: producer.latitude,
      longitude: producer.longitude
    };
  };

  let distanceInfos = null;

  $: if (businessLocation) {
     distanceInfos = GetDistanceInfos(
        businessLocation.latitude,
        businessLocation.longitude,
        producer.address.latitude,
        producer.address.longitude
      );
  }
</script>

<div
  style="margin-bottom:1px;"
  class="cursor-pointer rounded hover:bg-gray-100 transition duration-200
  ease-in-out focus:outline-none"
  use:lazyLoad
  on:click={() => selectedItem.set(producer)}
  on:mouseenter={() => hoverProducer(producer)}
  on:mouseleave={() => (hoveredProducer = null)}>
  <div class="shadow-md h-full bg-white">
    <div
      class="relative pb-5/6 overflow-hidden bg-black rounded-t-md lg:block
      hidden">
      {#if producer.hasAgreement || producer.hasPendingAgreement}
        <div class="absolute w-full h-full" style="z-index: 1; top: 40%;">
          {#if producer.hasAgreement}
            <span class="bg-white px-3 py-2 uppercase">déjà partenaire</span>
          {/if}
          {#if producer.hasPendingAgreement}
            <span class="bg-blue-400 text-white px-3 py-2 uppercase">en attente</span>
          {/if}
        </div>
      {/if}
      <div
        style="height: 150px; background-color: #fbfbfb;"
        class:opacity-50={producer.hasAgreement || producer.hasPendingAgreement}
        class="transition duration-200 ease-in-out w-full rounded-t-md relative">
        <img
          class:skeleton-box={!src}
          class="h-32 w-32 rounded-full p-1 border
          border-gray-800 border-solid m-auto absolute"
          style="top: calc(50% - 64px);left: calc(50% - 64px);"
          src={src}
          alt="Photo du producteur"/>
      </div>
    </div>
    <div class="relative lg:block flex p-3 lg:p-0">
      <div class="block lg:hidden w-1/4 text-xs">
        <img
            class:skeleton-box={!src}
            class="h-16 w-16 rounded-full p-1 border
            border-gray-800 border-solid m-auto absolute"
            src={src}
            alt="Photo du producteur"/>
      </div>
      <div class="bg-white rounded-lg p-0 pl-3 lg:p-4 w-full">
        <div style="width: 20px; right: 15px;" class="absolute">
          {#if producer.tags && producer.tags.find(c => c.name == 'bio') != null}
            <img src="{config.content + '/pictures/tags/icons/bio.png'}" alt="Bio" class="mb-3" />
          {/if}
        </div>
        <div class="pr-8">
          {#if distanceInfos}
            <div
              class="distance-badge inline-block text-xs font-bold
              text-white px-2 py-1 rounded-full border" style="color: {distanceInfos.color}; border-color: {distanceInfos.color};">
              <div class="inline distance-badge-content">
                <Icon
                  data={faMapMarkerAlt}
                  scale=".8"
                  class="ml-1 mr-1 distance-icon"
                  style="margin-top:-4px;" />
                {distanceInfos.label}
              </div>
            </div>
          {/if}
          <h4
            class="font-semibold text-base lg:text-lg leading-tight
            mb-1 mt-3">
            {producer.name}
          </h4>
          <div
            class="text-xs text-gray-600 uppercase font-semibold">
            <p>{producer.address.zipcode} {producer.address.city}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>