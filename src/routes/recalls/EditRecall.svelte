<script>
	import { onMount, getContext } from "svelte";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import GetRouterInstance from "./../../services/SheaftRouter";
	import GetAuthInstance from "./../../services/SheaftAuth";
	import SheaftErrors from "../../services/SheaftErrors";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";
	import { GET_RECALLS, GET_RECALL } from "./queries";
	import { UPDATE_RECALL } from "./mutations";
	import form from "../../stores/form";
	import RecallRoutes from "./routes";
	import { normalizeUpdateRecall } from "./recallForm";
	import RecallForm from "./RecallForm.svelte";
	import { faEnvelope, faFileExport, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
	import DeleteRecallsModal from "./DeleteRecallsModal.svelte";
	import SendRecallsModal from "./SendRecallsModal.svelte";
	import RecallStatus from "../../enums/RecallStatus";
	import Roles from "../../enums/Roles";
	import ExternalRoutes from "../external/routes";

	export let params = {};

	const errorsHandler = new SheaftErrors();
	const { open } = getContext("modal");
	const { query, mutate } = getContext("api");
	const routerInstance = GetRouterInstance();

	let isLoading = true;
	let recall = undefined;

	onMount(async () => {
		isLoading = true;
		recall = await query({
			query: GET_RECALL,
			variables: { id: params.id },
			errorsHandler,
			error: () => routerInstance.goTo(RecallRoutes.List),
			errorNotification: "La campagne de rappel à laquelle vous essayez d'accéder n'existe plus.",
		});

		if (recall.status !== RecallStatus.Waiting.Value || !GetAuthInstance().isInRole(Roles.Producer.Value))
			return await routerInstance.goTo(ExternalRoutes.RecallDetails, { id: params.id });

		recall.saleStartedOn = new Date(recall.saleStartedOn);
		recall.saleEndedOn = new Date(recall.saleEndedOn);

		isLoading = false;
	});

	const deleteRecall = () => {
		open(DeleteRecallsModal, {
			selectedItems: [recall],
			onClose: (res) => {
				if (res.success) routerInstance.goTo(RecallRoutes.List);
			},
		});
	};

	const sendRecall = () => {
		open(SendRecallsModal, {
			selectedItems: [recall],
			onClose: (res) => {
				if (res.success) routerInstance.goTo(RecallRoutes.List);
			},
		});
	};

	const handleSubmit = async () => {
		return await mutate({
			mutation: UPDATE_RECALL,
			variables: normalizeUpdateRecall(form.values()),
			errorsHandler,
			success: () => routerInstance.goTo(RecallRoutes.List),
			successNotification: "Votre campagne de rappel a bien été mise à jour",
			errorNotification: "Impossible de mettre à jour votre campagne de rappel",
			clearCache: [GET_RECALLS],
		});
	};

	$: actions =
		recall && recall.status === RecallStatus.Waiting.Value
			? [
					{
						click: () => deleteRecall(),
						text: "Supprimer",
						icon: faTrash,
						color: "red",
					},
					{
						click: () => sendRecall(),
						text: "Envoyer",
						icon: faEnvelope,
						color: "green",
					},
			  ]
			: [];
</script>

<TransitionWrapper>
	<PageHeader name="Editer une campagne de rappel" previousPage={RecallRoutes.List} buttons={actions} />
	<PageBody {errorsHandler} {isLoading} loadingMessage="Chargement des informations en cours.">
		<RecallForm submit={handleSubmit} bind:recall />
	</PageBody>
</TransitionWrapper>
