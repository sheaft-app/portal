<script>
	import {slide} from "svelte/transition";
	import Icon from "svelte-awesome";
	import {
		faChevronDown,
		faChevronUp,
		faMapMarkerAlt,
		faPhone,
		faEnvelope,
		faChevronLeft
	} from "@fortawesome/free-solid-svg-icons";
	import {onMount} from "svelte";
	import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
	import GetAuthInstance from "./../../services/SheaftAuth.js";
	import GetRouterInstance from "./../../services/SheaftRouter";
	import AgreementRoutes from "./routes";
	import {GET_STORE_DETAILS} from "../account/queries";
	import SheaftErrors from "../../services/SheaftErrors";
	import DayOfWeekKind from "../../enums/DayOfWeekKind";
	import {groupBy, timeSpanToFrenchHour} from "./../../helpers/app";

	export let storeId, distanceInfos;

	const errorsHandler = new SheaftErrors();
	const authManager = GetAuthInstance();
	const graphQLInstance = GetGraphQLInstance();
	const routerInstance = GetRouterInstance();

	let store = null;
	let openings = [];
	let deliveries = [];
	let deliveryHours = [];
	let storeDescriptionExpanded = false;

	const getStore = async id => {
		var res = await graphQLInstance.query(GET_STORE_DETAILS, {
			id: id
		}, errorsHandler.Uuid);

		if (!res.success) {
			//TODO
			routerInstance.goTo(AgreementRoutes.List);
			return;
		}

		openings = groupBy(res.data.openingHours, item => [item.day]);
		store = res.data;
	};

	onMount(async () => {
		await getStore(storeId);
	})
</script>

{#if store}
	<div class="mt-5">
		<div
			id="store-card"
			class="bg-white overflow-hidden rounded-lg p-3 lg:p-6 shadow flex
          relative flex-wrap justify-between lg:mt-10"
			style="transition: all .4s ease-in-out;">
			<img
				class="h-10 w-10 md:h-24 md:w-24 rounded-full p-1 md:mx-0 border
            border-gray-800 border-solid"
				src={store.picture ? store.picture : 'img/icons/store.svg'}
				alt="Magasin"/>
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
					{store.address.zipcode} {store.address.city}
				</div>
				<p class="text-base mb-1 mt-3">
					<Icon
						data={faPhone}
						class="mr-1 inline"
						style="margin-bottom: 1px; width: 20px;" />
					{#if store.phone}
						<a href="tel:{store.phone}">
							{store.phone}
						</a>
					{:else}Non renseigné{/if}
				</p>
				<p class="text-base mb-1">
					<Icon
						data={faEnvelope}
						class="mr-1 inline"
						style="margin-bottom: 3px; width: 20px;" />
					<a href="mailto:{store.email}">
						{store.email}
					</a>
				</p>
			</div>
			{#if distanceInfos}
				<div
					class="distance-badge-content text-sm lg:text-base
              w-2/12 text-center rounded-full h-10 flex justify-center
              items-center border" style="color: {distanceInfos.color}; border-color: {distanceInfos.color};">
					<Icon data={faMapMarkerAlt} scale="1.4" class="pr-1"/>
					<p class="font-bold">{distanceInfos.label}</p>
				</div>
			{/if}
			{#if store.summary}
				<div class="w-full text-gray-800 pt-5 pb-2">
					{store.summary}
				</div>
			{/if}
			<div
				on:click={() => storeDescriptionExpanded = !storeDescriptionExpanded}
				class:hidden={!store.description}
				class="rounded-b-lg w-full mb-2 bg-white
            text-center font-semibold flex
            justify-center items-center cursor-pointer">
				{#if !storeDescriptionExpanded}
					<Icon data={faChevronDown} class="mr-2"/>
					<span>En savoir plus sur le magasin</span>
				{:else}
					<Icon data={faChevronUp} class="mr-2"/>
					<span>Replier le bandeau</span>
				{/if}
			</div>
			{#if storeDescriptionExpanded && store.description}
				<div transition:slide id="store-description" class="w-full text-gray-600 py-5">
					{store.description}
				</div>
			{/if}
			{#if store.tags && store.tags.length > 0}
				<div class="mt-5 w-full">
					<label
						class="block uppercase tracking-wide text-gray-700 text-xs font-bold
          mb-2">
						{store.name} est intéressé par
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
				<div class="mt-5 w-full">
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
									<p>{`${timeSpanToFrenchHour(openingHour.from)} à ${timeSpanToFrenchHour(openingHour.to)}`}</p>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
{/if}
