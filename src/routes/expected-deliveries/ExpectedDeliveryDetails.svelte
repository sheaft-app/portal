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
	import { getDeliveryProductsQuantites, getPurchaseOrderModel, getPurchaseOrdersProductsQuantites } from "../../helpers/purchaseOrder";

	const errorsHandler = new SheaftErrors();
	const { open } = getContext("modal");
	const { query, mutate } = getContext("api");
	const routerInstance = GetRouterInstance();

	export let params;

	let purchaseOrder = null;
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

		let { orderedProducts, preparedProducts, orderedReturnables, preparedReturnables } = getPurchaseOrdersProductsQuantites(delivery.purchaseOrders);
		let { deliveredProducts, deliveredReturnables, returnedReturnables } = getDeliveryProductsQuantites(delivery);

		purchaseOrder = getPurchaseOrderModel(
			{orderedProducts, preparedProducts, deliveredProducts}, 
			{orderedReturnables, preparedReturnables, deliveredReturnables, returnedReturnables}, 
			{wholeSalePrice : delivery.deliveryFeesWholeSalePrice, vatPrice: delivery.deliveryFeesVatPrice, onSalePrice : delivery.deliveryFeesOnSalePrice});

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
						{#if delivery.deliveredOn}
							<div class="flex items-center mb-2">
								<p>
									<span class="text-gray-600">Livrée le :</span>
									{format(new Date(delivery.deliveredOn), "P", { locale: fr })}
								</p>
							</div>
						{:else}
							<div class="flex items-center mb-2">
								<p>
									<span class="text-gray-600">Prévue le :</span>
									{format(new Date(delivery.scheduledOn), "P", { locale: fr })}
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
											{purchaseOrder.reference} ({format(new Date(purchaseOrder.createdOn), "P", {
												locale: fr,
											})})
										</li>
									{/each}
								</ul>
							</div>
						</div>

						{#if delivery.deliveredOn}
							<div class="flex items-center mb-2">
								<p>
									<span class="text-gray-600">Produits livrés:</span>
									{delivery.productsDeliveredCount}
								</p>
							</div>
							{#if delivery.deliveryFormUrl}
								<div class="flex items-center mb-2">
									<a href={delivery.deliveryFormUrl}>Bon de livraison</a>
								</div>
							{/if}
						{:else}
							<div class="flex items-center mb-2">
								<p>
									<span class="text-gray-600">Produits à livrer:</span>
									{delivery.productsToDeliverCount}
								</p>
							</div>
							{#if delivery.deliveryReceiptUrl}
								<div class="flex items-center mb-2">
									<a href={delivery.deliveryReceiptUrl}>Bon de réception</a>
								</div>
							{/if}
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
		<div class="px-0 md:px-5 overflow-x-auto -mx-4 md:-mx-5 md:mb-5">
			<div class="flex flex-wrap bg-white w-full lg:w-auto px-4 lg:px-8">
				<div class="w-full">
					<section>
						<div class="-mx-4 lg:-mx-8">
							<table class="min-w-full leading-normal">
								<thead>
									<tr>
										<th
											class="px-4 md:px-8 py-3 border-b border-l border-gray-400
                      bg-gray-100 text-left text-xs font-semibold text-gray-600
                      uppercase tracking-wider"
										>
											Produit
										</th>
										<th
											class="px-4 md:px-8 py-3 border-b border-gray-400
                      bg-gray-100 text-center md:text-left text-xs font-semibold
                      text-gray-600 uppercase tracking-wider"
										>
											Qté commandée
										</th>
										<th
											class="px-4 md:px-8 py-3 border-b border-gray-400
                      bg-gray-100 text-center md:text-left text-xs font-semibold
                      text-gray-600 uppercase tracking-wider"
										>
											Qté préparée
										</th>
										<th
											class="px-4 md:px-8 py-3 border-b border-gray-400
                      bg-gray-100 text-center md:text-left text-xs font-semibold
                      text-gray-600 uppercase tracking-wider"
										>
											Qté livrée
										</th>
										<th
											class="px-4 md:px-8 py-3 border-b border-gray-400
                      bg-gray-100 text-xs font-semibold text-gray-600
                      uppercase tracking-wider hidden md:table-cell text-right"
										>
											PU HT
										</th>
										<th
											class="px-4 md:px-8 py-3 border-b border-gray-400
                      bg-gray-100 text-right text-xs font-semibold text-gray-600
                      uppercase tracking-wider"
										>
											Total HT
										</th>
										<th
											class="px-4 md:px-8 py-3 border-b border-r border-gray-400
                      bg-gray-100 text-right text-xs font-semibold text-gray-600
                      uppercase tracking-wider"
										>
											Total TTC
										</th>
									</tr>
								</thead>
								<tbody>
									{#each purchaseOrder.products as product, index}
										<tr>
											<td
												class="px-4 md:px-8 py-5 border-b border-l border-gray-400
                        bg-white text-sm lg:text-base"
											>
												<div class="items-center">
													<p>{product.name}</p>
													<p class="whitespace-no-wrap block lg:hidden">
														{formatMoney(product.unitWholeSalePrice)}
													</p>
													<p class="text-gray-600 whitespace-no-wrap">
														#{product.reference}
													</p>
												</div>
											</td>
											<td
												class="px-4 md:px-8 py-5 border-b border-gray-400
                        bg-white text-sm lg:text-base text-center md:text-left"
											>
												<p class="whitespace-no-wrap">{product.ordered}</p>
											</td>
											<td
												class="px-4 md:px-8 py-5 border-b border-gray-400
                        bg-white text-sm lg:text-base text-center md:text-left"
											>
												<p class="whitespace-no-wrap">{product.prepared}</p>
											</td>
											<td
												class="px-4 md:px-8 py-5 border-b border-gray-400
                        bg-white text-sm lg:text-base text-center md:text-left"
											>
												<p class="whitespace-no-wrap">{product.delivered}</p>
											</td>
											<td
												class="px-4 md:px-8 py-5 border-b border-gray-400
                        bg-white text-sm lg:text-base hidden md:table-cell text-right"
											>
												<p class="whitespace-no-wrap">
													{formatMoney(product.unitWholeSalePrice)}
												</p>
											</td>
											<td
												class="px-4 md:px-8 py-5 border-b border-gray-400
                        bg-white text-sm lg:text-base text-right"
											>
												<p class="whitespace-no-wrap">
													{formatMoney(product.totalWholeSalePrice)}
												</p>
											</td>
											<td
												class="px-4 md:px-8 py-5 border-b border-r border-gray-400
                        bg-white text-sm lg:text-base text-right"
											>
												<p class="whitespace-no-wrap">
													{formatMoney(product.totalOnSalePrice)}
												</p>
												<p class="whitespace-no-wrap">TVA : {product.vat}%</p>
											</td>
										</tr>
									{/each}
									{#each purchaseOrder.returnables as returnable, index}
										<tr>
											<td
												class="px-4 md:px-8 py-5 border-b border-l border-gray-400
                        bg-white text-sm lg:text-base"
											>
												<div class="items-center">
													<p>{returnable.name}</p>
													<small>Consignes déposée(s)</small>
													<p class="whitespace-no-wrap block lg:hidden">
														{formatMoney(returnable.unitWholeSalePrice)}
													</p>
												</div>
											</td>
											<td
												class="px-4 md:px-8 py-5 border-b border-gray-400
                        bg-white text-sm lg:text-base text-center md:text-left"
											>
												<p class="whitespace-no-wrap">{returnable.ordered}</p>
											</td>
											<td
												class="px-4 md:px-8 py-5 border-b border-gray-400
                        bg-white text-sm lg:text-base text-center md:text-left"
											>
												<p class="whitespace-no-wrap">{returnable.prepared}</p>
											</td>
											<td
												class="px-4 md:px-8 py-5 border-b border-gray-400
                        bg-white text-sm lg:text-base text-center md:text-left"
											>
												<p class="whitespace-no-wrap">{returnable.delivered}</p>
											</td>
											<td
												class="px-4 md:px-8 py-5 border-b border-gray-400
                        bg-white text-sm lg:text-base hidden md:table-cell text-right"
											>
												<p class="whitespace-no-wrap">
													{formatMoney(returnable.unitWholeSalePrice)}
												</p>
											</td>
											<td
												class="px-4 md:px-8 py-5 border-b border-gray-400
                        bg-white text-sm lg:text-base text-right"
											>
												<p class="whitespace-no-wrap">
													{formatMoney(returnable.totalWholeSalePrice)}
												</p>
											</td>
											<td
												class="px-4 md:px-8 py-5 border-b border-r border-gray-400
                        bg-white text-sm lg:text-base text-right"
											>
												<p class="whitespace-no-wrap">
													{formatMoney(returnable.totalOnSalePrice)}
												</p>
												<p class="whitespace-no-wrap">TVA : {returnable.vat}%</p>
											</td>
										</tr>
									{/each}
									{#each purchaseOrder.returnedReturnables as returnedReturnable, index}
										<tr>
											<td
												class="px-4 md:px-8 py-5 border-b border-l border-gray-400
                        bg-white text-sm lg:text-base"
											>
												<div class="items-center">
													<p>{returnedReturnable.name}</p>
													<small>Consignes récupérée(s)</small>
													<p class="whitespace-no-wrap block lg:hidden">
														{formatMoney(returnedReturnable.unitWholeSalePrice)}
													</p>
												</div>
											</td>
											<td
												class="px-4 md:px-8 py-5 border-b border-gray-400
                        bg-white text-sm lg:text-base text-center md:text-left"
											>
											</td>
											<td
												class="px-4 md:px-8 py-5 border-b border-gray-400
                        bg-white text-sm lg:text-base text-center md:text-left"
											>
											</td>
											<td
												class="px-4 md:px-8 py-5 border-b border-gray-400
                        bg-white text-sm lg:text-base text-center md:text-left"
											>
												<p class="whitespace-no-wrap">{returnedReturnable.delivered}</p>
											</td>
											<td
												class="px-4 md:px-8 py-5 border-b border-gray-400
                        bg-white text-sm lg:text-base hidden md:table-cell text-right"
											>
												<p class="whitespace-no-wrap">
													{formatMoney(returnedReturnable.unitWholeSalePrice)}
												</p>
											</td>
											<td
												class="px-4 md:px-8 py-5 border-b border-gray-400
                        bg-white text-sm lg:text-base text-right"
											>
												<p class="whitespace-no-wrap">
													{formatMoney(returnedReturnable.totalWholeSalePrice)}
												</p>
											</td>
											<td
												class="px-4 md:px-8 py-5 border-b border-r border-gray-400
                        bg-white text-sm lg:text-base text-right"
											>
												<p class="whitespace-no-wrap">
													{formatMoney(returnedReturnable.totalOnSalePrice)}
												</p>
												<p class="whitespace-no-wrap">TVA : {returnedReturnable.vat}%</p>
											</td>
										</tr>
									{/each}

									{#if purchaseOrder.deliveryFees.wholeSalePrice > 0}
										<tr>
											<td 
												class="px-4 md:px-8 py-5 border-b border-l border-gray-400
                        bg-white text-sm lg:text-base"
											>
												<div class="items-center">
													<p>Livraison</p>
													<p class="whitespace-no-wrap block lg:hidden">
														{formatMoney(purchaseOrder.deliveryFees.wholeSalePrice)}
													</p>
												</div>
											</td>
											<td
												class="px-4 md:px-8 py-5 border-b border-gray-400
                        bg-white text-sm lg:text-base text-center md:text-left"
											>
												<p class="whitespace-no-wrap">1</p></td
											>
											<td
												class="px-4 md:px-8 py-5 border-b border-gray-400
                        bg-white text-sm lg:text-base text-center md:text-left"
											>
												<p class="whitespace-no-wrap"></p>
											</td>
											<td
												class="px-4 md:px-8 py-5 border-b border-gray-400
                        bg-white text-sm lg:text-base text-center md:text-left"
											>
												<p class="whitespace-no-wrap"></p>
											</td>
											<td
												class="px-4 md:px-8 py-5 border-b border-gray-400
                        bg-white text-sm lg:text-base text-right"
											>
												<p class="whitespace-no-wrap">
													{formatMoney(purchaseOrder.deliveryFees.wholeSalePrice)}
												</p>
											</td>
											<td
												class="px-4 md:px-8 py-5 border-b border-gray-400
                        bg-white text-sm lg:text-base text-right"
											>
												<p class="whitespace-no-wrap">
													{formatMoney(purchaseOrder.deliveryFees.wholeSalePrice)}
												</p>
											</td>
											<td
												class="px-4 md:px-8 py-5 border-b border-r border-gray-400
                        bg-white text-sm lg:text-base text-right"
											>
												<p class="whitespace-no-wrap">
													{formatMoney(purchaseOrder.deliveryFees.onSalePrice)}
												</p>
												<p class="whitespace-no-wrap">TVA : 20%</p>
											</td>
										</tr>
									{/if}
									<tr>
										<td
											class="border-b border-gray-400 border-l bg-white px-4 md:px-8
                      py-5 text-lg text-right uppercase font-semibold md:hidden table-cell"
											colSpan="6"
										>
											Total HT:
										</td>
										<td
											class="border-b border-gray-400 border-l bg-white px-4 md:px-8
                      py-5 text-lg text-right uppercase font-semibold md:table-cell hidden"
											colSpan="6"
										>
											Total HT:
										</td>
										<td
											class="border-b border-gray-400 bg-white px-4 md:px-8
                      py-5 text-lg text-right font-bold col-span-1 border-r"
											colSpan="1"
										>
											{formatMoney(purchaseOrder.totalWholeSalePrice + purchaseOrder.deliveryFees.wholeSalePrice)}
										</td>
									</tr>
									<tr>
										<td
											class="border-b border-gray-400 border-l bg-white px-4 md:px-8
                      py-5 text-lg text-right uppercase font-semibold md:hidden table-cell"
											colspan="6"
										>
											Total TVA:
										</td>
										<td
											class="border-b border-gray-400 border-l bg-white px-4 md:px-8
                      py-5 text-lg text-right uppercase font-semibold md:table-cell hidden"
											colspan="6"
										>
											Total TVA:
										</td>
										<td
											class="border-b border-gray-400 bg-white px-4 md:px-8
                      py-5 text-lg text-right font-bold col-span-1 border-r"
											colspan="1"
										>
											{formatMoney(purchaseOrder.totalVatPrice + purchaseOrder.deliveryFees.vatPrice)}
										</td>
									</tr>
									<tr>
										<td
											class="border-b border-gray-400 border-l bg-white px-4 md:px-8
                      py-5 text-lg text-right uppercase font-semibold md:hidden table-cell"
											colspan="6"
										>
											Total TTC:
										</td>
										<td
											class="border-b border-gray-400 border-l bg-white px-4 md:px-8
                      py-5 text-lg text-right uppercase font-semibold md:table-cell hidden"
											colspan="6"
										>
											Total TTC:
										</td>
										<td
											class="border-b border-gray-400 bg-white px-4 md:px-8
                      py-5 text-lg text-right font-bold col-span-1 border-r"
											colspan="1"
										>
											{formatMoney(purchaseOrder.totalOnSalePrice + purchaseOrder.deliveryFees.onSalePrice)}
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</section>
				</div>
			</div>
		</div>
		{#if delivery.comment && delivery.comment.length > 0}
			<div class="px-0 md:px-5 overflow-x-auto -mx-4 md:mx-0 bg-white border-t md:border border-gray-400">
				<div class=" px-4 py-5">
					<p class="uppercase font-bold pb-2">Remarques</p>
					<p>{delivery.comment}</p>
				</div>
			</div>
		{/if}
	</PageBody>
</TransitionWrapper>
