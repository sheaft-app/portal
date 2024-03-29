<script>
	import { onMount, getContext } from "svelte";
	import TransitionWrapper from "../../components/TransitionWrapper.svelte";
	import { UPDATE_CATALOG } from "./mutations";
	import { GET_CATALOGS, GET_CATALOG_DETAILS } from "./queries";
	import CatalogForm from "./CatalogForm.svelte";
	import DeleteCatalog from "./DeleteCatalog.svelte";
	import GetRouterInstance from "../../services/SheaftRouter";
	import CatalogRoutes from "./routes";
	import SheaftErrors from "../../services/SheaftErrors";
	import { products } from "./stores";
	import CloneCatalog from "./CloneCatalog.svelte";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";
	import { normalizeCatalog } from "./catalogForm";
	import CatalogKind from "../../enums/CatalogKind";
	import { querystring } from "svelte-spa-router";

	export let params;

	const errorsHandler = new SheaftErrors();
	const { open } = getContext("modal");
	const routerInstance = GetRouterInstance();
	const { query, mutate } = getContext("api");

	let catalog = null;
	let isLoading = false;
	let loadingMessage = "Chargement du catalogue en cours... veuillez patienter";

	onMount(async () => {
		await getCatalog();
	});

	const getCatalog = async () => {
		isLoading = true;
		catalog = await query({
			query: GET_CATALOG_DETAILS,
			variables: { id: params.id },
			errorsHandler,
			error: () => routerInstance.goTo(CatalogRoutes.List),
			errorNotification: "Le catalogue auquel vous essayez d'accéder n'existe plus.",
			skipCache: routerInstance.shouldSkipCache(),
		});
		isLoading = false;
	};

	const handleSubmit = async () => {
		loadingMessage = "Enregistrement du catalogue en cours... veuillez patienter";
		return await mutate({
			mutation: UPDATE_CATALOG,
			variables: normalizeCatalog(catalog),
			errorsHandler,
			success: async () => {
				products.set($products.filter((p) => !p.markForDeletion));
				routerInstance.goTo(CatalogRoutes.List);
			},
			successNotification: "Votre catalogue a bien été modifié",
			errorNotification: "Impossible de modifier votre catalogue",
			clearCache: [GET_CATALOGS],
		});
	};

	const showDeleteModal = () =>
		open(DeleteCatalog, {
			catalog,
			onClose: async (res) => {
				if (res.success) await routerInstance.goTo(CatalogRoutes.List);
			},
		});

	const showCloneModal = () =>
		open(CloneCatalog, {
			catalog,
			onClose: async (res) => {
				if (res.success) await routerInstance.goTo(CatalogRoutes.Details, { id: res.data.id });
			},
		});

	$: if (params.id || $querystring) {
		getCatalog();
	}

	$: isConsumerCatalog = catalog && catalog.kind === CatalogKind.Consumers.Value;

	$: buttons = [
		{
			text: "Dupliquer",
			click: () => showCloneModal(),
			color: "blue",
			hidden: isConsumerCatalog,
		},
		{
			text: "Supprimer",
			click: () => showDeleteModal(),
			color: "red",
			hidden: isConsumerCatalog,
		},
	];
</script>

<TransitionWrapper>
	<PageHeader name="Modifier un catalogue" previousPage={CatalogRoutes.List} {buttons} />
	<PageBody {errorsHandler} {isLoading} {loadingMessage}>
		<CatalogForm submit={handleSubmit} bind:catalog {errorsHandler} />
	</PageBody>
</TransitionWrapper>
