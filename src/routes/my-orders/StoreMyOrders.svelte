<script>
	import { onMount, getContext } from "svelte";
	import Icon from "svelte-awesome";
	import { format } from "date-fns";
	import fr from "date-fns/locale/fr";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import Table from "../../components/table/Table.svelte";
	import GetRouterInstance from "./../../services/SheaftRouter";
	import MyOrderRoutes from "./routes";
	import PurchaseOrderStatusKind from "../../enums/PurchaseOrderStatusKind";
	import DeliveryKind from "./../../enums/DeliveryKind";
	import Select from "./../../components/controls/select/Select.js";
	import { formatMoney } from "./../../helpers/app";
	import { MY_ORDERS } from "./queries.js";
	import { faClock, faCalendarAlt, faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
	import SheaftErrors from "../../services/SheaftErrors";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";

	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();
	const { open } = getContext("modal");
	const { query } = getContext("api");

	const headers = [
		{ name: "Commande", sortLabel: "reference" },
		{ name: "Contenu" },
		{ name: "Livraison", displayOn: "md" },
		{ name: "Statut", displayOn: "md" },
		{ name: "Passée le", displayOn: "md", sortLabel: "createdOn" },
	];

	let selectedItems = [];
	let selectedStatus = null;
	let items = [];
	let isLoading = true;
	let hasPendingJobs = false;
	let noResults = false;

	$: routerInstance.replaceQueryParams({
		where: selectedStatus ? "status_in" : null,
		whereValues: selectedStatus ? selectedStatus.map((s) => s.value) : null,
	});

	const filterStatus = Object.entries(PurchaseOrderStatusKind)
		.map(([key, value]) => {
			if (value.List && value.Value && value.Label) {
				return {
					value: value.Value,
					label: value.Label,
				};
			}
		})
		.filter((p) => p);

	onMount(async () => {
		const values = routerInstance.getQueryParams();
		if (values["where"] && values["whereValues"] && filterStatus.length >= 1) {
			selectedStatus = values["whereValues"].split(",").map((v) => filterStatus.find((o) => o.value == v));
		}
	});

	const getRowBackgroundColor = (item) => "";

	const onRowClick = (item) => {
		routerInstance.goTo(MyOrderRoutes.Details, { id: item.id });
	};
</script>

<TransitionWrapper>
	<PageHeader name="Mes commandes" />
	<PageBody {errorsHandler}>
		<Table
			let:rowItem={order}
			bind:items
			bind:noResults
			{headers}
			bind:isLoading
			graphQuery={MY_ORDERS}
			{errorsHandler}
			loadingMessage="Chargement de vos commandes en cours."
			defaultSearchValues={MyOrderRoutes.List.Params.Query}
			{onRowClick}
		>
			<section slot="filters">
				<div class="themed">
					<Select
						isMulti={true}
						bind:selectedValue={selectedStatus}
						optionIdentifier="value"
						isDisabled={isLoading}
						placeholder="N'afficher que les commandes avec le statut..."
						items={filterStatus}
					/>
				</div>
			</section>
			<td class="px-2 md:px-6 py-4 whitespace-no-wrap">
				<div class="text-xs leading-5 font-semibold text-{PurchaseOrderStatusKind.color(order.status)} block md:hidden">
					{PurchaseOrderStatusKind.label(order.status)}
				</div>
				<div class="text-sm leading-5 font-medium text-gray-900 truncate" style="max-width: 180px;">
					{order.vendor.name}
				</div>
				<div class="text-sm leading-5 text-gray-600">#{order.reference}</div>
			</td>
			<td class="px-3 md:px-6 py-4 whitespace-no-wrap">
				<div class="text-sm leading-5 text-gray-900">
					{formatMoney(order.totalOnSalePrice)}
				</div>
				<div class="text-sm leading-5 text-gray-600">
					{order.productsCount} produits
				</div>
			</td>
			<td class="px-6 py-4 whitespace-no-wrap text-sm leading-5 hidden md:table-cell">
				<div>
					<p>
						<Icon data={faCalendarAlt} scale=".8" class=" inline" />
						{format(
							new Date(order.delivery ? order.delivery.scheduledOn : order.expectedDelivery.expectedDeliveryDate),
							"PP",
							{
								locale: fr,
							}
						)}
					</p>
					<p class="text-gray-600">
						<Icon data={faMapMarkerAlt} scale=".8" class=" inline" />
						{DeliveryKind.label(order.expectedDelivery.kind)}
					</p>
				</div>
			</td>
			<td class="px-6 py-4 whitespace-no-wrap hidden md:table-cell">
				<span
					class="px-3 inline-flex text-xs leading-5 font-semibold rounded-full
				{order.status == PurchaseOrderStatusKind.Delivered.Value
						? `bg-white border border-green-500 text-green-500`
						: `bg-${PurchaseOrderStatusKind.color(order.status)} text-white`}"
				>
					{PurchaseOrderStatusKind.label(order.status)}
				</span>
			</td>
			<td class="px-6 py-4 whitespace-no-wrap text-sm leading-5 hidden md:table-cell">
				<div>
					<p>
						<Icon data={faCalendarAlt} scale=".8" class=" inline" />
						{format(new Date(order.createdOn), "PP", { locale: fr })}
					</p>
					<p class="text-gray-600">
						<Icon data={faClock} scale=".8" class=" inline" />
						{format(new Date(order.createdOn), "p", { locale: fr })}
					</p>
				</div>
			</td>
		</Table>
	</PageBody>
</TransitionWrapper>

<style lang="scss">
	.themed {
		--cursor: pointer;
		--multiItemMargin: 5px 2px;
		--multiItemActiveBG: #ebedef;
		--multiItemDisabledHoverBg: #ebedef;
		--multiItemActiveColor: #205164;
		--borderFocusColor: rgba(160, 174, 192, 1);
	}

	tr {
		&:hover {
			box-shadow: inset 1px 0 0 #dadce0, inset -1px 0 0 #dadce0, 0 1px 2px 0 rgba(60, 64, 67, 0.3),
				0 1px 3px 1px rgba(60, 64, 67, 0.15);
		}
	}

	/* Ripple effect */
	.ripple {
		background-position: center;
		transition: background 0.8s;

		&:hover {
			background: #f7fafc radial-gradient(circle, transparent 1%, #edf2f7 1%) center/15000%;
		}

		&:active {
			background-size: 100%;
			transition: background 0s;
		}
	}
</style>
