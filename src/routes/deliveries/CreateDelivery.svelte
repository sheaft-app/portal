<script>
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import GetRouterInstance from "./../../services/SheaftRouter.js";
	import { CREATE_DELIVERY } from "./mutations";
	import { GET_DELIVERIES } from "./queries";
	import DeliveryForm from "./DeliveryForm.svelte";
	import DeliveryRoutes from "./routes";
	import SheaftErrors from "../../services/SheaftErrors";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";
	import form from "../../stores/form";
	import { getContext } from "svelte";
	import { normalizeDelivery } from "./deliveryForm";

	const errorsHandler = new SheaftErrors();
	const { mutate, isLoading } = getContext("api");
	const routerInstance = GetRouterInstance();

	const handleSubmit = async () =>
		await mutate({
			mutation: CREATE_DELIVERY,
			variables: normalizeDelivery(form.values()),
			errorsHandler,
			success: () => routerInstance.goTo(DeliveryRoutes.List),
			successNotification: "Votre créneau de livraison a bien été ajouté",
			errorNotification: "Impossible de créer ce créneau de livraison",
			clearCache: [GET_DELIVERIES],
		});

</script>

<TransitionWrapper>
	<PageHeader name="Créer un créneau de livraison" previousPage={DeliveryRoutes.List} />
	<PageBody
		{errorsHandler}
		isLoading={$isLoading}
		loadingMessage="Création de votre créneau de livraison en cours."
	>
		<DeliveryForm submit={handleSubmit} />
	</PageBody>
</TransitionWrapper>
