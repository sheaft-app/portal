<script>
	import {onMount, getContext} from "svelte";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import RatingStars from "./../../components/rating/RatingStars.svelte";
	import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
	import GetRouterInstance from "./../../services/SheaftRouter.js";
	import ProductForm from "./ProductForm.svelte";
	import {GET_PRODUCT_DETAILS, GET_PRODUCTS} from "./queries.js";
	import {UPDATE_PRODUCT} from "./mutations.js";
	import ProductRoutes from "./routes.js";
	import ExternalRoutes from "./../external/routes.js";
	import SheaftErrors from "../../services/SheaftErrors";
	import GetNotificationsInstance from "./../../services/SheaftNotifications.js";
	import DeleteProducts from "./DeleteProducts.svelte";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";

	export let params = {};

	const {open} = getContext("modal");
	const graphQLInstance = GetGraphQLInstance();
	const routerInstance = GetRouterInstance();
	const errorsHandler = new SheaftErrors();
	const notificationsInstance = new GetNotificationsInstance();

	let product = null;
	let isLoading = true;
	let loadingMessage = "Chargement des informations de votre produit en cours... veuillez patienter.";

	onMount(async () => {
		await getProduct();
	});

	const showDeleteModal = () => {
		open(DeleteProducts, {
			selectedItems: [product],
			onClose: async (res) => {
				if (res.success) {
					graphQLInstance.clearApolloCache(GET_PRODUCTS);
					routerInstance.goTo(ProductRoutes.List);
				}
			},
		});
	};

	const getProduct = async () => {
		loadingMessage = "Chargement des informations de votre produit en cours... veuillez patienter.";
		isLoading = true;
		var res = await graphQLInstance.query(GET_PRODUCT_DETAILS, {
			id: params.id
		}, errorsHandler.Uuid);

		if (!res.success) {
			notificationsInstance.warning("Le produit est introuvable");
			isLoading = false;
			routerInstance.goTo(ProductRoutes.List);
			return;
		}

		product = res.data;
		isLoading = false;
	};

	const handleSubmit = async () => {
		loadingMessage = "Mise à jour des informations de votre produit en cours... veuillez patienter.";
		isLoading = true;
		var res = await graphQLInstance.mutate(UPDATE_PRODUCT, {
			id: product.id,
			description: product.description,
			catalogs: product.catalogs.filter((c) => !c.markForDeletion).map((c) => ({
				id: c.id,
				wholeSalePricePerUnit: c.wholeSalePricePerUnit
			})),
			name: product.name,
			returnableId: product.returnable ? product.returnable.id : null,
			quantityPerUnit: product.quantityPerUnit,
			unit: product.unit,
			conditioning: product.conditioning,
			reference: product.reference,
			picture: product.picture ? product.picture : null,
			originalPicture: product.originalPicture ? product.originalPicture : null,
			tags: product.tags.map(i => i.id),
			vat: product.vat,
			available: product.available
		}, errorsHandler.Uuid, GET_PRODUCTS);

		if (!res.success) {
			//TODO
			isLoading = false;
			return;
		}

		notificationsInstance.success(
			"Vos modifications ont bien été appliquées."
		);

		isLoading = false;
		routerInstance.goTo(ProductRoutes.List);
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
	<PageBody {errorsHandler} {isLoading} {loadingMessage}>
		<ProductForm
			submit={handleSubmit}
			{product}
			{isLoading}/>
	</PageBody>
</TransitionWrapper>
