<script>
	import DeliveryProductsTable from './../../components/products-table/DeliveryProductsTable.svelte';
	import { onMount, onDestroy, getContext } from "svelte";
	import GetRouterInstance from "./../../services/SheaftRouter.js";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import { GET_DELIVERY_DETAILS } from "./queries";
	import DeliveryRoutes from "./routes";
	import SheaftErrors from "../../services/SheaftErrors";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";
	import ExpectedDeliveriesRoutes from "./routes";
	import MyOrdersRoutes from "./../my-orders/routes";
	import { format } from "date-fns";
	import fr from "date-fns/locale/fr";
	
	const errorsHandler = new SheaftErrors();
	const { query } = getContext("api");
	const routerInstance = GetRouterInstance();

	export let params;

	let delivery = null;
	let isLoading = true;
	let loadingMessage = "Chargement des informations de votre livraison en cours.";

	onMount(async () => {
		isLoading = true;
		await query({
			query: GET_DELIVERY_DETAILS,
			variables: { id: params.id },
			errorsHandler,
			success: (res) => {
				delivery = res;
			},
			error: () => routerInstance.goTo(DeliveryRoutes.List),
			errorNotification: "La livraison à laquelle vous essayez d'accéder n'est pas disponible.",
			skipCache: routerInstance.shouldSkipCache(),
		});

		isLoading = false;
	});

	onDestroy(() => (delivery = null));
</script>

<TransitionWrapper>
	<PageHeader
		name="Livraison {delivery
			? delivery.deliveredOn
				? ` livrée le ${format(new Date(delivery.deliveredOn), 'P', { locale: fr })}`
				: ` prévue le ${format(new Date(delivery.scheduledOn), 'P', { locale: fr })}`
			: ''}"
		previousPage={ExpectedDeliveriesRoutes.List}
	/>
	<PageBody {errorsHandler} {isLoading} {loadingMessage}>
		<div class="px-0 md:px-5 overflow-x-auto -mx-4 md:-mx-5">
			<div
				class="flex flex-wrap bg-white w-full items-top border
        border-gray-400"
			>
				<div
					class="w-full lg:w-2/6 px-4 lg:px-8 py-5 border-b lg:border-b-0
          lg:border-r border-solid border-gray-400"
				>
					<p class="uppercase font-bold pb-2">Livraison</p>
					<div class="mt-3">
						<div class="flex items-center mb-2">
							<p>
								<span class="text-gray-600">Référence :</span>
								{delivery.reference}
							</p>
						</div>
							<div class="flex items-center mb-2">
								<p>
									<span class="text-gray-600">Prévue le :</span>
									{format(new Date(delivery.scheduledOn), "P", { locale: fr })}
								</p>
							</div>
						{#if delivery.deliveredOn}
							<div class="flex items-center mb-2">
								<p>
									<span class="text-gray-600">Livrée le :</span>
									{format(new Date(delivery.deliveredOn), "P", { locale: fr })}
								</p>
							</div>
						{/if}
					</div>
				</div>
				<div
					class="w-full lg:w-2/6 px-4 lg:px-8 py-5 border-b lg:border-b-0
          lg:border-r border-solid border-gray-400"
				>
					<p class="uppercase font-bold pb-2">Contenu</p>
					<div class="mt-3">
						<div class="mb-2">
							<span class="text-gray-600">Commandes:</span>
							<div>
								<ul>
									{#each delivery.purchaseOrders as purchaseOrder}
										<li>
											<a href="javascript:void(0)" on:click={() => routerInstance.goTo(MyOrdersRoutes.Details, {id: purchaseOrder.id})}>
											{purchaseOrder.reference}
											</a> ({format(new Date(purchaseOrder.createdOn), "P", {
												locale: fr,
											})})
										</li>
									{/each}
								</ul>
							</div>
						</div>

						{#if delivery.deliveredOn && delivery.deliveryFormUrl}
							<div class="flex items-center mb-2">
								<a href={delivery.deliveryFormUrl}>Bon de livraison</a>
							</div>
						{/if}
						{#if !delivery.deliveredOn && delivery.deliveryReceiptUrl}
							<div class="flex items-center mb-2">
								<a href={delivery.deliveryReceiptUrl}>Bon de réception</a>
							</div>
						{/if}
					</div>
				</div>
				<div
					class="w-full lg:w-2/6 border-b md:border-b-0 border-solid
          border-gray-400 px-4 lg:px-8 py-5"
				>
					<p class="uppercase font-bold pb-2">Producteur</p>
					<div class="mt-3">
						<div>
							<p class="mb-2">
								<span class="text-gray-600">Nom :</span>
								{delivery.producer.name}
							</p>
							<p class="text-base mb-2">
								<span class="text-gray-600">Mail :</span>
								<a href="mailto:{delivery.producer.email}">{delivery.producer.email}</a>
							</p>
							<p class="text-base mb-2">
								{#if delivery.producer.phone}
									<span class="text-gray-600">Tél :</span>
									<a href="tel:{delivery.producer.phone}">{delivery.producer.phone}</a>
								{/if}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
		<DeliveryProductsTable deliveryId={delivery.id} />		
	</PageBody>
</TransitionWrapper>
