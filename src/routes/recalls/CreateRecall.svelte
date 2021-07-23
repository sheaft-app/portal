<script>
	import { onMount, getContext } from "svelte";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import GetRouterInstance from "./../../services/SheaftRouter";
	import SheaftErrors from "../../services/SheaftErrors";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";
	import { CREATE_RECALL } from "./mutations";
	import { GET_RECALLS } from "./queries";
	import form from "../../stores/form";
	import RecallRoutes from "./routes";
	import { normalizeCreateRecall } from "./recallForm";
	import RecallForm from "./RecallForm.svelte";

	export let params = {};

	const errorsHandler = new SheaftErrors();
	const { open } = getContext("modal");
	const { query, mutate } = getContext("api");
	const routerInstance = GetRouterInstance();

	let isLoading = true;
	let recall = undefined;

	onMount(async () => {
		isLoading = false;
	});

	const handleSubmit = async () => {
		return await mutate({
			mutation: CREATE_RECALL,
			variables: normalizeCreateRecall(form.values()),
			errorsHandler,
			success: () => routerInstance.goTo(RecallRoutes.List),
			successNotification: "Votre campagne de rappel a bien été créée",
			errorNotification: "Impossible de créer votre campagne de rappel",
			clearCache: [GET_RECALLS],
		});
	};
</script>

<TransitionWrapper>
	<PageHeader name="Nouvelle campagne de rappel" previousPage={RecallRoutes.List} />
	<PageBody {errorsHandler} {isLoading} loadingMessage="Chargement des informations en cours.">
		<RecallForm submit={handleSubmit} bind:recall />
	</PageBody>
</TransitionWrapper>
