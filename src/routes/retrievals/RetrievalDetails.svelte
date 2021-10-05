<script>
	import { onMount, onDestroy, getContext } from "svelte";
	import GetRouterInstance from "./../../services/SheaftRouter.js";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import { GET_DELIVERY_DETAILS } from "./queries";
	import DeliveryRoutes from "./routes";
	import SheaftErrors from "../../services/SheaftErrors";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";
	import ExpectedDeliveriesRoutes from "./routes";
	import { formatMoney } from "../../helpers/app";
	import { format } from "date-fns";
	import fr from "date-fns/locale/fr";
	import ConfirmRetrievals from "./ConfirmRetrievals.svelte";
	import { querystring } from "svelte-spa-router";
	import DeliveryProductsTable from './../../components/products-table/DeliveryProductsTable.svelte';

	const errorsHandler = new SheaftErrors();
	const { open } = getContext("modal");
	const { query, mutate } = getContext("api");
	const routerInstance = GetRouterInstance();

	export let params;

	let retrieval = null;
	let purchaseOrder = null;
	let isLoading = true;
	let loadingMessage = "Chargement des informations de votre livraison en cours.";

	onMount(async () => {
		await getRetrieval();
	});

	const markAsRetrieved = () =>
		open(ConfirmRetrievals, {
			retrievals: [retrieval],
			onClose: (res) => {
				if (res.success) routerInstance.goTo(DeliveryRoutes.List);
			},
		});

	onDestroy(() => (retrieval = null));

	const getRetrieval = async () => {
		isLoading = true;
		retrieval = await query({
			query: GET_DELIVERY_DETAILS,
			variables: { id: params.id },
			errorsHandler,
			error: () => routerInstance.goTo(DeliveryRoutes.List),
			errorNotification: "La distribution à laquelle vous essayez d'accéder n'est pas disponible.",
			skipCache: routerInstance.shouldSkipCache(),
		});

		isLoading = false;
	};

	$: getRetrieval($querystring);
	$: buttons =
		retrieval && !retrieval.deliveredOn
			? [
					{
						text: "Marquer comme distribuée",
						color: "green",
						click: () => markAsRetrieved(),
					},
			  ]
			: [];

	const calculateDelivered = (product) =>
		product.productsToDeliver + product.productsInExcess + product.productsBroken + product.productsMissing;
</script>

<TransitionWrapper>
	<PageHeader
		name="Commande {retrieval
			? retrieval.deliveredOn
				? ` distribuée le ${format(new Date(retrieval.deliveredOn), 'P', { locale: fr })}`
				: ` prévue pour le ${format(new Date(retrieval.scheduledOn), 'P', { locale: fr })}`
			: ''}"
		previousPage={ExpectedDeliveriesRoutes.List}
		{buttons}
	/>
	<PageBody {errorsHandler} {isLoading} {loadingMessage}>
		<div class="px-0 md:px-5 overflow-x-auto -mx-4 md:-mx-5">
			<div
				class="flex flex-wrap bg-white w-full items-top border
        border-gray-400"
			>
				<div
					class="w-full lg:w-3/6 border-b md:border-b-0 border-solid
          border-gray-400 px-4 lg:px-8 py-5
          lg:border-r "
				>
					<p class="uppercase font-bold pb-2">Client</p>
					<div class="mt-3">
						<div>
							<p class="mb-2">
								<span class="text-gray-600">Nom :</span>
								{retrieval.client.name}
							</p>
							<p class="text-base mb-2">
								<span class="text-gray-600">Mail :</span>
								<a href="mailto:{retrieval.client.email}">{retrieval.client.email}</a>
							</p>
							<p class="text-base mb-2">
								{#if retrieval.client.phone}
									<span class="text-gray-600">Tél :</span>
									<a href="tel:{retrieval.client.phone}">{retrieval.client.phone}</a>
								{/if}
							</p>
						</div>
					</div>
				</div>
				<div class="w-full lg:w-3/6 px-4 lg:px-8 py-5 border-b lg:border-b-0 border-solid border-gray-400">
					<p class="uppercase font-bold pb-2">Contenu</p>
					<div class="mt-3">
						<div class="mb-2">
							<span class="text-gray-600">Commandes:</span>
							<div>
								<ul>
									{#each retrieval.purchaseOrders as purchaseOrder}
										<li>
											{purchaseOrder.reference} ({format(new Date(purchaseOrder.createdOn), "P", {
												locale: fr,
											})})
										</li>
									{/each}
								</ul>
							</div>
						</div>
						{#if retrieval.deliveredOn}
							<div class="flex items-center mb-2">
								<p>
									<span class="text-gray-600">Produits récupérés:</span>
									{retrieval.productsDeliveredCount}
								</p>
							</div>
						{:else}
							<div class="flex items-center mb-2">
								<p>
									<span class="text-gray-600">Produits à récupérer:</span>
									{retrieval.productsToDeliverCount}
								</p>
							</div>
						{/if}
						{#if retrieval.deliveryFormUrl}
							<div class="flex items-center mb-2">
								<a href={retrieval.deliveryFormUrl}>Bon de livraison</a>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
		<DeliveryProductsTable deliveryId={retrieval.id} />	
	</PageBody>
</TransitionWrapper>
