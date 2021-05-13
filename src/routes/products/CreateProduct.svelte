<script>
  import { getContext, onMount } from "svelte";
  import Icon from "svelte-awesome";
  import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
  import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
  import GetRouterInstance from "./../../services/SheaftRouter.js";
  import ProductForm from "./ProductForm.svelte";
  import { CREATE_PRODUCT } from "./mutations.js";
  import { GET_PRODUCTS, GET_PRODUCER_DETAILS } from "./queries.js";
  import ProductRoutes from "./routes.js";
  import SheaftErrors from "../../services/SheaftErrors";
  import ErrorCard from "./../../components/ErrorCard.svelte";
  import form from "../../stores/form";
  import { initialValues, normalizeProduct } from "./productForm";

  const errorsHandler = new SheaftErrors();
  const routerInstance = GetRouterInstance();
  const { query, mutate } = getContext("api");
  
  onMount(async () => {
    await query({
			query: GET_PRODUCER_DETAILS,
      errorsHandler,
      success: (res) => initialValues.producer.notSubjectToVat = res.notSubjectToVat,
			error: () => routerInstance.goTo(ProductRoutes.List),
			errorNotification: "Un problème est survenu pendant la récupération des informations du produit."
    });
  });

  const handleSubmit = async () => {
    return mutate({
			mutation: CREATE_PRODUCT,
			variables: normalizeProduct(form.values()),
			errorsHandler,
			success: () => routerInstance.goTo(ProductRoutes.List),
			successNotification: "Votre produit a bien été créé",
			errorNotification: "Impossible de créer votre produit",
			clearCache: [GET_PRODUCTS]
    });
  }
</script>

<svelte:head>
  <title>Créer un produit</title>
</svelte:head>

<TransitionWrapper>
  <ErrorCard {errorsHandler} />
  <section
    class="mb-4 pb-4 border-b border-gray-400 border-solid lg:pt-2">
    <div class="mb-3">
      <button
        class="text-gray-600 items-center flex uppercase"
        on:click={routerInstance.goBack}>
        <Icon data={faChevronLeft} class="mr-2 inline" />
        Produits
      </button>
    </div>
    <h1 class="font-semibold uppercase mb-0">Créer un nouveau produit</h1>
  </section>
  <ProductForm submit={handleSubmit} {errorsHandler} />
</TransitionWrapper>
