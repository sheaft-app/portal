<script>
	import { onMount } from "svelte";
	import Loader from "./../../components/Loader.svelte";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import GetGraphQLInstance from "./../../services/SheaftGraphQL";
	import { formatMoney } from "./../../helpers/app";
	import GetRouterInstance from "./../../services/SheaftRouter";
	import GetAuthInstance from "./../../services/SheaftAuth";
	import { isLoading, items } from "./store";
	import MyOrderListItem from "./MyOrderListItem.svelte";
	import { MY_ORDERS, MY_VALIDATING_ORDERS } from "./queries.js";
	import OrderByDirection from "./../../enums/OrderByDirection";
	import OrderStatusKind from "./../../enums/OrderStatusKind";
	import SearchProductRoutes from "./../search-products/routes";
	import QuickOrderRoutes from "./../quick-orders/routes";
	import Roles from "./../../enums/Roles";
	import SheaftErrors from "../../services/SheaftErrors";
	import ErrorCard from "./../../components/ErrorCard.svelte";
  import Icon from "svelte-awesome";
  import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";

	const errorsHandler = new SheaftErrors();
	const authInstance = GetAuthInstance();
	const graphQLInstance = GetGraphQLInstance();
	const routerInstance = GetRouterInstance();

	let selected = null;
	let orders = [];
	let validatingOrders = [];

	const getMyOrders = async () => {
		isLoading.set(true);
		var res = await graphQLInstance.query(
			MY_ORDERS,
			{
				orderBy: { createdOn: OrderByDirection.DESC },
			},
			errorsHandler.Uuid
    );
    
		isLoading.set(false);

		if (!res.success) {
			//TODO
			return;
		}

		items.set(
			res.data.map((p) => {
				return {
					...p,
					active:
						p.status !== OrderStatusKind.Cancelled.Value &&
						p.status !== OrderStatusKind.Refused.Value,
				};
			})
		);
	};

	const getValidatingOrders = async () => {
		isLoading.set(true);
		var res = await graphQLInstance.query(MY_VALIDATING_ORDERS, {}, errorsHandler.Uuid);

		if (!res.success) {
			//TODO
			isLoading.set(false);
			return;
		}

		validatingOrders = res.data;
		isLoading.set(false);
	}

	const goToOrderProducts = () => {
		if (authInstance.isInRole([Roles.Store.Value])) {
			routerInstance.goTo(QuickOrderRoutes.Purchase);
			return;
		}

		routerInstance.goTo(SearchProductRoutes.Search);
	};

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
	});

	$: hiddenNavigation =
		$items.filter((o) => !o.active).length < 1 ||
		$items.filter((o) => o.active).length < 1;
</script>

<svelte:head>
	<title>Mes Commandes</title>
</svelte:head>

<TransitionWrapper>
	<ErrorCard {errorsHandler} />
	{#if $isLoading}
		<Loader />
	{:else if $items.length > 0 || validatingOrders.length > 0}
		<h1 class="mb-6">Mes commandes</h1>
		{#if !hiddenNavigation}
			<div
				class="text-lg justify-center button-group mb-5 w-full -mx-1 md:mx-0">
				<button
					on:click={() => selectOrdersDisplay('active')}
					type="button"
					class:selected={selected === 'active'}
					class:disabled={$isLoading}>
					Actives
				</button>
				<button
					on:click={() => selectOrdersDisplay('passed')}
					type="button"
					class:selected={selected === 'passed'}
					class:disabled={$isLoading}>
					Historique
				</button>
			</div>
		{/if}
		<div class="mb-5">
			{#each validatingOrders as validatingOrder}
				<div class="bg-white shadow px-4 py-3 mb-3">
					<div class="flex items-center mb-2">
						<Icon data={faCircleNotch} class="text-green-500 mr-3" spin />
						<p class="font-semibold text-green-500">Un paiement est en cours de traitement</p>
					</div>
					<p>Le paiement de votre panier de <b>{formatMoney(validatingOrder.totalPrice)}</b> est en cours de traitement. Dès que le paiement aura été traité, la commande apparaîtra ici.</p>
					<p>Vous n'avez rien à faire. On vous fait signe dès qu'il arrive quoi que ce soit !</p>
				</div>
			{/each}
		</div>
		<div class="-mx-4 md:mx-0 md:overflow-x-auto md:w-full">
			<div
				class="align-middle inline-block min-w-full overflow-hidden items px-1">
				<div
					class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 md:gap-3 -mx-4
					md:mx-0 mb-10">
					{#each orders as order, index}
						<MyOrderListItem {order} />
					{/each}
				</div>
			</div>
		</div>
	{:else}
		<div
			class="text-center text-gray-600 flex w-full h-full justify-center
			items-center">
			<div>
				<p class="text-2xl">Vous n'avez aucune commande.</p>
				<p class="mb-5 text-2xl">Première étape, constituer un panier !</p>
				<button
					on:click={goToOrderProducts}
					aria-label="Accéder à la recherche de produits"
					class="btn btn-lg btn-accent mt-3 m-auto">
					Je me lance
				</button>
			</div>
		</div>
	{/if}
</TransitionWrapper>
