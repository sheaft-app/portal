<script>
	import DeleteProducts from "./DeleteProducts.svelte";
	import ImportProducts from "./ImportProducts.svelte";
	import SetProductsAvailability from "./SetProductsAvailability.svelte";
	import SetProductsSearchability from "./SetProductsSearchability.svelte";
	import RatingStars from "./../../components/rating/RatingStars.svelte";
	import { onMount, getContext } from "svelte";
	import { format } from "date-fns";
	import fr from "date-fns/locale/fr";
	import Icon from "svelte-awesome";
	import {
		faCalendarAlt,
		faClock,
		faCircleNotch,
		faPlay,
		faTrash,
		faTimesCircle,
		faPlus,
		faFileImport,
faInfo,
	} from "@fortawesome/free-solid-svg-icons";
	import Table from "../../components/table/Table.svelte";
	import Actions from "./../../components/table/Actions.svelte";
	import Modal from "./../../components/modal/Modal.svelte";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
	import GetRouterInstance from "./../../services/SheaftRouter.js";
	import { GET_PRODUCTS, HAS_PRODUCTS_IMPORT_INPROGRESS } from "./queries.js";
	import { SET_PRODUCTS_AVAILABILITY } from "./mutations.js";
	import ProductRoutes from "./routes.js";
	import JobRoutes from "./../jobs/routes.js";
	import SheaftErrors from "../../services/SheaftErrors";
	import ErrorCard from "./../../components/ErrorCard.svelte";
	import { formatMoney } from "./../../helpers/app";
	import { toggleMoreActions } from "./../../stores/app";

	const errorsHandler = new SheaftErrors();
	const { open } = getContext("modal");
	const graphQLInstance = GetGraphQLInstance();
	const routerInstance = GetRouterInstance();

	let items = [];
	let selectedItems = [];
	$: isLoading = true;

	const headers = [
		{ name: "Produit", sortLabel: "name" },
		{ name: "Visible pour", displayOn: "md" },
		{ name: "Notation", displayOn: "md" },
		{ name: "Prix", noMobilePadding: true },
		{ name: "Créé le", sortLabel: "createdOn", displayOn: "md" },
	];

	const checkHasImportInProgress = async () => {
		var res = await graphQLInstance.query(
			HAS_PRODUCTS_IMPORT_INPROGRESS,
			null,
			errorsHandler.Uuid
		);
		if (!res.success) {
			hasPendingJobs = false;
		}

		hasPendingJobs = res.data;
	};

	const showDeleteModal = () => {
		open(DeleteProducts, {
			selectedItems: selectedItems,
			onClose: async (res) => {
				if (res.success) {
					routerInstance.refresh();
					graphQLInstance.clearApolloCache(GET_PRODUCTS);
					toggleMoreActions.set(false);
					selectedItems = [];
				}
			},
		});
	};

	const showSetAvailabilityModal = (status) => {
		open(SetProductsAvailability, {
			selectedItems: selectedItems,
			status: status,
			onClose: async (res) => {
				if (res.success) {
					toggleMoreActions.set(false);
					routerInstance.refresh();
					selectedItems = [];
				}
			},
		});
	};

	const showSetSearchabilityModal = () => {
		var selectedVisibleToStores = selectedItems.filter(p => p.visibleToStores).length;
		var visibilityToStores = selectedVisibleToStores == selectedItems.length || selectedVisibleToStores > (selectedItems.length /2);

		var selectedVisibleToConsumers = selectedItems.filter(p => p.visibleToConsumers).length;
		var visibilityToConsumers = selectedVisibleToConsumers == selectedItems.length || selectedVisibleToConsumers > (selectedItems.length /2);

		open(SetProductsSearchability, {
			selectedItems: selectedItems,
			visibleToStores: visibilityToStores,
			visibleToConsumers: visibilityToConsumers,
			onClose: async (res) => {
				if (res.success) {
					toggleMoreActions.set(false);
					routerInstance.refresh();
					selectedItems = [];
				}
			},
		});
	};

	const showImportModal = () => {
		open(ImportProducts, {
			onClose: async (res) => {
				if (res.success) {
					toggleMoreActions.set(false);
					hasPendingJobs = true;
					selectedItems = [];
				}
			},
		});
	};

	const createNewProduct = () => {
		selectedItems = [];
		routerInstance.goTo(ProductRoutes.Create);
	};

	const goToJobs = () => {
		selectedItems = [];
		routerInstance.goTo(JobRoutes.List);
	};

	const onRowClick = (item) => {
		routerInstance.goTo(ProductRoutes.Details, { id: item.id });
	};

	const getProductVisibility = product =>{
		var visibleTo = [];
		if(product.visibleToStores)
			visibleTo.push("Magasins");
		if(product.visibleToConsumers)
			visibleTo.push("Consommateurs");

		if(visibleTo.length == 2)
			return ["Tous"];

		if(visibleTo.length == 0)
			return ["Personne"];

		return visibleTo;
	}

	onMount(async () => {
		await checkHasImportInProgress();
	});

	$: hasPendingJobs = false;
	$: hasSelectedOneItem = selectedItems.length > 0;
	$: hasSelectedDisabledItem =
		selectedItems.filter((i) => !i.available).length > 0;
	$: hasSelectedEnabledItem =
		selectedItems.filter((i) => i.available).length > 0;

	$: actions = [
		{
			click: () => createNewProduct(),
			text: "Ajouter",
			icon: faPlus,
			color: "green",
		},
		{
			click: () => showSetAvailabilityModal(false),
			hideIfDisabled: true,
			disabled: !hasSelectedOneItem || hasSelectedDisabledItem,
			text: "Rendre indisponible",
			icon: faTimesCircle,
			color: "orange",
			displaySelectedItemsNumber: true,
		},
		{
			click: () => showSetAvailabilityModal(true),
			hideIfDisabled: true,
			disabled: !hasSelectedOneItem || hasSelectedEnabledItem,
			text: "Rendre disponible",
			icon: faPlay,
			color: "green",
			displaySelectedItemsNumber: true,
		},
		{
			click: () => showSetSearchabilityModal(),
			hideIfDisabled: true,
			disabled: !hasSelectedOneItem,
			text: "Changer la visibilité",
			icon: faInfo,
			color: "blue",
			displaySelectedItemsNumber: true,
		},
		{
			click: () => showDeleteModal(),
			disabled: !hasSelectedOneItem,
			text: "Supprimer",
			icon: faTrash,
			color: "red",
			displaySelectedItemsNumber: true,
		},
		{
			click: () => showImportModal(),
			text: "Importer",
			icon: faFileImport,
			color: "blue",
		},
	];

	$: displayNoResults = !isLoading && items.length < 1;
</script>

<svelte:head>
	<title>Mes produits</title>
</svelte:head>

<TransitionWrapper>
	<ErrorCard {errorsHandler} />
	{#if hasPendingJobs}
		<div
			class="py-5 px-8 md:px-5 overflow-x-auto -mx-5 md:mx-0 bg-white
				text-gray-600 shadow rounded mb-5">
			<div class="flex">
				<Icon data={faCircleNotch} spin scale="1.3" class="mr-5" />
				<div>
					<p class="uppercase font-bold leading-none mb-2">
						Imports de produits
					</p>
					<p>
						Plusieurs imports de produits dans votre catalogue sont en cours.
						Nous vous informerons quand ce sera terminé.
					</p>
					<div class="mt-2">
						<a
							href="javascript:void(0)"
							on:click={() => goToJobs()}
							class="btn py-2 px-3 bg-white shadow font-semibold
								hover:bg-gray-100"
							style="width: max-content;">
							Voir les tâches en cours
						</a>
					</div>
				</div>
			</div>
		</div>
	{/if}

	{#if !displayNoResults}
		<Actions {actions} selectedItemsNumber={selectedItems.length} />
	{/if}
	<Table
		let:rowItem={product}
		bind:items
		{headers}
		bind:isLoading
		graphQuery={GET_PRODUCTS}
		{errorsHandler}
		defaultSearchValues={ProductRoutes.List.Params.Query}
		bind:selectedItems
		{onRowClick}>
		<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
			<div
				class="text-sm leading-5 font-medium truncate"
				style="max-width: 180px;" class:text-orange-500={!product.available}>
				{product.name}
			</div>
			<div class="text-sm leading-5 text-gray-600">#{product.reference}</div>
			<div class="block md:hidden">
				<RatingStars rating={product.rating} />
			</div>
		</td>
		<td
			class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200
				hidden md:table-cell">
			<div class="text-sm leading-5">
				<ul class="text-sm mt-2 font-semibold">
					{#each getProductVisibility(product) as target}
					  <li>{target}</li>
					{/each}
				</ul>
			</div>
		</td>
		<td
			class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200
				hidden md:table-cell">
			<div class="text-sm leading-5 font-medium">
				<RatingStars rating={product.rating} />
			</div>
		</td>
		<td class="md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
			<div class="text-sm leading-5 font-medium">
				{product.wholeSalePricePerUnit ? formatMoney(product.wholeSalePricePerUnit) : 'N/A'}
			</div>
			<div class="text-sm leading-5 text-gray-600">
				{product.wholeSalePricePerUnit ? `+${formatMoney(product.vatPricePerUnit)} TVA` : '' }
			</div>
		</td>
		<td
			class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200
				text-sm leading-5 hidden md:table-cell">
			<div>
				<p>
					<Icon data={faCalendarAlt} scale=".8" class="inline" />
					{format(new Date(product.createdOn), 'PP', { locale: fr })}
				</p>
				<p class="text-gray-600">
					<Icon data={faClock} scale=".8" class="inline" />
					{format(new Date(product.createdOn), 'p', { locale: fr })}
				</p>
			</div>
		</td>
	</Table>

	{#if displayNoResults}
		<div class="w-full h-full flex justify-center">
			<div class="text-center text-xl text-gray-600 m-auto px-6">
				<p class="mb-3">
					Vous n'avez pas encore de produits dans votre catalogue.
				</p>
				<div
					class="flex flex-wrap mb-5 justify-center w-full flex-col-reverse
						md:flex-row">
					<a
						class="btn btn-lg bg-white shadow md:mr-5 justify-center text-normal"
						href="javascript:void(0)"
						on:click={createNewProduct}>
						Créer un produit
					</a>
					<a
						class="btn btn-lg btn-primary mb-3 md:mb-0 justify-center"
						href="javascript:void(0)"
						on:click={showImportModal}>
						Importer plusieurs produits
					</a>
				</div>
				<img
					src="./img/start_importing.svg"
					class="m-auto hidden md:block pt-10"
					style="width: 200px; height: auto"
					alt="Commençons à importer des produits !" />
			</div>
		</div>
	{/if}
</TransitionWrapper>

<style lang="scss">
	.empty-products {
		left: 50%;

		@media (min-width: 1025px) {
			left: calc(50% + 100px);
		}
	}
</style>
