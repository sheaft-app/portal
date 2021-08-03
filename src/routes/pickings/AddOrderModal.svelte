<script>
	import { getContext, onMount } from "svelte";
	import { GET_AVAILABLE_PICKINGS, GET_PICKINGS } from "./queries";
	import { UPDATE_PICKING } from "./mutations";
	import InputCheckbox from "../../components/controls/InputCheckbox.svelte";
	import SheaftErrors from "../../services/SheaftErrors";
	import { formatMoney } from "../../helpers/app";
	import format from "date-fns/format";
	import fr from "date-fns/locale/fr";
	import Icon from "svelte-awesome";
	import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
	import Loader from "../../components/Loader.svelte";
	import GetRouterInstance from "../../services/SheaftRouter";

	export let close;
	export let picking;

	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();
	const { query, mutate } = getContext("api");

	let availableOrders = [];
	let isLoading = false;
	let isFetching = true;

	onMount(async () => {
		isFetching = true;
		await query({
			query: GET_AVAILABLE_PICKINGS,
			variables: { includePendingPurchaseOrders: true },
			success: (res) => {
				res.data.map((availablePicking) => {
					availableOrders = [
						...availableOrders,
						...availablePicking.clients
							.map((c) => c.purchaseOrders.map((p) => ({ ...p, name: c.name, clientId: c.id })))
							.flat(),
					];
				});
			},
			errorsHandler,
			errorNotification: "Impossible de charger les préparations disponibles",
		});
		isFetching = false;
	});

	const handleSubmit = async () => {
		isLoading = true;
		await mutate({
			mutation: UPDATE_PICKING,
			variables: {
				id: picking.id,
				name: picking.name,
				purchaseOrderIds: [
					...picking.purchaseOrders.map((p) => p.id),
					...availableOrders.filter((o) => o.checked).map((p) => p.id),
				],
			},
			errorsHandler,
			success: () => {
				close();
				routerInstance.refresh();
			},
			successNotification: "Commande(s) ajoutée(s) avec succès !",
			errorNotification: "Impossible d'ajouter une commande",
			clearCache: [picking.id, GET_AVAILABLE_PICKINGS, GET_PICKINGS],
		});
		isLoading = false;
	};
</script>

<div class="pb-2">
	<div class="flex justify-between bg-primary -mx-6 px-6 py-2 -mt-2 items-center md:rounded-t-l">
		<h3 class="text-lg font-semibold text-white mb-0">Choisir des commandes à ajouter</h3>
	</div>
	{#if isFetching}
		<Loader />
	{:else if availableOrders.length > 0}
		{#each availableOrders as order}
			<div
				class="flex border-b border-gray-400 py-2 items-center cursor-pointer"
				on:click={() => (order.checked = !order.checked)}
			>
				<div class="w-1/12">
					<InputCheckbox checked={order.checked} />
				</div>
				<div class="px-4 py-2 shadow rounded">
					<p class="font-semibold mb-1 -mx-4 -my-2 bg-gray-200 px-4 py-2">{order.name}</p>
					<p class="mb-1">Montant HT : {formatMoney(order.totalWholeSalePrice)}</p>
					<p class="mb-1">Produits dans la commande : {order.productsCount}</p>
					<p class="mb-2">
						Livraison demandée le {format(new Date(order.expectedDeliveryDate), "PP", { locale: fr })}
					</p>
				</div>
			</div>
		{/each}
		<div class="flex space-x-2">
			<button class="btn btn-outline btn-lg my-3 m-auto" type="button" on:click={close}>Fermer</button>
			<button
				class="btn btn-accent btn-lg my-3 m-auto"
				type="button"
				class:disabled={isLoading || !availableOrders.find((o) => o.checked)}
				disabled={isLoading || !availableOrders.find((o) => o.checked)}
				on:click={handleSubmit}
			>
				{#if isLoading}
					<Icon data={faCircleNotch} spin />
				{/if}
				Ajouter ces commandes
			</button>
		</div>
	{:else}
		<p class="my-3">Aucune commande disponible.</p>
		<button class="btn btn-outline btn-lg my-3 m-auto" type="button" on:click={close}>Fermer</button>
	{/if}
</div>
