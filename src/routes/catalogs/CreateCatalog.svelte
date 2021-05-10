<script>
	import Icon from "svelte-awesome";
	import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
	import TransitionWrapper from "../../components/TransitionWrapper.svelte";
	import GetRouterInstance from "../../services/SheaftRouter";
	import GetGraphQLInstance from "../../services/SheaftGraphQL";
  	import GetNotificationsInstance from "../../services/SheaftNotifications";
	import CatalogForm from "./CatalogForm.svelte";
	import { CREATE_CATALOG } from "./mutations";
	import CatalogRoutes from "./routes";
	import SheaftErrors from "../../services/SheaftErrors";
	import ErrorCard from "../../components/ErrorCard.svelte";
	import { GET_CATALOGS } from "./queries";
	import { products } from "./stores";

	export let isInModal = false,
		onClose,
		close;

	const graphQLInstance = GetGraphQLInstance();
	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();
  	const notificationsInstance = GetNotificationsInstance();

	let isLoading = false;

	let catalog = {
		isAvailable: true,
		isDefault: false,
		name: "",
		products:[]
	};

	const handleSubmit = async () => {
		isLoading = true;

		catalog.products = $products.filter((p) => !p.markForDeletion).map((p) => ({
					id: p.id,
					wholeSalePricePerUnit: p.wholeSalePricePerUnit
				}));

		var res = await graphQLInstance.mutate(
			CREATE_CATALOG,
			catalog,
			errorsHandler.Uuid,
			GET_CATALOGS
		);

		if (!res.success) {
			//TODO
			isLoading = false;
			return;
		}

		notificationsInstance.success("Votre catalogue a bien été créée.");
		if (isInModal) await handleClose(res);
		else routerInstance.goTo(CatalogRoutes.List);
	};

	const handleClose = async (res) => {
		close();

		if (onClose) await onClose(res);
	};
</script>

<svelte:head>
	<title>Créer un nouveau catalogue</title>
</svelte:head>

<TransitionWrapper>
	<ErrorCard {errorsHandler} />
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
    <h1 class="font-semibold uppercase mb-0">Créer un nouveau catalogue</h1>
	</section>
	<CatalogForm
		submit={handleSubmit}
		{catalog}
		{errorsHandler}
		{isLoading}
		close={handleClose} />
</TransitionWrapper>
