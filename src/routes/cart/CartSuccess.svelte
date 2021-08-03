<script>
	import { getContext, onMount } from "svelte";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import GetRouterInstance from "../../services/SheaftRouter.js";
	import cart from "./../../stores/cart.js";
	import { GET_MY_ORDER_FROM_TRANSACTION, GET_MY_ORDERS } from "./queries.js";
	import MyOrderRoutes from "./../my-orders/routes";
	import SheaftErrors from "../../services/SheaftErrors";
	import ErrorCard from "./../../components/ErrorCard.svelte";
	import Loader from "../../components/Loader.svelte";
	import Icon from "svelte-awesome";
	import { faLink } from "@fortawesome/free-solid-svg-icons";
	import OrderStatusKind from "../../enums/OrderStatusKind";

	const routerInstance = GetRouterInstance();
	const errorsHandler = new SheaftErrors();
	const { query, clearApolloCache } = getContext("api");

	let isLoading = true;
	let order = null;

	onMount(async () => {
		isLoading = true;
		let id = $cart.userCurrentOrder;
		let orderQuery = GET_MY_ORDERS;
		await cart.reset();

		let values = routerInstance.getQueryParams();
		if (values.id) id = values.id;
		else if (values.transactionId) {
			id = values.transactionId;
			orderQuery = GET_MY_ORDER_FROM_TRANSACTION;
		}

		await query({
			query: orderQuery,
			variables: { id: id },
			success: (res) => {
				if (res.status === OrderStatusKind.Validated.Value || res.status === OrderStatusKind.Confirmed.Value)
					order = res;
				else routerInstance.goTo(MyOrderRoutes.List);
			},
			errorsHandler,
			error: () => routerInstance.goTo(MyOrderRoutes.List),
		});

		isLoading = false;
	});
</script>

<svelte:head>
	<title>Votre paiement a été validé</title>
</svelte:head>

<TransitionWrapper>
	<ErrorCard {errorsHandler} />
	{#if isLoading}
		<Loader />
	{:else if order}
		<div class="px-0 md:px-5 overflow-x-auto lg:-mx-4 md:-mx-5 mb-5">
			<div class="flex flex-wrap w-full items-start flex-col-reverse lg:flex-row">
				<div class="w-full lg:w-2/3 lg:pr-12">
					<p class="mt-5 text-3xl sm:text-2xl text-primary">
						Votre paiement de {order.totalOnSalePrice}€ a été validé.
					</p>
					<p class="text-xl font-semibold mb-2 mt-10">Et maintenant ?</p>
					{#if order.deliveries && order.deliveries.length > 1}
						<p class="mb-2">
							Vos commandes ont été envoyées aux producteurs concernés, qui doivent maintenant les
							accepter. Vous recevrez une notification pour chaque mise à jour.
						</p>
					{:else}
						<p class="mb-2">
							Votre commande a été envoyée au producteur, qui doit maintenant l'accepter. Vous recevrez
							une notification pour chaque mise à jour.
						</p>
					{/if}
					<p class="text-xl font-semibold mb-2 mt-6">Besoin d'une information ?</p>
					<p>
						Vous voulez savoir où en est votre commande ? Vous avez oublié où aller la chercher ? À quelle
						heure ? Vous pouvez trouver toutes les informations dans les détails de la commande dans votre
						espace <a href="javascript:void(0)" on:click={() => routerInstance.goTo(MyOrderRoutes.List)}>
							Mes Commandes
						</a> .
					</p>
				</div>
				<img
					src="./img/order-success.svg"
					class="mb-3 lg:mb-0 m-auto w-48 lg:w-auto"
					style="max-width: 280px;"
					alt="La commande a bien été envoyée !"
				/>
			</div>
			{#if order.purchaseOrders && order.purchaseOrders.length > 0}
				{#if order.purchaseOrders.length > 1}
					<p class="text-xl mb-2 font-semibold mt-6">Vos commandes</p>
				{:else}
					<p class="text-xl mb-2 font-semibold mt-6">Votre commande</p>
				{/if}
				{#each order.purchaseOrders as order}
					<div class="mb-1">
						- {order.vendor.name}
						<a
							href="javascript:void(0)"
							on:click={() =>
								routerInstance.goTo(MyOrderRoutes.Details, {
									id: order.id,
								})}
						>
							<Icon data={faLink} />
							voir le détail
						</a>
					</div>
				{/each}
			{:else}
				{#if order.deliveries.length > 1}
					<p class="text-xl mb-2 font-semibold mt-6">Vos commandes</p>
				{:else}
					<p class="text-xl mb-2 font-semibold mt-6">Votre commande</p>
				{/if}
				{#each order.deliveries as delivery}
					<div class="mb-1">
						- {delivery.deliveryMode.producer.name} prévue pour le
						<strong>{new Date(delivery.expectedDelivery.expectedDeliveryDate).toLocaleDateString()}</strong
						>.
					</div>
				{/each}
			{/if}
		</div>
	{/if}
</TransitionWrapper>
