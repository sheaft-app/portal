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
	import MyRecallRoutes from "./routes";
	import RecallStatus from "./../../enums/RecallStatus";
	import GetAuthInstance from "../../services/SheaftAuth";
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
		{ name: "Producteur" },
		{ name: "Créée le", sortLabel: "createdOn" },
		{ name: "Produits" },
		{ name: "Lots" },
	];

	const onRowClick = (item) => {
		routerInstance.goTo(ExternalRoutes.RecallDetails, { id: item.id });
	};
</script>

<TransitionWrapper>
	<PageHeader name="Campagnes de rappels" />
	<PageBody {errorsHandler}>
		<Actions />
		<Table
			bind:items
			bind:isLoading
			bind:noResults
			{errorsHandler}
			{headers}
			let:rowItem={recall}
			graphQuery={GET_RECALLS}
			noResultsPage={MyRecallRoutes.NoResults}
			loadingMessage="Chargement de vos campagnes de rappel en cours."
			defaultSearchValues={MyRecallRoutes.List.Params.Query}
			getRowBackgroundColor={(recall) => (recall.userAffected ? "bg-red-100" : "")}
			{onRowClick}
		>
			<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
				<div class="text-sm leading-5 font-medium truncate" style="max-width: 180px;">
					{recall.name}
				</div>
			</td>
			<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
				<div class="text-sm leading-5 font-medium truncate" style="max-width: 180px;">
					{recall.producer.name}
				</div>
			</td>
			<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
				<div class="text-sm leading-5 font-medium truncate" style="max-width: 180px;">
					{format(new Date(recall.createdOn), "P", { locale: fr })}
				</div>
			</td>
			<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
				<div class="text-sm leading-5 font-medium truncate" style="max-width: 180px;">
					{recall.productsCount}
				</div>
			</td>
			<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
				<div class="text-sm leading-5 font-medium truncate" style="max-width: 180px;">
					{recall.batchesCount}
				</div>
			</td>
		</Table>
	</PageBody>
</TransitionWrapper>
