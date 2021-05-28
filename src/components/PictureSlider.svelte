<script>
	import {onMount} from "svelte";
	import SwiperCore, {Navigation} from 'swiper';
	import {Swiper, SwiperSlide} from 'swiper/svelte';
	import 'swiper/swiper.scss';
	import 'swiper/components/navigation/navigation.scss';
	import 'swiper/components/pagination/pagination.scss';
	import {config} from './../configs/config';

	export let elements = [], allowTouchMove = true, classes = "w-full shadow-md h-40 lg:h-64";

	let swipper = null;
	let isEnd = false, isBeginning = false;

	onMount(() => {
		SwiperCore.use([Navigation]);
	});

	const initSwipper = e => {
		swipper = e.detail[0];
		updateCursor();
	}

	const prev = () => {
		swipper.slidePrev();
		updateCursor();
	}

	const next = () => {
		swipper.slideNext();
		updateCursor();
	}

	const updateCursor = () => {
		isEnd = swipper.isEnd;
		isBeginning = swipper.isBeginning;
	}

</script>

<Swiper
	class={classes}
	threshold={6}
	preventClicks={false}
	preventClicksPropagation={false}
	spaceBetween={0}
	slidesPerView={1}
	centeredSlidesBounds={true}
	allowTouchMove={allowTouchMove}
	allowSlideNext={true}
	allowSlidePrev={true}
	on:swiper={initSwipper}
	on:slideChange={updateCursor}>
	{#each elements as element}
		<SwiperSlide>
			{#if element.url.includes("pictures/tags/")}
				<div class="absolute" style="filter:blur(0px);z-index: 1; left: 50%; top: 40%; margin-left: -105px;">
					<div class="text-white text-lg p-1 bg-gray-800">Aucune image disponible</div>
				</div>
			{/if}
			<div
				style="background-image: url({element.url});background-size: contain;background-repeat:no-repeat;background-position: center;height:100%;{element.url.includes('pictures/tags/') ? 'filter:blur(2px)' : ''}"></div>
		</SwiperSlide>
	{/each}
</Swiper>

<div class="swiper-button-next bg-accent swiper-slide" on:click={next} class:hidden={isEnd}></div>
<div class="swiper-button-prev bg-accent" on:click={prev} class:hidden={isBeginning}></div>
