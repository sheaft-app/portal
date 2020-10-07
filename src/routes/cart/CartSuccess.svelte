<script>
	import Icon from "svelte-awesome";
	import { onMount } from "svelte";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import GetRouterInstance from "../../services/SheaftRouter.js";
	import GetGraphQLInstance from "../../services/SheaftGraphQL.js";
  import { cartItems } from "./../../stores/app.js";
	import { GET_MY_ORDERS } from "./queries.js";
	import MyOrderRoutes from "./../my-orders/routes";
	import { faLink } from "@fortawesome/free-solid-svg-icons";

	const graphQLInstance = GetGraphQLInstance();
	const routerInstance = GetRouterInstance();

	let orders = [];

  const resetCart = () => {
    cartItems.set([]);
		localStorage.setItem("user_cart", JSON.stringify($cartItems));
		localStorage.removeItem("user_last_transaction");
	};
	
	onMount(async () => {
		let values = routerInstance.getQueryParams();

		const transactionCartId = localStorage.getItem("user_last_transaction");
		
		if (values.transactionId && transactionCartId == values.transactionId) {
			resetCart();
		}

		if (!values || !values.id) {
			return routerInstance.goTo(MyOrderRoutes.List);
		}

		// quand il n'y a qu'un seul ID, le paramètre est lu comme une string et non un array
		var ids = Array.isArray(values.id) ? values.id : [values.id];
		var response = await graphQLInstance.query(GET_MY_ORDERS, { ids });
		if (response.success) {
			orders = response.data;
		} else {
			return routerInstance.goTo(MyOrderRoutes.List);
		}
	});
</script>

<svelte:head>
	<title>Votre commande a été envoyée</title>
</svelte:head>

<TransitionWrapper>
	<div class="px-0 md:px-5 overflow-x-auto lg:-mx-4 md:-mx-5 mb-5">
		<div class="flex flex-wrap w-full items-start flex-col-reverse lg:flex-row">
			<div class="w-full lg:w-2/3 lg:pr-12">
				{#if orders.length > 1}
					<p class="mt-5 text-3xl sm:text-2xl text-primary">
						Vos commandes ont bien été envoyées.
					</p>
					<!-- <p class="text-4xl mt-5 text-center text-primary">MERCI 🎉</p>
					<p class="text-center">
						Grâce à vous, une consommation plus responsable est en marche.
					</p> -->
					<p class="text-xl font-semibold mb-2 mt-10">Et maintenant ?</p>
					<p class="mb-2">
						Vos commandes ont été envoyées aux producteurs concernés, qui
						doivent maintenant les valider. Vous recevrez une notification pour
						chaque mise à jour.
					</p>
					<p class="text-xl font-semibold mb-2 mt-6">Besoin d'une information ?</p>
					<p>
						Vous voulez savoir où en est votre commande ? Vous avez oublié où
						aller la chercher ? À quelle heure ? Vous pouvez trouver toutes les
						informations dans les détails de la commande dans votre espace
						<a
							href="javascript:void(0)"
							on:click={() => routerInstance.goTo(MyOrderRoutes.List)}>
							Mes Commandes
						</a>
						.
					</p>
				{:else}
					<p class="mt-5 text-2xl text-primary">
						Votre commande a bien été envoyée.
					</p>
					<!-- <p class="text-4xl mt-5 text-center text-primary">MERCI 🎉</p>
					<p class="text-center">
						Grâce à vous, une consommation plus responsable est en marche.
					</p> -->
					<p class="text-xl font-semibold mb-2 mt-10">Et maintenant ?</p>
					<p class="mb-2">
						Votre commande a été envoyée au producteur, qui doit maintenant la
						valider. Vous recevrez une notification quand celle-ci sera prête.
					</p>
					<p class="text-xl font-semibold mb-2 mt-6">Besoin d'une information ?</p>
					<p>
						Vous voulez savoir où en est votre commande ? Vous avez oublié où
						aller la chercher ? À quelle heure ? Vous pouvez trouver toutes les
						informations dans les détails de la commande dans votre espace
						<a
							href="javascript:void(0)"
							on:click={() => routerInstance.goTo(MyOrderRoutes.List)}>
							Mes Commandes
						</a>
						.
					</p>
				{/if}
			</div>
			<img
				src="./img/order-success.svg"
				class="mb-3 lg:mb-0 m-auto w-48 lg:w-auto"
				style="max-width: 280px;"
				alt="La commande a bien été envoyée !" />
		</div>
		{#if orders.length > 1}
			<p class="text-xl mb-2 font-semibold mt-6">Vos commandes</p>
		{:else}
			<p class="text-xl mb-2 font-semibold mt-6">Votre commande</p>
		{/if}
    {#each orders as order}
			<!-- <div class="mb-1">
				- {order.vendor.name}
				<a
					href="javascript:void(0)"
					on:click={() => routerInstance.goTo(MyOrderRoutes.Details, {
							id: order.id,
						})}>
					<Icon data={faLink} />
					voir le détail
				</a>
      </div> -->
      <div class="mb-1">
				- {order.vendor.name} : 
				<a
					href="javascript:void(0)"
					on:click={() => routerInstance.goTo(MyOrderRoutes.Details, {
							id: order.id,
						})}>#{order.reference}
				</a>
      </div>
		{/each}
		<!-- <div class="mt-2">
      <a href="javascript:void(0)" on:click={() => routerInstance.goTo(MyOrderRoutes.List)}>Voir toutes mes Commandes</a>
    </div> -->
	</div>
</TransitionWrapper>
