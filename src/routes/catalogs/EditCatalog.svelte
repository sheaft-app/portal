<script>
	import {onMount, getContext} from "svelte";
	import TransitionWrapper from "../../components/TransitionWrapper.svelte";
	import {UPDATE_CATALOG} from "./mutations";
	import {GET_CATALOGS, GET_CATALOG_DETAILS} from "./queries";
	import CatalogForm from "./CatalogForm.svelte";
	import DeleteCatalog from "./DeleteCatalog.svelte";
	import GetRouterInstance from "../../services/SheaftRouter";
	import GetGraphQLInstance from "../../services/SheaftGraphQL";
	import CatalogRoutes from "./routes";
	import SheaftErrors from "../../services/SheaftErrors";
	import GetNotificationsInstance from "./../../services/SheaftNotifications.js";
	import {products} from "./stores";
	import CloneCatalog from "./CloneCatalog.svelte";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";

	export let params;

	const errorsHandler = new SheaftErrors();
	const {open} = getContext("modal");
	const graphQLInstance = GetGraphQLInstance();
	const routerInstance = GetRouterInstance();
	const notificationsInstance = new GetNotificationsInstance();

	let isLoading = true;
	let catalog = null;
	let loadingMessage = 'Chargement du catalogue en cours... veuillez patienter';

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

		if (!res.success) {
			//TODO
			routerInstance.goTo(CatalogRoutes.List);
			return;
		}

		catalog = res.data;
		isLoading = false;
	};

	const handleSubmit = async () => {
		loadingMessage = 'Enregistrement du catalogue en cours... veuillez patienter';
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
					await routerInstance.goTo(CatalogRoutes.List);
				}
			},
		});
	};

	const showCloneModal = () => {
		open(CloneCatalog, {
			catalog,
			onClose: async (res) => {
				if (res.success) {
					graphQLInstance.clearApolloCache(GET_CATALOGS);
					await routerInstance.goTo(CatalogRoutes.Details, {id: res.data.id});
					routerInstance.reload();
				}
			},
		});
	};

	const buttons = [
		{
			text: 'Dupliquer',
			click: () => showCloneModal(),
			color: 'blue'
		},
		{
			text: 'Supprimer',
			click: () => showDeleteModal(),
			color: 'red'
		}
	]
</script>

<TransitionWrapper>
	<PageHeader name="Modifier un catalogue" previousPage={CatalogRoutes.List}/>
	<PageBody {errorsHandler} {isLoading} {loadingMessage}>
		<CatalogForm
			submit={handleSubmit}
			{catalog}
			{isLoading}/>
	</PageBody>
</TransitionWrapper>
