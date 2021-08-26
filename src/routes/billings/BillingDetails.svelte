<script>
	import { onMount, onDestroy, getContext } from "svelte";
	import GetRouterInstance from "./../../services/SheaftRouter.js";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import { GET_DELIVERY_DETAILS } from "./queries";
	import DeliveryRoutes from "./routes";
	import SheaftErrors from "../../services/SheaftErrors";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";
	import AccountingRoutes from "./routes";
	import PurchaseOrderRoutes from "./../purchase-orders/routes";
	import MarkDeliveriesAsBilled from "./MarkDeliveriesAsBilled.svelte";
	import { formatMoney } from "../../helpers/app";
	import { format } from "date-fns";
	import fr from "date-fns/locale/fr";
	import { querystring } from "svelte-spa-router";
	import { getPurchaseOrderModel } from "../../helpers/purchaseOrder";

	const errorsHandler = new SheaftErrors();
	const { open } = getContext("modal");
	const { query, mutate } = getContext("api");
	const routerInstance = GetRouterInstance();

	export let params;

	let delivery = null;
	let purchaseOrder = null;
	let isLoading = true;
	let loadingMessage = "Chargement des informations de votre livraison en cours.";

	onMount(async () => {
		await getBilling();
	});

	const getBilling = async () => {
		isLoading = true;
		delivery = await query({
			query: GET_DELIVERY_DETAILS,
			variables: { id: params.id },
			errorsHandler,
			error: () => routerInstance.goTo(DeliveryRoutes.List),
			errorNotification: "La livraison à laquelle vous essayez d'accéder n'est pas disponible.",
			skipCache: routerInstance.shouldSkipCache(),
		});

		purchaseOrder = getPurchaseOrderModel(
			delivery.products,
			delivery.returnedReturnables,
			delivery.deliveryFeesWholeSalePrice,
			delivery.deliveryFeesVatPrice,
			delivery.deliveryFeesOnSalePrice
		);
		isLoading = false;
	};

	const markAsBilled = () =>
		open(MarkDeliveriesAsBilled, {
			deliveries: [delivery],
			onClose: (res) => {
				if (res.success) routerInstance.goTo(DeliveryRoutes.List);
			},
		});

	onDestroy(() => (delivery = null));

	$: getBilling($querystring);

	$: buttons =
		delivery && !delivery.billedOn
			? [
					{
						text: "Archiver",
						color: "green",
						click: () => markAsBilled(),
					},
			  ]
			: [];

	const calculateDelivered = (product) =>
		product.productsToDeliver + product.productsInExcess + product.productsBroken + product.productsMissing;
</script>

<TransitionWrapper>
	<PageHeader
		name="Livraison {delivery && delivery.billedOn
			? ` facturée le ${format(new Date(delivery.billedOn), 'P', { locale: fr })}`
			: 'à facturer'}"
		previousPage={AccountingRoutes.List}
		{buttons}
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
								<span class="text-gray-600">Livrée le :</span>
								{format(new Date(delivery.deliveredOn), "P", { locale: fr })}
							</p>
						</div>
						<p class="text-base mb-2">
							{#if delivery.address}
								<span class="text-gray-600">Adresse :</span>
								<p>{delivery.address.line1}</p>
								{#if delivery.address.line2}
									<p>{delivery.address.line2}</p>
								{/if}
								<p>{delivery.address.zipcode} {delivery.address.city}</p>
							{/if}
						</p>
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
											<a
												href="javascript:void(0)"
												on:click={() =>
													routerInstance.goTo(PurchaseOrderRoutes.Details, {
														id: purchaseOrder.id,
													})}>{purchaseOrder.reference}</a
											>
											({format(new Date(purchaseOrder.createdOn), "P", { locale: fr })})
										</li>
									{/each}
								</ul>
							</div>
						</div>
						<div class="flex items-center mb-2">
							<p>
								<span class="text-gray-600">Produits livrés:</span>
								{delivery.productsDeliveredCount}
							</p>
						</div>
						<div class="flex items-center mb-2">
							<a href={delivery.deliveryFormUrl}>Bon de livraison</a>
						</div>
					</div>
				</div>
				<div
					class="w-full lg:w-2/6 border-b md:border-b-0 border-solid
          border-gray-400 px-4 lg:px-8 py-5"
				>
					<p class="uppercase font-bold pb-2">Client</p>
					<div class="mt-3">
						<div>
							<p class="mb-2">
								<span class="text-gray-600">Nom :</span>
								{delivery.client.name}
							</p>
							<p class="text-base mb-2">
								<span class="text-gray-600">Mail :</span>
								<a href="mailto:{delivery.client.email}">{delivery.client.email}</a>
							</p>
							<p class="text-base mb-2">
								{#if delivery.client.phone}
									<span class="text-gray-600">Tél :</span>
									<a href="tel:{delivery.client.phone}">{delivery.client.phone}</a>
								{/if}
							</p>
							<p class="text-base mb-2">
								{#if delivery.client.address}
									<span class="text-gray-600">Adresse :</span>
									<p>{delivery.client.address.line1}</p>
									{#if delivery.client.address.line2}
										<p>{delivery.client.address.line2}</p>
									{/if}
									<p>{delivery.client.address.zipcode} {delivery.client.address.city}</p>
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
											Qté demandée
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
                        bg-white text-sm lg:text-base hidden md:table-cell"
											>
												<p class="whitespace-no-wrap">
													{formatMoney(product.unitWholeSalePrice)}
												</p>
											</td>
											<td
												class="px-4 md:px-8 py-5 border-b border-gray-400
                        bg-white text-sm lg:text-base text-center md:text-left"
											>
												<p class="whitespace-no-wrap">{product.productsToDeliver}</p>
											</td>
											<td
												class="px-4 md:px-8 py-5 border-b border-gray-400
                        bg-white text-sm lg:text-base text-center md:text-left"
											>
												<p class="whitespace-no-wrap">{calculateDelivered(product)}</p>
											</td>
											<td
												class="px-4 md:px-8 py-5 border-b border-gray-400
                        bg-white text-sm lg:text-base text-right"
											>
												<p class="whitespace-no-wrap">
													{formatMoney(product.totalProductWholeSalePrice)}
												</p>
											</td>
											<td
												class="px-4 md:px-8 py-5 border-b border-r border-gray-400
                        bg-white text-sm lg:text-base text-right"
											>
												<p class="whitespace-no-wrap">
													{formatMoney(product.totalProductOnSalePrice)}
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
													<p class="whitespace-no-wrap block lg:hidden">
														{formatMoney(returnable.unitWholeSalePrice)}
													</p>
												</div>
											</td>
											<td
												class="px-4 md:px-8 py-5 border-b border-gray-400
                        bg-white text-sm lg:text-base hidden md:table-cell"
											>
												<p class="whitespace-no-wrap">
													{formatMoney(returnable.unitWholeSalePrice)}
												</p>
											</td>
											<td
												class="px-4 md:px-8 py-5 border-b border-gray-400
                        bg-white text-sm lg:text-base text-center md:text-left"
											/>
											<td
												class="px-4 md:px-8 py-5 border-b border-gray-400
                        bg-white text-sm lg:text-base text-center md:text-left"
											>
												<p class="whitespace-no-wrap">{returnable.quantity}</p>
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
									{#if purchaseOrder.deliveryFeesWholeSalePrice > 0}
										<tr>
											<td
												class="px-4 md:px-8 py-5 border-b border-l border-gray-400
                        bg-white text-sm lg:text-base"
											>
												<div class="items-center">
													<p>Livraison</p>
													<p class="whitespace-no-wrap block lg:hidden">
														{formatMoney(purchaseOrder.deliveryFeesWholeSalePrice)}
													</p>
												</div>
											</td>
											<td
												class="px-4 md:px-8 py-5 border-b border-gray-400
                        bg-white text-sm lg:text-base hidden md:table-cell"
											>
												<p class="whitespace-no-wrap">
													{formatMoney(purchaseOrder.deliveryFeesWholeSalePrice)}
												</p>
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
												<p class="whitespace-no-wrap">1</p>
											</td>
											<td
												class="px-4 md:px-8 py-5 border-b border-gray-400
                        bg-white text-sm lg:text-base text-right"
											>
												<p class="whitespace-no-wrap">
													{formatMoney(purchaseOrder.deliveryFeesWholeSalePrice)}
												</p>
											</td>
											<td
												class="px-4 md:px-8 py-5 border-b border-r border-gray-400
                        bg-white text-sm lg:text-base text-right"
											>
												<p class="whitespace-no-wrap">
													{formatMoney(purchaseOrder.deliveryFeesOnSalePrice)}
												</p>
												<p class="whitespace-no-wrap">TVA : 20%</p>
											</td>
										</tr>
									{/if}
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
											{formatMoney(purchaseOrder.totalWholeSalePrice)}
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
											{formatMoney(purchaseOrder.totalVatPrice)}
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
											{formatMoney(purchaseOrder.totalOnSalePrice)}
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
