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
  import { normalizeSellingPoint } from "./sellingPointForm";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";

  const errorsHandler = new SheaftErrors();
  const routerInstance = GetRouterInstance();
  const { mutate } = getContext('api');

  let isLoading = false;

  const handleSubmit = async () => {
		isLoading = true;
    return await mutate({
			mutation: CREATE_SELLING_POINT,
			variables: normalizeSellingPoint(form.values()),
			errorsHandler,
			success: () => routerInstance.goTo(SellingPointRoutes.List),
			successNotification: "Votre point de vente a bien été créé",
			errorNotification: "Impossible de créer le point de vente",
			clearCache: [GET_SELLING_POINTS]
    });
  };
</script>

<TransitionWrapper>
	<PageHeader name="Créer un point de vente" previousPage={SellingPointRoutes.List}/>
	<PageBody {errorsHandler} {isLoading}
						loadingMessage="Création de votre point de vente en cours... veuillez patienter.">
		<SellingPointForm
			submit={handleSubmit}
			{isLoading}/>
	</PageBody>
</TransitionWrapper>
