<script>
	import DeleteProducts from "./DeleteProducts.svelte";
	import ImportProducts from "./ImportProducts.svelte";
	import SetProductsAvailability from "./SetProductsAvailability.svelte";
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
	} from "@fortawesome/free-solid-svg-icons";
	import Table from "../../components/table/Table.svelte";
	import Actions from "./../../components/table/Actions.svelte";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import GetRouterInstance from "./../../services/SheaftRouter.js";
	import { GET_PRODUCTS, HAS_PRODUCTS_IMPORT_INPROGRESS } from "./queries.js";
	import ProductRoutes from "./routes.js";
	import JobRoutes from "./../jobs/routes.js";
	import SheaftErrors from "../../services/SheaftErrors";
	import { toggleMoreActions } from "./../../stores/app";
	import JobKind from "../../enums/JobKind";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";
	import VisibleToKind from "../../enums/VisibleToKind";

	const errorsHandler = new SheaftErrors();
	const { open } = getContext("modal");
	const routerInstance = GetRouterInstance();
	const { query } = getContext("api");

	let items = [];
	let selectedItems = [];
	let isLoading = true;
	let noResults = false;

	onMount(async () => {
		hasPendingJobs = await query({
			query: HAS_PRODUCTS_IMPORT_INPROGRESS,
			variables: { kinds: [JobKind.ImportProducts.Value] },
			errorsHandler,
			error: () => (hasPendingJobs = false),
			errorNotification: "Un problème est survenu pendant la récupération des informations d'import.",
		});
	});

	const headers = [
		{ name: "Produit", sortLabel: "name" },
		{ name: "Visible pour", displayOn: "md" },
		{ name: "Notation", displayOn: "md" },
		{ name: "Créé le", sortLabel: "createdOn", displayOn: "md" },
	];

	const showDeleteModal = () => {
		open(DeleteProducts, {
			selectedItems: selectedItems,
			onClose: async () => {
				routerInstance.refresh();
				toggleMoreActions.set(false);
				selectedItems = [];
			},
		});
	};

	const showSetAvailabilityModal = (status) => {
		open(SetProductsAvailability, {
			selectedItems: selectedItems,
			status: status,
			onClose: async () => {
				toggleMoreActions.set(false);
				routerInstance.refresh();
				selectedItems = [];
			},
		});
	};

	const showImportModal = () => {
		open(ImportProducts, {
			onClose: async (res) => {
				toggleMoreActions.set(false);
				hasPendingJobs = true;
				selectedItems = [];
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

	$: hasPendingJobs = false;
	$: hasSelectedOneItem = selectedItems.length > 0;
	$: hasSelectedDisabledItem = selectedItems.filter((i) => !i.available).length > 0;
	$: hasSelectedEnabledItem = selectedItems.filter((i) => i.available).length > 0;

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

</script>

<TransitionWrapper>
	<PageHeader name="Mes produits" />
	<PageBody {errorsHandler}>
		<Actions {actions} selectedItemsNumber={selectedItems.length} />
		{#if !isLoading && hasPendingJobs}
			<div
				class="py-5 px-8 md:px-5 overflow-x-auto -mx-5 md:mx-0 bg-white
				text-gray-600 shadow rounded mb-5"
			>
				<div class="flex">
					<Icon data={faCircleNotch} spin scale="1.3" class="mr-5" />
					<div>
						<p class="uppercase font-bold leading-none mb-2">Imports de produits</p>
						<p>
							Plusieurs imports de produits dans votre catalogue sont en cours. Nous vous informerons quand ce sera
							terminé.
						</p>
						<div class="mt-2">
							<a
								href="javascript:void(0)"
								on:click={() => goToJobs()}
								class="btn py-2 px-3 bg-white shadow font-semibold
								hover:bg-gray-100"
								style="width: max-content;"
							>
								Voir les tâches en cours
							</a>
						</div>
					</div>
				</div>
			</div>
		{/if}
		<Table
			let:rowItem={product}
			bind:items
			{headers}
			bind:isLoading
			graphQuery={GET_PRODUCTS}
			loadingMessage="Chargement de vos produits en cours... veuillez patienter"
			noResultsPage={ProductRoutes.NoResults}
			{errorsHandler}
			defaultSearchValues={ProductRoutes.List.Params.Query}
			bind:selectedItems
			bind:noResults
			{onRowClick}
		>
			<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
				<div
					class="text-sm leading-5 font-medium truncate"
					style="max-width: 180px;"
					class:text-orange-500={!product.available}
				>
					{product.name}
				</div>
				<div class="text-sm leading-5 text-gray-600">#{product.reference}</div>
				<div class="block md:hidden">
					<RatingStars rating={product.rating} />
				</div>
			</td>
			<td
				class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200
				hidden md:table-cell"
			>
				<div class="text-sm leading-5">
					<p class="text-sm mt-2 font-semibold">
						{VisibleToKind.label(product.visibleTo)}
					</p>
				</div>
			</td>
			<td
				class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200
				hidden md:table-cell"
			>
				<div class="text-sm leading-5 font-medium">
					<RatingStars rating={product.rating} />
				</div>
			</td>
			<td
				class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200
				text-sm leading-5 hidden md:table-cell"
			>
				<div>
					<p>
						<Icon data={faCalendarAlt} scale=".8" class="inline" />
						{format(new Date(product.createdOn), "PP", { locale: fr })}
					</p>
					<p class="text-gray-600">
						<Icon data={faClock} scale=".8" class="inline" />
						{format(new Date(product.createdOn), "p", { locale: fr })}
					</p>
				</div>
			</td>
		</Table>
	</PageBody>
</TransitionWrapper>

<style lang="scss">
	.empty-products {
		left: 50%;

		@media (min-width: 1025px) {
			left: calc(50% + 100px);
		}
	}

</style>
