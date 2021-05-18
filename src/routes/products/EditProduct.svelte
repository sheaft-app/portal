<script>
	import {onMount, getContext} from "svelte";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import GetRouterInstance from "./../../services/SheaftRouter.js";
	import ProductForm from "./ProductForm.svelte";
	import {GET_PRODUCT_DETAILS, GET_PRODUCTS} from "./queries.js";
	import {UPDATE_PRODUCT} from "./mutations.js";
	import ProductRoutes from "./routes.js";
	import ExternalRoutes from "./../external/routes.js";
	import SheaftErrors from "../../services/SheaftErrors";
	import DeleteProducts from "./DeleteProducts.svelte";
	import {normalizeUpdateProduct} from "./productForm";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";

	export let params = {};

	const {open} = getContext("modal");
	const {query, mutate} = getContext("api");
	const routerInstance = GetRouterInstance();
	const errorsHandler = new SheaftErrors();

	let product = null;
	let isLoading = true;

	onMount(async () => {
		isLoading = true;
		product = await query({
			query: GET_PRODUCT_DETAILS,
			variables: {id: params.id},
			errorsHandler,
			error: () => routerInstance.goTo(ProductRoutes.List),
			errorNotification: "Le produit auquel vous essayez d'accéder n'existe plus."
		});
		isLoading = false;
	});

	const handleSubmit = async () => {
		return await mutate({
			mutation: UPDATE_PRODUCT,
			variables: normalizeUpdateProduct(product),
			errorsHandler,
			success: () => routerInstance.goTo(ProductRoutes.List),
			successNotification: "Le produit a bien été modifié",
			errorNotification: "Impossible de mettre à jour les informations de ce produit",
			clearCache: [GET_PRODUCTS]
		});
	};

	const showDeleteModal = () => {
		open(DeleteProducts, {
			selectedItems: [product],
			onClose: () => {
				routerInstance.goTo(ProductRoutes.List);
			},
		});
	};

	$: buttons = [{
		text: 'Voir dans votre boutique',
		color: 'blue',
		click: () => routerInstance.goTo(ExternalRoutes.ProductDetails, {
			id: params.id
		})
	},
		{
			text: 'Supprimer',
			color: 'red',
			click: () => showDeleteModal()
		}];
</script>

<TransitionWrapper>
	<PageHeader name="Modifier le produit" previousPage={ProductRoutes.List} {buttons}/>
	<PageBody {errorsHandler} {isLoading} loadingMessage="Chargement des informations de votre produit en cours... veuillez patienter.">
		<ProductForm
			submit={handleSubmit}
			bind:product
			{errorsHandler} />
	</PageBody>
</TransitionWrapper>
