<script>
	import {onMount, getContext} from "svelte";
	import Icon from "svelte-awesome";
	import {faChevronLeft} from "@fortawesome/free-solid-svg-icons";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
	import GetRouterInstance from "./../../services/SheaftRouter.js";
	import ProductForm from "./ProductForm.svelte";
	import {CREATE_PRODUCT} from "./mutations.js";
	import {GET_PRODUCTS} from "./queries.js";
	import ProductRoutes from "./routes.js";
	import SheaftErrors from "../../services/SheaftErrors";
	import ErrorCard from "./../../components/ErrorCard.svelte";
	import ConditioningKind from "../../enums/ConditioningKind";
	import GetNotificationsInstance from "./../../services/SheaftNotifications.js";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";

	const errorsHandler = new SheaftErrors();
	const {open} = getContext("modal");
	const graphQLInstance = GetGraphQLInstance();
	const routerInstance = GetRouterInstance();
	const notificationsInstance = new GetNotificationsInstance();

	let isLoading = false;

	let product = {
		reference: null,
		unit: null,
		quantityPerUnit: null,
		vat: null,
		name: null,
		conditioning: ConditioningKind.Bulk.Value,
		returnableId: null,
		description: null,
		picture: null,
		tags: [],
    available: true,
    visibleToStores: true,
    visibleToConsumers: true,
    catalogs:[]
  };

  const handleSubmit = async () => {
    isLoading = true;
    var res = await graphQLInstance.mutate(CREATE_PRODUCT, {
      description: product.description,
      name: product.name,
			catalogs: product.catalogs.map((c) => ({
				id: c.id,
				wholeSalePricePerUnit: c.wholeSalePricePerUnit
			})),
			returnableId: product.returnable ? product.returnable.id : null,
			quantityPerUnit: product.quantityPerUnit,
			unit: product.unit,
			conditioning: product.conditioning,
			reference: product.reference,
			picture: product.picture ? product.picture : null,
			originalPicture: product.originalPicture ? product.originalPicture : null,
			tags: product.tags.map(i => i.id),
			vat: product.vat,
			available: product.available,
		}, errorsHandler.Uuid, GET_PRODUCTS);

		if (!res.success) {
			//TODO
			isLoading = false;
			return;
		}

		notificationsInstance.success("Le produit a bien été ajouté à votre catalogue");

		isLoading = false;
		routerInstance.goTo(ProductRoutes.List);
	};
</script>

<TransitionWrapper>
	<PageHeader name="Créer un produit" previousPage={ProductRoutes.List}/>
	<PageBody {errorsHandler} {isLoading} loadingMessage="Création de votre produit en cours... veuillez patienter.">
		<ProductForm
			submit={handleSubmit}
			{product}
			{isLoading}/>
	</PageBody>
</TransitionWrapper>
