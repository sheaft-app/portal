<script>
    import { onMount } from "svelte";
    import Icon from "svelte-awesome";
    import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";
    import SwiperCore, { Navigation } from 'swiper';
    import ProductCartQuantity from "./controls/ProductCartQuantity.svelte";
    import { Swiper, SwiperSlide } from 'swiper/svelte';
    import cart from "./../stores/cart";
    import { formatMoney } from "./../helpers/app.js";
    import { formatConditioningDisplay } from "./../helpers/app";
    import RatingStars from "./rating/RatingStars.svelte";
    import GetAuthInstance from "./../services/SheaftAuth.js";
    import GetGraphQLInstance from "./../services/SheaftGraphQL.js";
    import { GET_PRODUCER_PRODUCTS } from "./queries.js";

    export let productParentId, producerName, producerId, errorsHandler;

    const graphQLInstance = GetGraphQLInstance();

    let productsSuggestions = [];

    SwiperCore.use([Navigation]);

    onMount(async () => {
        if (producerId) {
            const result = await graphQLInstance.query(GET_PRODUCER_PRODUCTS, { id: producerId }, errorsHandler.Uuid);
            productsSuggestions = result.data.filter((p) => p.id !== productParentId); 
        } 
    });

    const handleSlideChange = (e) => {
        const nextButton = document.getElementsByClassName('swiper-button-next')[0];
        const prevButton = document.getElementsByClassName('swiper-button-prev')[0];
        
        let elem = e.detail[0];
        // C'est une slide ?
        if (Array.isArray(e.detail[0])) {
        elem = elem.shift();
        }

        if (elem.isBeginning && elem.isEnd) {
            prevButton.classList.add('hidden');
            nextButton.classList.add('hidden');
        } else if (elem.isBeginning) {
            prevButton.classList.add('hidden');
            nextButton.classList.remove('hidden');
        } else if (elem.isEnd) {
            prevButton.classList.remove('hidden');
            nextButton.classList.add('hidden');
        } else {
            prevButton.classList.remove('hidden');
            nextButton.classList.remove('hidden');
        }
    }

    $: suggestedProductIsInCart = product => $cart.products.find(c => c.id === product.id);
</script>

{#if productsSuggestions.length > 0}
    <p class="font-semibold pt-5 mb-3">Autres produits de {producerName}</p>
    <Swiper
        navigation
        threshold={6}
        preventClicks={false}
        preventClicksPropagation={false}
        breakpoints={{
        320: {
            slidesPerView: 1,
            spaceBetween: 0
        },
        375: {
            slidesPerView: 2,
            spaceBetween: 10
        },
        728: {
            slidesPerView: 3,
            spaceBetween: 10
        },
        1025: {
            slidesPerView: 4,
            spaceBetween: 10
        }
        }}
        spaceBetween={20}
        slidesPerView={2}
        on:swiper={(e) => handleSlideChange(e)}
        on:slideChange={(e) => handleSlideChange(e)}
    >
        {#each productsSuggestions as suggestion}
            <SwiperSlide let:data="{{ isNext }}">
                <div class="border border-light rounded-lg h-full bg-white">
                    <div
                    class="relative pb-5/6 overflow-hidden bg-black rounded-t-md block">
                        {#if suggestedProductIsInCart(suggestion)}
                            <div class="absolute py-1 px-2  text-center text-normal text-xs bg-white w-75 rounded-lg" style="
                                line-height: 0;
                                z-index: 1;
                                top: 5px;
                                left: 5px;
                                box-shadow: rgba(0, 0, 0, .6) 0px 0px 5px 3px;">
                                <Icon data={faShoppingCart} style="width: 14px;" />
                                Dans le panier
                            </div>
                        {/if}
                        <div
                        style="height: 95px; background-image: url({suggestion.picture}); background-size:
                        cover; background-position: top;"
                        class:opacity-50={suggestedProductIsInCart(suggestion)}
                        class="transition duration-200 ease-in-out w-full rounded-t-md">
                            {#if suggestion.picture.includes("pictures/tags/images/") && !suggestedProductIsInCart(suggestion)}
                                <div class="absolute" style="z-index: 1; left: 50%; top: 40%; margin-left: -94px;">
                                    <div class="text-white text-sm p-2 bg-gray-800 text-center">
                                    Aucune image disponible
                                    </div>
                                </div>
                            {/if}
                        </div>
                    </div>
                    <div class="relative block p-0">
                        <div class="bg-white rounded-lg p-0 px-2 lg:p-4 w-full pb-4">
                            <div style="width: 30px; right: 15px;" class="absolute">
                                <!-- {#if suggestion.tags.map(t => t.name).includes('bio')}
                                <img src="{config.content + '/pictures/tags/icons/bio.png'}" alt="Bio" class="mb-1" />
                                {/if} -->
                                {#if suggestion.isReturnable}
                                    <img src="./img/returnable.svg" alt="Consigné" class="mb-1" style="transform: scale(0.7);" />
                                {/if}
                            </div>
                            <div class="py-2 lg:py-0 lg:pr-8">
                                <h4
                                class="font-semibold text-base lg:text-lg leading-tight mb-0">
                                    {suggestion.name}
                                </h4>
                                <div
                                class="mt-2 md:mt-0 inline-flex items-center w-full text-xxs
                                lg:text-sm">
                                    <RatingStars rating={suggestion.rating} />
                                    <span class="text-gray-600 ml-2 hidden lg:block">
                                        {suggestion.rating || 'Aucun avis'}
                                    </span>
                                </div>
                                <div
                                class="text-base lg:text-lg w-full font-semibold mb-2
                                justify-between items-center block">
                                    {formatMoney(suggestion.onSalePricePerUnit)}
                                    <span class="text-xxs lg:text-sm lg:inline hidden font-normal">
                                        {formatConditioningDisplay(suggestion.conditioning, suggestion.quantityPerUnit, suggestion.unit)}
                                    </span>
                                </div>
                            </div>
                            <div class="flex items-center justify-between">
                                {#if !GetAuthInstance().isInRole(["STORE", "PRODUCER"])}
                                    <div class="w-full">
                                        {#if suggestion.available}
                                            <ProductCartQuantity productId={suggestion.id} />
                                        {:else}
                                            <div>Non disponible</div>
                                        {/if}
                                    </div>
                                {/if}
                            </div>
                        </div>
                    </div>
                </div>
            </SwiperSlide>
        {/each}
    </Swiper>
{/if}