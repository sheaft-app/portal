<script>
	import DayOfWeekKind from "./../../enums/DayOfWeekKind.js";
	import {onMount, onDestroy, getContext} from "svelte";
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
	import CreateAgreementModal from "./CreateAgreementModal.svelte";
	import {GetDistanceInfos} from "./../../helpers/distances";
	import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
	import {GET_STORE_DETAILS, GET_STORE_AGREEMENTS} from "./queries.js";
	import {selectedItem} from "./../../stores/app.js";
	import { formatMoney, formatConditioningDisplay, encodeQuerySearchUrl, timeSpanToFrenchHour, groupBy } from "./../../helpers/app";
	import AgreementRoutes from "../agreements/routes";
	import GetNotificationsInstance from "./../../services/SheaftNotifications.js";
	import {config} from "../../configs/config.js";
	import {authUserAccount} from "../../stores/auth";
	import ProducerReadMoreModal from "../external/ProducerReadMoreModal.svelte";

	const graphQLInstance = GetGraphQLInstance();
	const routerInstance = GetRouterInstance();
	const notificationsInstance = new GetNotificationsInstance();
	const {open} = getContext("modal");

	let store = null;
	let storeDoesntExist = false;
	let distanceInfos = null;
	let isLoading = false;
	let openings = [];

	async function loadAgreements(id) {
		var res = await graphQLInstance.query(GET_STORE_AGREEMENTS, {id});

		if (!res.success) {
			//todo
			return [];
		}

		return res.data;
	}

	const handleKeyup = ({key}) => {
		if ($selectedItem && key === "Escape") {
			event.preventDefault();
			selectedItem.set(null);
		}
	};

	const openAndLoad = async () => {
		history.pushState({selected: $selectedItem}, "Détails du magasin");

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

		store = res.data;
		isLoading = false;
	}

	const openAgreement = () => {
		selectedItem.set(null);
		routerInstance.goTo(AgreementRoutes.Details, {id: store.agreement.id})
	}

	const showCreateAgreementModal = () => {
		open(CreateAgreementModal, {
			submit: () => {
			},
			store,
			storeId: $authUserAccount.profile.id,
			onClosed: res => {
				if (res.success) {
					store.agreement = {id: res.data.id, status: res.data.status};
					store.hasAgreement = true;
					notificationsInstance.success("Votre demande d'accord commercial a bien été envoyée.");
				}
			}
		});
	};

	const openReadMoreModal = () => {
		open(ProducerReadMoreModal, {
			producer
		})
	}

	onDestroy(() => openings = []);

	$: if ($selectedItem) openAndLoad($selectedItem);
</script>

<svelte:window on:keyup={handleKeyup}/>

<div
	class="py-3 px-4 sm:px-6 bg-white top-0 left-0 w-full h-12 sticky shadow hidden lg:block"
	style="z-index: 2;">
	<button
		on:click={() => selectedItem.set(null)}
		aria-label="Fermer"
		class="font-bold flex items-center">
		<Icon data={faTimesCircle} class="mr-2"/>
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
			<div class="skeleton-box w-full rounded-t-md shadow-md h-40 lg:h-64"/>
		</div>
		<div class="text-center m-auto" style="margin-top: 20px;">
			<div class="w-64 h-10 skeleton-box mb-2 m-auto"/>
			<div class="w-48 h-10 skeleton-box mb-2 m-auto"/>
			<div class="w-80 h-24 skeleton-box mb-2 m-auto"/>
			<div class="w-48 h-10 skeleton-box m-auto mb-2"/>
			<div class="w-full skeleton-box m-auto" style="height: 190px;"/>
			<div class="mt-5">
				<div class="w-48 skeleton-box h-10 mb-2"/>
				<div class="w-full skeleton-box m-auto" style="height: 190px;"/>
			</div>
		</div>
	</div>
{:else}
	<div class="mt-5 mb-5">
		<img
			class="h-20 w-20 md:h-32 md:w-32 rounded-full p-1 border
        border-gray-800 border-solid m-auto"
			src={store.picture ? store.picture : 'img/icons/store.svg'}
			alt="Photo du magasin"/>
		<div class="w-full">
			<div
				class:opacity-0={!$selectedItem}
				class="transition duration-500 ease-in-out px-4 sm:px-6">
				<div class="title-margin lg:text-center" style="margin-bottom: 10px;">
					<div class="flex justify-center">
						<p class="text-xl lg:text-3xl font-semibold">{store.name}</p>
					</div>
				</div>
			</div>
			{#if store.summary}
				<div class="w-full px-4 text-center mb-5">
					<p class="text-sm">{store.summary}</p>
					{#if store.description}
						<button on:click={openReadMoreModal} class="btn btn-link mt-2 m-auto">Lire plus</button>
					{/if}
				</div>
			{:else if !store.summary && store.description}
				<p class="text-sm text-center px-4 mb-5">
					{#if store.description.length > 300}
						<p>
							{store.description.slice(0, 300).concat('...')}
							<button on:click={openReadMoreModal} class="btn-link m-auto">Lire plus</button>
						</p>
					{:else}
						{store.description}
					{/if}
				</p>
			{/if}
			{#if store.agreement}
				<button
					on:click={openAgreement}
					class="btn btn-outline flex items-center justify-center py-3 px-6 uppercase
            rounded-full cursor-pointer text-sm btn-outline text-accent mb-2 m-auto">
					<Icon data={faEye} scale="1.3" class="mr-2"/>
					voir accord
				</button>
			{:else}
				<button on:click={showCreateAgreementModal} class="flex py-3 px-6 items-center justify-center
          p-2 uppercase bg-accent rounded-full cursor-pointer text-sm mb-2 m-auto">
					<Icon data={faHandshake} scale="1.3" class="mr-2"/>
					demander accord
				</button>
			{/if}
			<div class="flex flex-wrap justify-between w-full px-4 mt-5">
				<div class="flex flex-row justify-start items-start mb-3 w-2/3">
					<div>
						<p class="font-semibold">Adresse</p>
						<p>{store.address.line1}</p>
						{#if store.address.line2}
							<p>{store.address.line2}</p>
						{/if}
						<p>{store.address.zipcode} {store.address.city}</p>
						<a
							class="mt-1"
							target="_blank"
							href={`https://www.google.com/maps/search/?api=1&query=${encodeQuerySearchUrl(store.address)}`}>
							Voir sur Google Maps
						</a>
					</div>
				</div>
				{#if store.tags && store.tags.length > 0 && store.tags.find((t) => t.name === "Bio")}
					<div class="text-center ml-3">
						<img src="{config.content + '/pictures/tags/icons/bio.png'}" alt="Bio" class="m-auto mb-1"
								 style="max-width: 30px;"/>
					</div>
				{/if}
				<div>
					<p class="text-base mb-1">
						<Icon
							data={faPhone}
							class="mr-1 inline"
							style="margin-bottom: 1px; width: 20px;"/>
						{#if store.phone}
							<a href="tel:{store.phone}">
								{store.phone}
							</a>
						{:else}
							<span>Non renseigné</span>
						{/if}
					</p>
					<p class="text-base mb-1">
						<Icon
							data={faEnvelope}
							class="mr-1 inline"
							style="margin-bottom: 3px; width: 20px;"/>
						<a href="mailto:{store.email}">
							{store.email}
						</a>
					</p>
				</div>
			</div>
			{#if store.facebook || store.instagram}
				<p class="text-gray-600 mb-2 text-sm mt-4">Retrouvez-nous sur les réseaux
					sociaux !</p>
				<div class="flex flex-row flex-wrap social-medias justify-center">
					{#if store.facebook}
						<a href={store.facebook} target="_blank">
							<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#1877F2"><title>
								Facebook</title>
								<path
									d="M23.9981 11.9991C23.9981 5.37216 18.626 0 11.9991 0C5.37216 0 0 5.37216 0 11.9991C0 17.9882 4.38789 22.9522 10.1242 23.8524V15.4676H7.07758V11.9991H10.1242V9.35553C10.1242 6.34826 11.9156 4.68714 14.6564 4.68714C15.9692 4.68714 17.3424 4.92149 17.3424 4.92149V7.87439H15.8294C14.3388 7.87439 13.8739 8.79933 13.8739 9.74824V11.9991H17.2018L16.6698 15.4676H13.8739V23.8524C19.6103 22.9522 23.9981 17.9882 23.9981 11.9991Z"/>
							</svg>
						</a>
					{/if}
					{#if store.instagram}
						<a href={store.instagram} target="_blank">
							<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#E4405F"><title>
								Instagram</title>
								<path
									d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
							</svg>
						</a>
					{/if}
				</div>
			{/if}
				<div class="w-full px-4 mt-5">
					<label
						class="block uppercase tracking-wide text-gray-700 text-xs font-bold
          mb-2">
						Intéressé par
					</label>
					<div class="flex flex-wrap">
            {#if store.tags && store.tags.length > 0}
						{#each store.tags as tag}
            <span
							class="mx-2 mb-2 px-4 h-6 rounded-full text-xs font-semibold flex
              items-center cursor-pointer bg-gray-100 text-gray-600">
              {tag.name}
            </span>
						{/each}
            {:else}
            <p>Ce magasin n'a pas renseigné les produits qui l'intéressait</p>
            {/if}
					</div>
				</div>
				<div class="w-full px-4 mt-5">
					<label
						class="block uppercase tracking-wide text-gray-700 text-xs font-bold
          mb-2">
						Horaires d'ouverture
					</label>
          {#if openings && openings.length > 0}
					{#each openings as opening}
						<div class="flex mb-2">
							<p style="min-width: 100px;">
								{DayOfWeekKind.get(opening[0].day).Label}
							</p>
							<div class="ml-3">
								{#each opening as openingHour}
									<p>{`${timeSpanToFrenchHour(openingHour.from)} à ${timeSpanToFrenchHour(openingHour.to)}`}</p>
								{/each}
							</div>
						</div>
					{/each}

			{:else}
      <p>Ce magasin n'a pas renseigné ses horaires d'ouvertures</p>
      {/if}
				</div>
		</div>
	</div>
{/if}

<style>
	.title-margin {
		margin-top: 20px;
	}
</style>
