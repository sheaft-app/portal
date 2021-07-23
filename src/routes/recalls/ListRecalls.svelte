<script>
	import {
		faCheck,
		faFileExport,
		faCalendarCheck,
		faPlus,
		faHistory,
		faTrash,
		faEnvelope,
	} from "@fortawesome/free-solid-svg-icons";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import Table from "./../../components/table/Table.svelte";
	import Actions from "./../../components/table/Actions.svelte";
	import GetRouterInstance from "./../../services/SheaftRouter";
	import { GET_RECALLS } from "./queries";
	import SheaftErrors from "../../services/SheaftErrors";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";
	import { getContext } from "svelte";
	import { format } from "date-fns";
	import fr from "date-fns/locale/fr";
	import RecallRoutes from "./routes";
	import DeleteRecallsModal from "./DeleteRecallsModal.svelte";
	import SendRecallsModal from "./SendRecallsModal.svelte";
	import RecallStatus from "./../../enums/RecallStatus";
	import GetAuthInstance from "../../services/SheaftAuth";
	import Roles from "../../enums/Roles";
	import ExternalRoutes from "../external/routes";

	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();
	const authInstance = GetAuthInstance();
	const { open } = getContext("modal");

	let isLoading = true;
	let items = [];
	let noResults = true;
	let selectedItems = [];

	const headers = [
		{ name: "Nom" },
		{ name: "Statut" },
		{ name: "Créée le", sortLabel: "createdOn" },
		{ name: "Lots" },
		{ name: "Produits" },
		{ name: "Clients" },
	];

	const onRowClick = (item) => {
		if (item.status === RecallStatus.Waiting.Value || !authInstance.isInRole(Roles.Producer.Value))
			routerInstance.goTo(RecallRoutes.Edit, { id: item.id });
		else routerInstance.goTo(ExternalRoutes.RecallDetails, { id: item.id });
	};

	const deleteRecalls = () => {
		open(DeleteRecallsModal, {
			selectedItems: selectedItems,
			onClose: (res) => {
				if (res.success) routerInstance.reload();
			},
		});
	};

	const sendRecalls = () => {
		open(SendRecallsModal, {
			selectedItems: selectedItems,
			onClose: (res) => {
				if (res.success) routerInstance.reload();
			},
		});
	};

	const canDeleteRecalls = (items) => {
		return items && items.length > 0;
	};

	const canSendRecalls = (items) => {
		return items && items.filter((s) => s.status !== RecallStatus.Waiting.Value).length === 0 && items.length > 0;
	};

	$: actions = [
		{
			click: () => routerInstance.goTo(RecallRoutes.Create),
			disabled: !items || items.length < 1,
			text: "Créer une campagne de rappel",
			icon: faPlus,
			color: "green",
			hideIfDisabled: true,
		},
		{
			click: () => deleteRecalls(),
			disabled: !canDeleteRecalls(selectedItems),
			text: "Supprimer",
			icon: faTrash,
			color: "red",
			hideIfDisabled: true,
			displaySelectedItemsNumber: true,
		},
		{
			click: () => sendRecalls(),
			disabled: !canSendRecalls(selectedItems),
			text: "Envoyer",
			icon: faEnvelope,
			color: "blue",
			hideIfDisabled: true,
			displaySelectedItemsNumber: true,
		},
	];
</script>

<TransitionWrapper>
	<PageHeader name="Campagnes de rappels" />
	<PageBody {errorsHandler}>
		<Actions {actions} selectedItemsNumber={selectedItems.length} />
		<Table
			bind:items
			bind:isLoading
			bind:noResults
			{errorsHandler}
			{headers}
			let:rowItem={recall}
			graphQuery={GET_RECALLS}
			noResultsPage={RecallRoutes.NoResults}
			loadingMessage="Chargement de vos campagnes de rappel en cours."
			defaultSearchValues={RecallRoutes.List.Params.Query}
			disableRowSelection={(recall) => recall.status !== RecallStatus.Waiting.Value}
			bind:selectedItems
			{onRowClick}
		>
			<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
				<div class="text-sm leading-5 font-medium truncate" style="max-width: 180px;">
					{recall.name}
				</div>
			</td>
			<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
				<div class="text-sm leading-5 font-medium truncate" style="max-width: 180px;">
					{RecallStatus.label(recall.status)}
				</div>
			</td>
			<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
				<div class="text-sm leading-5 font-medium truncate" style="max-width: 180px;">
					{format(new Date(recall.createdOn), "P", { locale: fr })}
				</div>
			</td>
			<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
				<div class="text-sm leading-5 font-medium truncate" style="max-width: 180px;">
					{recall.batchesCount}
				</div>
			</td>
			<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
				<div class="text-sm leading-5 font-medium truncate" style="max-width: 180px;">
					{recall.productsCount}
				</div>
			</td>
			<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
				<div class="text-sm leading-5 font-medium truncate" style="max-width: 180px;">
					{recall.clientsCount}
				</div>
			</td>
		</Table>
	</PageBody>
</TransitionWrapper>
