<script>
	import {getContext, onMount} from "svelte";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import GetRouterInstance from "./../../services/SheaftRouter.js";
	import ProductForm from "./ProductForm.svelte";
	import {CREATE_PRODUCT} from "./mutations.js";
	import {GET_PRODUCTS, GET_PRODUCER_DETAILS} from "./queries.js";
	import ProductRoutes from "./routes.js";
	import SheaftErrors from "../../services/SheaftErrors";
	import form from "../../stores/form";
	import {initialValues, normalizeCreateProduct} from "./productForm";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";

	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();
	const {query, mutate} = getContext("api");

	let isLoading = true;

	onMount(async () => {
		isLoading = true;
		await query({
			query: GET_PRODUCER_DETAILS,
			errorsHandler,
			success: (res) => initialValues.producer.notSubjectToVat = res.notSubjectToVat,
			error: () => routerInstance.goTo(ProductRoutes.List),
			errorNotification: "Un problème est survenu pendant la récupération des informations du produit."
		});
		isLoading = false;
	});

	const handleSubmit = async () => {
		return await mutate({
			mutation: CREATE_PRODUCT,
			variables: normalizeCreateProduct(form.values()),
			errorsHandler,
			success: () => routerInstance.goTo(ProductRoutes.List),
			successNotification: "Votre produit a bien été créé",
			errorNotification: "Impossible de créer votre produit",
			clearCache: [GET_PRODUCTS]
		});
	}
</script>

<TransitionWrapper>
	<PageHeader name="Créer un produit" previousPage={ProductRoutes.List}/>
	<PageBody {errorsHandler} {isLoading} loadingMessage="Initialisation en cours... veuillez patienter.">
		<ProductForm
			submit={handleSubmit}
			{errorsHandler} />
	</PageBody>
</TransitionWrapper>
