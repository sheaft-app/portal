<script>
	import {
		faCheck,
		faFileExport,
		faCalendarCheck,
		faPlus,
		faHistory,
		faTrash,
	} from "@fortawesome/free-solid-svg-icons";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import Table from "./../../components/table/Table.svelte";
	import Actions from "./../../components/table/Actions.svelte";
	import GetRouterInstance from "./../../services/SheaftRouter";
	import { GET_QUICKORDERS } from "./queries";
	import SheaftErrors from "../../services/SheaftErrors";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";
	import { getContext } from "svelte";
	import { format } from "date-fns";
	import fr from "date-fns/locale/fr";
	import QuickOrderRoutes from "./routes";
	import DeleteQuickOrdersModal from "./DeleteQuickOrdersModal.svelte";

	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();
	const { open } = getContext("modal");

	let isLoading = true;
	let items = [];
	let noResults = true;
	let selectedItems = [];

	const headers = [
		{ name: "Nom" },
		{ name: "Créée le", sortLabel: "createdOn" },
		{ name: "Par défaut" },
		{ name: "Produits" },
	];

	const onRowClick = (item) => {
		routerInstance.goTo(QuickOrderRoutes.Edit, { id: item.id });
	};

	const deleteQuickOrders = () => {
		open(DeleteQuickOrdersModal, {
			selectedItems: selectedItems,
			onClose: (res) => {
				if (res.success) routerInstance.refresh();
			},
		});
	};

	const canDeleteQuickOrders = (items) => {
		return items && items.length > 0;
	};

	$: actions = [
		{
			click: () => routerInstance.goTo(QuickOrderRoutes.Create),
			disabled: !items || items.length < 1,
			text: "Créer un modèle de commande",
			icon: faPlus,
			color: "green",
			hideIfDisabled: true,
		},
		{
			click: () => deleteQuickOrders(),
			disabled: !canDeleteQuickOrders(selectedItems),
			text: "Supprimer",
			icon: faTrash,
			color: "red",
			hideIfDisabled: true,
			displaySelectedItemsNumber: true,
		},
	];
</script>

<TransitionWrapper>
	<PageHeader name="Modèles de commandes" />
	<PageBody {errorsHandler}>
		<Actions {actions} selectedItemsNumber={selectedItems.length} />
		<Table
			bind:items
			bind:isLoading
			bind:noResults
			{errorsHandler}
			{headers}
			let:rowItem={quickOrder}
			graphQuery={GET_QUICKORDERS}
			noResultsPage={QuickOrderRoutes.NoResults}
			loadingMessage="Chargement de vos commandes rapides en cours."
			defaultSearchValues={QuickOrderRoutes.List.Params.Query}
			bind:selectedItems
			{onRowClick}
		>
			<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
				<div class="text-sm leading-5 font-medium truncate" style="max-width: 180px;">
					{quickOrder.name}
				</div>
			</td>
			<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
				<div class="text-sm leading-5 font-medium truncate" style="max-width: 180px;">
					{format(new Date(quickOrder.createdOn), "P", { locale: fr })}
				</div>
			</td>
			<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
				<div class="text-sm leading-5 font-medium truncate" style="max-width: 180px;">
					{quickOrder.isDefault ? "Oui" : "Non"}
				</div>
			</td>
			<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
				<div class="text-sm leading-5 font-medium truncate" style="max-width: 180px;">
					{quickOrder.productsCount}
				</div>
			</td>
		</Table>
	</PageBody>
</TransitionWrapper>
