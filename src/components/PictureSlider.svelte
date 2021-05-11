<script>
  import {onMount} from "svelte";
  import {handleSlideChange} from "./../helpers/app.js";
  import GetGraphQLInstance from "./../services/SheaftGraphQL.js";
  import {GET_PRODUCT_IMAGES} from "./queries.js";
  import {config} from "../configs/config";
  import SwiperCore, {Navigation, Pagination} from 'swiper';
  import {Swiper, SwiperSlide} from 'swiper/svelte';
  import 'swiper/swiper.scss';
  import 'swiper/components/navigation/navigation.scss';
  import 'swiper/components/pagination/pagination.scss';
  
  export let pictures = [], pictureDefault = null, errorsHandler;

  const graphQLInstance = GetGraphQLInstance();

  let ref = null;
  // let allowTouchMove = true;
  // let pagination = {
  //   clickable: true,
  //   bulletActiveClass: 'swiper-pagination-bullet-active bg-accent'
  // };
  // let classes = "w-full shadow-md h-40 lg:h-64 swiper-product-images";
  let allowTouchMove = true;
  let pagination = {
    clickable: true,
    bulletActiveClass: 'swiper-pagination-bullet-active bg-accent'
  };
  let classes = "w-full shadow-md h-40 lg:h-64 swiper-product-images";

  onMount(async () => {
    // TODO : Problème au moment d'appliquer les options sur Swiper
    if(pictures.length == 0) {
      classes += " opacity-50";
      pagination = false;
      allowTouchMove = false;
    }
    console.log(classes);
    console.log(pagination);
    console.log(allowTouchMove);
    SwiperCore.use([Navigation, Pagination]);
	});
</script>

<Swiper
  class= {classes}
  threshold= {6}
  preventClicks= {false}
  preventClicksPropagation= {false}
  spaceBetween= {0}
  slidesPerView= {1}
  centeredSlidesBounds= {true}
  pagination= {pagination}
  allowTouchMove= {allowTouchMove}
  navigation
  bind:this={ref}
  on:swiper={(e) => handleSlideChange(e, ref)}
  on:slideChange={(e) => handleSlideChange(e, ref)}
>
  {#each pictures as picture}
    <SwiperSlide
      style="background-position: center; background-image: url({picture.url}); background-size: cover;"
    >
    </SwiperSlide>
  {:else}
    <SwiperSlide
      style="background-position: center; background-image: url({pictureDefault}); background-size: cover;"
    >
    </SwiperSlide>
  {/each}
</Swiper>