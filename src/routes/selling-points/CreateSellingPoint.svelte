<script>
  import { getContext } from "svelte";
  import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
  import { CREATE_SELLING_POINT } from "./mutations";
  import Icon from "svelte-awesome";
  import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
  import GetRouterInstance from "./../../services/SheaftRouter.js";
  import SellingPointForm from "./SellingPointForm.svelte";
  import SellingPointRoutes from "./routes";
  import SheaftErrors from "../../services/SheaftErrors";
  import ErrorCard from "./../../components/ErrorCard.svelte";
  import { GET_SELLING_POINTS } from "./queries";
  import form from "../../stores/form";
  import { normalizeCreateSellingPoint } from "./sellingPointForm";

  const errorsHandler = new SheaftErrors();
  const routerInstance = GetRouterInstance();
  const { mutate } = getContext('api');

  const handleSubmit = async () => {
    return mutate({
			mutation: CREATE_SELLING_POINT,
			variables: normalizeCreateSellingPoint(form.values()),
			errorsHandler,
			success: () => routerInstance.goTo(SellingPointRoutes.List),
			successNotification: "Votre point de vente a bien été créé",
			errorNotification: "Impossible de créer le point de vente",
			clearCache: [GET_SELLING_POINTS]
    });
  };
</script>

<svelte:head>
  <title>Ajouter un point de vente directe</title>
</svelte:head>

<TransitionWrapper>
  <ErrorCard {errorsHandler} />
  <section
    class="mb-4 pb-4 border-b border-gray-400 border-solid lg:pt-2">
    <div class="mb-3">
        <button class="text-gray-600 items-center flex uppercase" on:click={() => routerInstance.goBack()}>
        <Icon data={faChevronLeft} class="mr-2 inline" />
        Points de vente
        </button>
    </div>
        <h1 class="font-semibold uppercase mb-0">Créer un nouveau point de vente</h1>
  </section>
  <SellingPointForm submit={handleSubmit} />
</TransitionWrapper>
