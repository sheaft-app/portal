<script>
	import { onMount, getContext } from "svelte";
	import TransitionWrapper from "../../components/TransitionWrapper.svelte";
	import Loader from "../../components/Loader.svelte";
	import Icon from "svelte-awesome";
	import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
	import { UPDATE_CATALOG } from "./mutations";
	import { GET_CATALOGS, GET_CATALOG_DETAILS } from "./queries";
	import CatalogForm from "./CatalogForm.svelte";
	import DeleteCatalog from "./DeleteCatalog.svelte";
	import GetRouterInstance from "../../services/SheaftRouter";
	import GetGraphQLInstance from "../../services/SheaftGraphQL";
	import CatalogRoutes from "./routes";
	import SheaftErrors from "../../services/SheaftErrors";
	import ErrorCard from "../../components/ErrorCard.svelte";
	import GetNotificationsInstance from "./../../services/SheaftNotifications.js";
	import { products } from "./stores";
import CatalogKind from "../../enums/CatalogKind";

	export let params;

	const errorsHandler = new SheaftErrors();
	const { open } = getContext("modal");
	const graphQLInstance = GetGraphQLInstance();
	const routerInstance = GetRouterInstance();
    const notificationsInstance = new GetNotificationsInstance();

	let isLoading = false;
	let catalog = null;

	onMount(async () => {
		await getCatalog(params.id);
	});

	const getCatalog = async (id) => {
		isLoading = true;
		let res = await graphQLInstance.query(
			GET_CATALOG_DETAILS,
			{
				id: id,
			},
			errorsHandler.Uuid
		);

		isLoading = false;

		if (!res.success) {
			//TODO
			routerInstance.goTo(CatalogRoutes.List);
			return;
		}

		catalog = res.data;
	};

	const handleSubmit = async () => {
		isLoading = true;
		let res = await graphQLInstance.mutate(
			UPDATE_CATALOG,
			{
				id: catalog.id,
				name: catalog.name,
				available: catalog.available,
				isDefault: catalog.isDefault,
				products: $products.filter((p) => !p.markForDeletion).map((p) => ({
					id: p.id,
					wholeSalePricePerUnit: p.wholeSalePricePerUnit
				}))
			},
			errorsHandler.Uuid
		);

		if (!res.success) {
			//TODO
			isLoading = false;
			return;
		}
		
		products.set($products.filter((p) => !p.markForDeletion));
		isLoading = false;

		notificationsInstance.success("Vos modifications ont bien été appliquées.");
		routerInstance.goTo(CatalogRoutes.List);
	};

	const showDeleteModal = () => {
		open(DeleteCatalog, {
			catalog,
			onClose: async (res) => {
				if (res.success) {
      				graphQLInstance.clearApolloCache(GET_CATALOGS);
					routerInstance.goTo(CatalogRoutes.List);
				}
			},
		});
	};
</script>

<svelte:head>
	<title>Modifier un catalogue</title>
</svelte:head>

<TransitionWrapper>
	<ErrorCard {errorsHandler} />
	{#if !catalog}
		<Loader />
	{:else}
		<section
			class="mb-4 pb-4 border-b border-gray-400 border-solid lg:pt-2">
			<div class="mb-3">
				<button
					class="text-gray-600 items-center flex uppercase"
					on:click={() => routerInstance.goTo(CatalogRoutes.List)}>
					<Icon data={faChevronLeft} class="mr-2 inline" />
					Catalogues
				</button>
			</div>
		<h1 class="font-semibold uppercase mb-2">Modifier un catalogue</h1>
		{#if catalog.kind == CatalogKind.Stores.Value}
			<button
				class="btn btn-lg bg-white text-red-500 border border-red-500 hover:bg-red-500 hover:text-white"
				on:click={showDeleteModal}>
				Supprimer
			</button>
		{/if}
		</section>
		<CatalogForm
			submit={handleSubmit}
			{catalog}
			{isLoading}
			{errorsHandler} />
	{/if}
</TransitionWrapper>
