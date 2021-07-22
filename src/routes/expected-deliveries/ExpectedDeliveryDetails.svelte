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

	const errorsHandler = new SheaftErrors();
	const { open } = getContext("modal");
	const { query, mutate } = getContext("api");
	const routerInstance = GetRouterInstance();

	export let params;

	let productsGroupedToBill = {};
	let returnablesGroupedToBill = {};
	let totalHT = 0;
	let totalTVA = 0;
	let totalTTC = 0;
	let delivery = null;
	let isLoading = true;
	let loadingMessage = "Chargement des informations de votre livraison en cours.";

	onMount(async () => {
		isLoading = true;
		delivery = await query({
			query: GET_DELIVERY_DETAILS,
			variables: { id: params.id },
			errorsHandler,
			error: () => routerInstance.goTo(DeliveryRoutes.List),
			errorNotification: "La livraison à laquelle vous essayez d'accéder n'est pas disponible.",
		});

		if (delivery.products) {
			for (let i = 0; i < delivery.products.length; i++) {
				if (!productsGroupedToBill[delivery.products[i].productId])
					productsGroupedToBill[delivery.products[i].productId] = {
						id: delivery.products[i].productId,
						name: delivery.products[i].name,
						reference: delivery.products[i].reference,
						quantity: delivery.products[i].quantity,
						vat: delivery.products[i].vat,
						unitWholeSalePrice: delivery.products[i].unitWholeSalePrice,
						totalWholeSalePrice: delivery.products[i].totalProductWholeSalePrice,
						totalOnSalePrice: delivery.products[i].totalProductOnSalePrice,
						totalVatPrice: delivery.products[i].totalProductVatPrice,
					};
				else {
					productsGroupedToBill[delivery.products[i].productId].quantity += delivery.products[i].quantity;
					productsGroupedToBill[delivery.products[i].productId].totalWholeSalePrice +=
						delivery.products[i].totalProductWholeSalePrice;
					productsGroupedToBill[delivery.products[i].productId].totalOnSalePrice +=
						delivery.products[i].totalProductOnSalePrice;
					productsGroupedToBill[delivery.products[i].productId].totalVatPrice +=
						delivery.products[i].totalProductVatPrice;
				}

				if (!delivery.products[i].isReturnable) continue;

				if (!returnablesGroupedToBill[delivery.products[i].returnableId])
					returnablesGroupedToBill[delivery.products[i].returnableId] = {
						id: delivery.products[i].returnableId,
						name: `${delivery.products[i].returnableName} (Consignes déposées)`,
						quantity: delivery.products[i].quantity,
						vat: delivery.products[i].returnableVat,
						unitWholeSalePrice: delivery.products[i].returnableWholeSalePrice,
						totalWholeSalePrice: delivery.products[i].totalReturnableWholeSalePrice,
						totalOnSalePrice: delivery.products[i].totalReturnableOnSalePrice,
						totalVatPrice: delivery.products[i].totalReturnableVatPrice,
					};
				else {
					returnablesGroupedToBill[delivery.products[i].returnableId].quantity += delivery.products[i].quantity;
					returnablesGroupedToBill[delivery.products[i].returnableId].totalWholeSalePrice +=
						delivery.products[i].totalReturnableWholeSalePrice;
					returnablesGroupedToBill[delivery.products[i].returnableId].totalOnSalePrice +=
						delivery.products[i].totalReturnableOnSalePrice;
					returnablesGroupedToBill[delivery.products[i].returnableId].totalVatPrice +=
						delivery.products[i].totalReturnableVatPrice;
				}
			}
		}

		if (delivery.returnedReturnables) {
			for (let i = 0; i < delivery.returnedReturnables.length; i++) {
				if (!returnablesGroupedToBill[delivery.returnedReturnables[i].id])
					returnablesGroupedToBill[delivery.returnedReturnables[i].id] = {
						id: delivery.returnedReturnables[i].id,
						name: `${delivery.returnedReturnables[i].name} (Consignes récupérées)`,
						quantity: delivery.returnedReturnables[i].quantity,
						vat: delivery.returnedReturnables[i].vat,
						unitWholeSalePrice: delivery.returnedReturnables[i].unitWholeSalePrice,
						totalWholeSalePrice: delivery.returnedReturnables[i].totalWholeSalePrice,
						totalOnSalePrice: delivery.returnedReturnables[i].totalOnSalePrice,
						totalVatPrice: delivery.returnedReturnables[i].totalVatPrice,
					};
				else {
					returnablesGroupedToBill[delivery.returnedReturnables[i].id].quantity +=
						delivery.returnedReturnables[i].quantity;
					returnablesGroupedToBill[delivery.returnedReturnables[i].id].totalWholeSalePrice +=
						delivery.returnedReturnables[i].totalWholeSalePrice;
					returnablesGroupedToBill[delivery.returnedReturnables[i].id].totalOnSalePrice +=
						delivery.returnedReturnables[i].totalOnSalePrice;
					returnablesGroupedToBill[delivery.returnedReturnables[i].id].totalVatPrice +=
						delivery.returnedReturnables[i].totalVatPrice;
				}
			}
		}

		Object.keys(productsGroupedToBill).map((id) => {
			totalHT += productsGroupedToBill[id].totalWholeSalePrice;
			totalTVA += productsGroupedToBill[id].totalVatPrice;
			totalTTC += productsGroupedToBill[id].totalOnSalePrice;
		});

		Object.keys(returnablesGroupedToBill).map((id) => {
			totalHT += returnablesGroupedToBill[id].totalWholeSalePrice;
			totalTVA += returnablesGroupedToBill[id].totalVatPrice;
			totalTTC += returnablesGroupedToBill[id].totalOnSalePrice;
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
											{purchaseOrder.reference} ({format(new Date(purchaseOrder.createdOn), "P", { locale: fr })})
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
							<div class="flex items-center mb-2">
								<a href={delivery.deliveryFormUrl}>Bon de livraison</a>
							</div>
						{:else}
							<div class="flex items-center mb-2">
								<p>
									<span class="text-gray-600">Produits à livrer:</span>
									{delivery.productsToDeliverCount}
								</p>
							</div>
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
                      bg-gray-100 text-left text-xs font-semibold text-gray-600
                      uppercase tracking-wider hidden md:table-cell"
										>
											PU HT
										</th>
										<th
											class="px-4 md:px-8 py-3 border-b border-gray-400
                      bg-gray-100 text-center md:text-left text-xs font-semibold
                      text-gray-600 uppercase tracking-wider"
										>
											Qté
										</th>
										<th
											class="px-4 md:px-8 py-3 border-b border-gray-400
                      bg-gray-100 text-center md:text-left text-xs font-semibold
                      text-gray-600 uppercase tracking-wider"
										>
											TVA
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
									{#each Object.keys(productsGroupedToBill) as id, index}
										<tr>
											<td
												class="px-4 md:px-8 py-5 border-b border-l border-gray-400
                        bg-white text-sm lg:text-base"
											>
												<div class="items-center">
													<p>{productsGroupedToBill[id].name}</p>
													<p class="whitespace-no-wrap block lg:hidden">
														{formatMoney(productsGroupedToBill[id].unitWholeSalePrice)}
													</p>
													<p class="text-gray-600 whitespace-no-wrap">
														#{productsGroupedToBill[id].reference}
													</p>
												</div>
											</td>
											<td
												class="px-4 md:px-8 py-5 border-b border-gray-400
                        bg-white text-sm lg:text-base hidden md:table-cell"
											>
												<p class="whitespace-no-wrap">
													{formatMoney(productsGroupedToBill[id].unitWholeSalePrice)}
												</p>
											</td>
											<td
												class="px-4 md:px-8 py-5 border-b border-gray-400
                        bg-white text-sm lg:text-base text-center md:text-left"
											>
												<p class="whitespace-no-wrap">{productsGroupedToBill[id].quantity}</p>
											</td>
											<td
												class="px-4 md:px-8 py-5 border-b border-gray-400
                        bg-white text-sm lg:text-base text-center md:text-left"
											>
												<p class="whitespace-no-wrap">{productsGroupedToBill[id].vat}%</p>
											</td>
											<td
												class="px-4 md:px-8 py-5 border-b border-gray-400
                        bg-white text-sm lg:text-base text-right"
											>
												<p class="whitespace-no-wrap">
													{formatMoney(productsGroupedToBill[id].totalWholeSalePrice)}
												</p>
											</td>
											<td
												class="px-4 md:px-8 py-5 border-b border-r border-gray-400
                        bg-white text-sm lg:text-base text-right"
											>
												<p class="whitespace-no-wrap">
													{formatMoney(productsGroupedToBill[id].totalOnSalePrice)}
												</p>
											</td>
										</tr>
									{/each}
									{#each Object.keys(returnablesGroupedToBill) as id, index}
										<tr>
											<td
												class="px-4 md:px-8 py-5 border-b border-l border-gray-400
                        bg-white text-sm lg:text-base"
											>
												<div class="items-center">
													<p>{returnablesGroupedToBill[id].name}</p>
													<p class="whitespace-no-wrap block lg:hidden">
														{formatMoney(returnablesGroupedToBill[id].unitWholeSalePrice)}
													</p>
												</div>
											</td>
											<td
												class="px-4 md:px-8 py-5 border-b border-gray-400
                        bg-white text-sm lg:text-base hidden md:table-cell"
											>
												<p class="whitespace-no-wrap">
													{formatMoney(returnablesGroupedToBill[id].unitWholeSalePrice)}
												</p>
											</td>
											<td
												class="px-4 md:px-8 py-5 border-b border-gray-400
                        bg-white text-sm lg:text-base text-center md:text-left"
											>
												<p class="whitespace-no-wrap">{returnablesGroupedToBill[id].quantity}</p>
											</td>
											<td
												class="px-4 md:px-8 py-5 border-b border-gray-400
                        bg-white text-sm lg:text-base text-center md:text-left"
											>
												<p class="whitespace-no-wrap">{returnablesGroupedToBill[id].vat}%</p>
											</td>
											<td
												class="px-4 md:px-8 py-5 border-b border-gray-400
                        bg-white text-sm lg:text-base text-right"
											>
												<p class="whitespace-no-wrap">
													{formatMoney(returnablesGroupedToBill[id].totalWholeSalePrice)}
												</p>
											</td>
											<td
												class="px-4 md:px-8 py-5 border-b border-r border-gray-400
                        bg-white text-sm lg:text-base text-right"
											>
												<p class="whitespace-no-wrap">
													{formatMoney(returnablesGroupedToBill[id].totalOnSalePrice)}
												</p>
											</td>
										</tr>
									{/each}
									<tr>
										<td
											class="border-b border-gray-400 border-l bg-white px-4 md:px-8
                      py-5 text-lg text-right uppercase font-semibold md:hidden table-cell"
											colSpan="5"
										>
											Total HT:
										</td>
										<td
											class="border-b border-gray-400 border-l bg-white px-4 md:px-8
                      py-5 text-lg text-right uppercase font-semibold md:table-cell hidden"
											colSpan="5"
										>
											Total HT:
										</td>
										<td
											class="border-b border-gray-400 bg-white px-4 md:px-8
                      py-5 text-lg text-right font-bold col-span-1 border-r"
											colSpan="1"
										>
											{formatMoney(totalHT)}
										</td>
									</tr>
									<tr>
										<td
											class="border-b border-gray-400 border-l bg-white px-4 md:px-8
                      py-5 text-lg text-right uppercase font-semibold md:hidden table-cell"
											colspan="5"
										>
											Total TVA:
										</td>
										<td
											class="border-b border-gray-400 border-l bg-white px-4 md:px-8
                      py-5 text-lg text-right uppercase font-semibold md:table-cell hidden"
											colspan="5"
										>
											Total TVA:
										</td>
										<td
											class="border-b border-gray-400 bg-white px-4 md:px-8
                      py-5 text-lg text-right font-bold col-span-1 border-r"
											colspan="1"
										>
											{formatMoney(totalTVA)}
										</td>
									</tr>
									<tr>
										<td
											class="border-b border-gray-400 border-l bg-white px-4 md:px-8
                      py-5 text-lg text-right uppercase font-semibold md:hidden table-cell"
											colspan="5"
										>
											Total TTC:
										</td>
										<td
											class="border-b border-gray-400 border-l bg-white px-4 md:px-8
                      py-5 text-lg text-right uppercase font-semibold md:table-cell hidden"
											colspan="5"
										>
											Total TTC:
										</td>
										<td
											class="border-b border-gray-400 bg-white px-4 md:px-8
                      py-5 text-lg text-right font-bold col-span-1 border-r"
											colspan="1"
										>
											{formatMoney(totalTTC)}
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
