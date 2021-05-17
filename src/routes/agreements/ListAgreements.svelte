<script>
	import Icon from "svelte-awesome";
	import GetAuthInstance from "./../../services/SheaftAuth.js";
	import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
	import GetRouterInstance from "./../../services/SheaftRouter.js";
	import SearchStoreRoutes from "./../search-stores/routes.js";
	import SearchProducerRoutes from "./../search-producers/routes.js";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import {GET_AGREEMENTS} from "./queries.js";
	import Roles from "./../../enums/Roles";
	import SheaftErrors from "../../services/SheaftErrors";
	import ErrorCard from "./../../components/ErrorCard.svelte";
	import {faThumbsDown, faThumbsUp, faTimes} from "@fortawesome/free-solid-svg-icons";
	import Actions from "../../components/table/Actions.svelte";
	import Table from "../../components/table/Table.svelte";
	import AgreementRoutes from "./routes";
	import AgreementStatusKind from "../../enums/AgreementStatusKind";
	import {faCalendarAlt, faClock} from "@fortawesome/free-solid-svg-icons";
	import {format} from "date-fns";
	import fr from "date-fns/locale/fr";
	import {getContext, onMount} from "svelte";
	import DayOfWeekKind from "../../enums/DayOfWeekKind";
	import {timeSpanToFrenchHour} from "../../helpers/app";
	import Select from "../../components/controls/select/Select.svelte";
	import AcceptAgreementModal from "./AcceptAgreementModal.svelte";
	import RefuseAgreementModal from "./RefuseAgreementModal.svelte";
	import CancelAgreementModal from "./CancelAgreementModal.svelte";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";

	const errorsHandler = new SheaftErrors();
	const {open} = getContext("modal");
	const graphQLInstance = GetGraphQLInstance();
	const routerInstance = GetRouterInstance();
	const authInstance = GetAuthInstance();

	let items = [];
	let noResults = false;
	let selectedItems = [];
	let isLoading = true;
	let selectedStatus = null;

	let isProducer = authInstance.isInRole(Roles.Producer.Value);

	$: routerInstance.replaceQueryParams({
		where: selectedStatus ? "status_in" : null,
		whereValues: selectedStatus ? selectedStatus.map((s) => s.value) : null
	});

	const openModal = (modal, selectedAgreements) => {
		open(modal, {
			agreements: selectedAgreements,
			onClose: async (res) => {
				if (res.success) {
					//TODO hack this refresh (not refreshing when acceptAgreements...)
					routerInstance.refresh();
					selectedItems = [];
				}
			},
		});
	};

	const onRowClick = (item) => {
		routerInstance.goTo(AgreementRoutes.Details, {id: item.id});
	};

	const acceptAgreements = () => {
		openModal(AcceptAgreementModal, selectedItems);
	};

	const refuseAgreements = () => {
		openModal(RefuseAgreementModal, selectedItems);
	};

	const cancelAgreements = () => {
		openModal(CancelAgreementModal, selectedItems);
	};

	$: canAcceptAgreements =
		selectedItems.length > 0 &&
		selectedItems.filter(
			(o) =>
				o.status == AgreementStatusKind.WaitingForProducerApproval.Value && isProducer ||
				o.status == AgreementStatusKind.WaitingForStoreApproval.Value && !isProducer
		).length == selectedItems.length;

	$: canRefuseAgreements =
		selectedItems.length > 0 &&
		selectedItems.filter(
			(o) =>
				o.status == AgreementStatusKind.WaitingForProducerApproval.Value && isProducer ||
				o.status == AgreementStatusKind.WaitingForStoreApproval.Value && !isProducer
		).length == selectedItems.length;

	$: canCancelAgreements =
		selectedItems.length > 0 &&
		selectedItems.filter(
			(o) => o.status == AgreementStatusKind.Accepted.Value
		).length == selectedItems.length;

	$: actions = [
		{
			click: () => acceptAgreements(),
			disabled: !canAcceptAgreements,
			text: "Accepter",
			icon: faThumbsUp,
			color: "green",
			displaySelectedItemsNumber: true
		},
		{
			click: () => refuseAgreements(),
			disabled: !canRefuseAgreements,
			text: "Refuser",
			icon: faThumbsDown,
			color: "orange",
			displaySelectedItemsNumber: true
		},
		{
			click: () => cancelAgreements(),
			disabled: !canCancelAgreements,
			text: "Annuler",
			icon: faTimes,
			color: "red",
			displaySelectedItemsNumber: true
		}
	];

	const headers = [
		{name: authInstance.isInRole(Roles.Store.Value) ? "Producteur" : "Magasin"},
		{name: "Statut", sortLabel: "status"},
		{name: "Créé le", displayOn: "md", sortLabel: "createdOn"},
		{name: "Créneaux de livraisons"}
	];

	const getFormattedSelectedHours = (selectedHours) => {
		if (!selectedHours || selectedHours.length < 1)
			return 'Aucune livraison';

		if (selectedHours.length == 1) {
			var selectedHour = selectedHours[0];
			return getFormattedSelectedHour(selectedHour);
		}

		var hours = '';
		for (let i = 0; i < selectedHours.length; i++) {
			hours += getFormattedSelectedHour(selectedHours[i]) + "<br/>";
		}
		return hours;
	}

	const getFormattedSelectedHour = (selectedHour) => {
		return `- le ${DayOfWeekKind.label(selectedHour.day)} entre ${timeSpanToFrenchHour(selectedHour.from)} et ${timeSpanToFrenchHour(selectedHour.to)}`;
	}

	const filterStatus = Object.entries(AgreementStatusKind).map(([key, value]) => {
		if (value.Value && value.Label) {
			return {
				value: value.Value,
				label: value.Label
			}
		}
	}).filter((o) => o && o.value && o.value !== "NONE");

	onMount(async () => {
		const values = routerInstance.getQueryParams();
		if (values["where"] && values["whereValues"] && filterStatus.length >= 1) {
			selectedStatus = values["whereValues"].split(',').map((v) => filterStatus.find((o) => o.value == v));
		}
	});
</script>

<TransitionWrapper>
	<PageHeader name="{authInstance.isInRole(Roles.Store.Value) ? 'Producteurs partenaires' : 'Magasins partenaires'}"/>
	<PageBody {errorsHandler}>
		<Actions {actions} selectedItemsNumber={selectedItems.length}/>
		<Table
			noResultsPage={authInstance.isInRole(Roles.Store.Value) ? SearchProducerRoutes.NoResultsPage : SearchStoreRoutes.NoResultsPage}
			graphQuery={GET_AGREEMENTS}
			{errorsHandler}
			bind:items
			bind:noResults
			bind:selectedItems
			bind:isLoading
			loadingMessage="Récupération des partenariats en cours... veuillez patienter"
			headers={headers}
			let:rowItem={agreement}
			defaultSearchValues={AgreementRoutes.List.Params.Query}
			disableRowSelection={(agreement) => agreement && (agreement.status == AgreementStatusKind.Cancelled.Value || agreement.status == AgreementStatusKind.Refused.Value)}
			{onRowClick}>
			<section slot="filters">
				<div class="themed">
					<Select
						isMulti={true}
						bind:selectedValue={selectedStatus}
						optionIdentifier="value"
						isDisabled={isLoading}
						placeholder="N'afficher que les accords avec le statut..."
						items={filterStatus}
					/>
				</div>
			</section>
			<td class="px-2 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
				<div
					class="text-sm leading-5 text-gray-800">{authInstance.isInRole(Roles.Store.Value) ? agreement.producer.name : agreement.store.name}</div>
			</td>
			<td class="px-6 py-4 whitespace-no-wrap hidden md:table-cell">
			<span
				class="px-3 inline-flex text-xs leading-5 font-semibold rounded-full bg-{AgreementStatusKind.color(agreement.status)}
				text-white">
				{AgreementStatusKind.label(agreement.status)}
			</span>
			</td>
			<td
				class="px-6 py-4 whitespace-no-wrap text-sm leading-5">
				<div>
					<p>
						<Icon data={faCalendarAlt} scale=".8" class=" inline"/>
						{format(new Date(agreement.createdOn), 'PP', {locale: fr})}
					</p>
					<p class="text-gray-600">
						<Icon data={faClock} scale=".8" class=" inline"/>
						{format(new Date(agreement.createdOn), 'p', {locale: fr})}
					</p>
				</div>
			</td>
			<td>
				{#if agreement.delivery && agreement.delivery.deliveryHours}
					{@html getFormattedSelectedHours(agreement.delivery.deliveryHours)}
				{/if}
			</td>
		</Table>
	</PageBody>
</TransitionWrapper>
