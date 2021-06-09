<script>
	import Icon from "svelte-awesome";
	import { faMapMarkerAlt, faPhone, faEnvelope } from "@fortawesome/free-solid-svg-icons";
	import { getContext, onMount } from "svelte";
	import DayOfWeekKind from "../../enums/DayOfWeekKind";
	import { groupBy, timeSpanToFrenchHour } from "./../../helpers/app";
	import Loader from "../../components/Loader.svelte";
	import ChangeCatalogModal from "./ChangeCatalogModal.svelte";
	import ChangeDeliveryModal from "./ChangeDeliveryModal.svelte";
	import GetRouterInstance from "../../services/SheaftRouter";
	import SheaftErrors from "../../services/SheaftErrors";

	const { open } = getContext("modal");
	const routerInstance = GetRouterInstance();
	const errorsHandler = new SheaftErrors();

	export let agreement, distanceInfos;

	let store = null;
	let openings = [];
	let isLoading = true;

	onMount(() => {
		openings = groupBy(agreement.store.openingHours, (item) => [item.day]);
		store = agreement.store;
		isLoading = false;
	});

	const showChangeDeliveryModal = () => {
		open(ChangeDeliveryModal, {
			agreement: agreement,
			errorsHandler: errorsHandler,
			onClose: async (res) => {
				if (res.success) {
					routerInstance.reload();
				}
			},
		});
	};

	const showChangeCatalogModal = () => {
		open(ChangeCatalogModal, {
			agreement: agreement,
			errorsHandler: errorsHandler,
			onClose: async (res) => {
				if (res.success) {
					routerInstance.reload();
				}
			},
		});
	};
</script>

{#if isLoading}
	<Loader />
{:else}
	<div class="mt-5">
		<div
			id="store-card"
			class="bg-white overflow-hidden rounded-lg p-3 lg:p-6 shadow flex
          relative flex-wrap justify-between lg:mt-10"
			style="transition: all .4s ease-in-out;"
		>
			<img
				class="h-10 w-10 md:h-24 md:w-24 rounded-full p-1 md:mx-0 border
            border-gray-800 border-solid"
				src={store.picture ? store.picture : "img/icons/store.svg"}
				alt="Magasin"
			/>
			<div class="w-7/12 md:w-6/12">
				<p class="text-base lg:text-lg">{store.name}</p>
				<div class="text-gray-600 text-sm lg:text-base">
					{store.address.line1}
				</div>
				{#if store.address.line2}
					<div class="text-gray-600 text-sm lg:text-base">
						{store.address.line2}
					</div>
				{/if}
				<div class="text-gray-600 text-sm lg:text-base">
					{store.address.zipcode}
					{store.address.city}
				</div>
				<p class="text-base mb-1 mt-3">
					<Icon data={faPhone} class="mr-1 inline" style="margin-bottom: 1px; width: 20px;" />
					{#if store.phone}
						<a href="tel:{store.phone}">
							{store.phone}
						</a>
					{:else}Non renseigné{/if}
				</p>
				<p class="text-base mb-1">
					<Icon data={faEnvelope} class="mr-1 inline" style="margin-bottom: 3px; width: 20px;" />
					<a href="mailto:{store.email}">
						{store.email}
					</a>
				</p>
			</div>
			{#if distanceInfos}
				<div
					class="distance-badge-content text-sm lg:text-base
              w-2/12 text-center rounded-full h-10 flex justify-center
              items-center border"
					style="color: {distanceInfos.color}; border-color: {distanceInfos.color};"
				>
					<Icon data={faMapMarkerAlt} scale="1.4" class="pr-1" />
					<p class="font-bold">{distanceInfos.label}</p>
				</div>
			{/if}
			{#if store.summary}
				<div class="w-full text-gray-800 pt-5 pb-2">
					{store.summary}
				</div>
			{/if}
			{#if store.tags && store.tags.length > 0}
				<div class="mt-5 w-full">
					<label
						class="block uppercase tracking-wide text-gray-700 text-xs font-bold
          mb-2"
					>
						{store.name} est intéressé par
					</label>
					<div class="flex flex-wrap">
						{#each store.tags as tag}
							<span
								class="mx-2 mb-2 px-4 h-6 rounded-full text-xs font-semibold flex
              items-center cursor-pointer bg-gray-100 text-gray-600"
							>
								{tag.name}
							</span>
						{/each}
					</div>
				</div>
			{/if}
			{#if openings.length > 0}
				<div class="mt-5 w-full">
					<label
						class="block uppercase tracking-wide text-gray-700 text-xs font-bold
          mb-2"
					>
						Horaires d'ouverture
					</label>
					{#each openings as opening}
						<div class="flex mb-2">
							<p style="min-width: 100px;">
								{DayOfWeekKind.label(opening[0].day)}
							</p>
							<div class="ml-3">
								{#each opening as openingHour}
									<p>{`${timeSpanToFrenchHour(openingHour.from)} à ${timeSpanToFrenchHour(openingHour.to)}`}</p>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
	<div class="flex justify-between flex-wrap mt-5 card shadow rounded-lg bg-white">
		<div class="w-full lg:w-2/4 p-3 lg:p-6 border-b lg:border-b-0 lg:border-r border-gray-300">
			<p class="text-sm">
				Créneau de livraison (<a href="javascript:void(0)" on:click={showChangeDeliveryModal}>Changer le créneau</a>)
			</p>
			{#if agreement.delivery}
				<p class="font-semibold mb-2">{agreement.delivery.name}</p>
				{#each agreement.delivery.deliveryHours as deliveryHour, index}
					<div
						class="flex border-gray-300 py-2"
						class:pb-2={index !== agreement.delivery.deliveryHours.length - 1}
						class:border-b={index !== agreement.delivery.deliveryHours.length - 1}
					>
						<p style="min-width: 100px;">
							{DayOfWeekKind.label(deliveryHour.day)}
						</p>
						<div>
							<p>{`${timeSpanToFrenchHour(deliveryHour.from)} à ${timeSpanToFrenchHour(deliveryHour.to)}`}</p>
						</div>
					</div>
				{/each}
			{:else}
				<p class="font-semibold mb-2">À sélectionner</p>
			{/if}
		</div>
		<div class="w-full lg:w-2/4 p-3 lg:p-6">
			<p class="text-sm">
				Catalogue assigné (<a href="javascript:void(0)" on:click={showChangeCatalogModal}>Changer le catalogue</a>)
			</p>
			{#if agreement.catalog}
				<p class="font-semibold mb-2">{agreement.catalog.name}</p>
				{#each agreement.catalog.products as product}
					<div class="flex justify-between py-2 whitespace-no-wrap border-b border-gray-200">
						<div class="leading-5 font-medium truncate" style="max-width: 180px;">
							{product.name}
							<p class="text-gray-600 text-sm">#{product.reference}</p>
						</div>
						<div class="leading-5 font-medium truncate" style="max-width: 100px;">
							<span>{product.wholeSalePricePerUnit}€ HT</span>
						</div>
					</div>
				{/each}
			{:else}
				<p class="font-semibold mb-2">À sélectionner</p>
			{/if}
		</div>
	</div>
{/if}
