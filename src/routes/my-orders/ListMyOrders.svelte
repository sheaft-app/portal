<script>
	import {getContext, onMount} from "svelte";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import {formatMoney} from "./../../helpers/app";
	import {items} from "./store";
	import MyOrderListItem from "./MyOrderListItem.svelte";
	import {MY_ORDERS, MY_VALIDATING_ORDERS} from "./queries.js";
	import OrderByDirection from "./../../enums/OrderByDirection";
	import PurchaseOrderStatusKind from "../../enums/PurchaseOrderStatusKind";
	import SearchProductRoutes from "./../search-products/routes";
	import SheaftErrors from "../../services/SheaftErrors";
	import Icon from "svelte-awesome";
	import {faCircleNotch, faClock, faPlay} from "@fortawesome/free-solid-svg-icons";
	import OrderStatus from "../../enums/OrderStatusKind";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";
	import Actions from "../../components/table/Actions.svelte";

	const errorsHandler = new SheaftErrors();
	const { query } = getContext("api");

	let selected = null;
	let orders = [];
	let validatingOrders = [];
	let isLoading = true;

	const getMyOrders = async () => {
		isLoading = true;
		await query({
			query: MY_ORDERS,
			variables: { orderBy: {createdOn: OrderByDirection.DESC} },
			errorsHandler,
			success: (res) => {
				items.set(
					res.data.map((p) => ({
						...p,
						active:
							p.status !== PurchaseOrderStatusKind.Cancelled.Value &&
							p.status !== PurchaseOrderStatusKind.Withdrawned.Value &&
							p.status !== PurchaseOrderStatusKind.Refused.Value &&
							p.status !== PurchaseOrderStatusKind.Delivered.Value,
					})
				));
			},
			errorNotification: "Impossible de récupérer les commandes"
		});
		isLoading = false;
	};

	const getValidatingOrders = async () => {
		isLoading = true;
		validatingOrders = await query({
			query: MY_VALIDATING_ORDERS,
			errorsHandler,
			errorNotification: "Impossible de récupérer les commandes validées"
		});
		isLoading = false;
	}

	const changeOrdersDisplay = () => {
		switch (selected) {
			case "active":
				orders = $items.filter((o) => o.active);
				break;
			case "passed":
				orders = $items.filter((o) => !o.active);
				break;
			default:
				console.error("Type not supported");
		}
	};

	const selectOrdersDisplay = (type) => {
		selected = type;
		changeOrdersDisplay(type);
	};

	onMount(async () => {
		isLoading = true;
		await getMyOrders();
		await getValidatingOrders();

		if ($items.length === 0) {
			return;
		} else if ($items.filter((o) => o.active).length >= 1) {
			selected = "active";
		} else {
			selected = "passed";
		}

		selectOrdersDisplay(selected);
		isLoading = false;
	});

	$: hiddenNavigation =
		$items.filter((o) => !o.active).length < 1 ||
		$items.filter((o) => o.active).length < 1;
</script>

<TransitionWrapper>
	<PageHeader name="Mes commandes"/>
	<PageBody {errorsHandler} noResultsPage={SearchProductRoutes.NoResults} {isLoading} noResults={$items.length < 1 && validatingOrders.length < 1}>
		{#if !hiddenNavigation}
			<div
				class="text-lg justify-center button-group mb-5 w-full md:w-auto -mx-1 md:mx-0">
				<button
					on:click={() => selectOrdersDisplay('active')}
					type="button"
					class:selected={selected === 'active'}
					class:disabled={isLoading}>
					Actives
				</button>
				<button
					on:click={() => selectOrdersDisplay('passed')}
					type="button"
					class:selected={selected === 'passed'}
					class:disabled={isLoading}>
					Historique
				</button>
			</div>
		{/if}
		<div class="mb-5">
			{#each validatingOrders as validatingOrder}
				{#if validatingOrder.status == OrderStatus.Waiting.value}
					<div class="bg-white shadow px-4 py-3 mb-3">
						<div class="flex items-center mb-2">
							<Icon data={faCircleNotch} class="text-green-500 mr-3" spin/>
							<p class="font-semibold text-green-500">Un paiement est en cours de traitement</p>
						</div>
						<p>Le paiement de votre panier de <b>{formatMoney(validatingOrder.totalPrice)}</b> est en cours de
							traitement. Dès que le paiement aura été traité, la commande apparaîtra ici.</p>
						<p>Vous n'avez rien à faire. On vous fait signe dès qu'il arrive quoi que ce soit !</p>
					</div>
				{:else}
					<div class="bg-white shadow px-4 py-3 mb-3">
						<div class="flex items-center mb-2">
							<Icon data={faCircleNotch} class="text-green-500 mr-3" spin/>
							<p class="font-semibold text-green-500">Votre paiement a été validé</p>
						</div>
						<p>Le paiement de votre panier de <b>{formatMoney(validatingOrder.totalPrice)}</b> a bien été traité. La
							commande correspondante est en cours d'envoi au producteur et apparaîtra d'ici quelques instants.</p>
						<p>Vous n'avez rien à faire. On vous fait signe dès que c'est envoyé !</p>
					</div>
				{/if}
			{/each}
		</div>
		<div class="-mx-4 md:mx-0 md:overflow-x-auto md:w-full">
			<div
				class="align-middle inline-block min-w-full overflow-hidden items"
				style="padding-left: 1px; padding-right: 1px;">
				<div
					class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 md:gap-3 -mx-4
				md:mx-0 mb-10">
					{#each orders as order, index}
						<MyOrderListItem {order}/>
					{/each}
				</div>
			</div>
		</div>
	</PageBody>
</TransitionWrapper>
