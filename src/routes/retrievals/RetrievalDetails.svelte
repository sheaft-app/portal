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
	let retrieval = null;
	let isLoading = true;
	let loadingMessage = "Chargement des informations de votre livraison en cours.";

	onMount(async () => {
		isLoading = true;
		retrieval = await query({
			query: GET_DELIVERY_DETAILS,
			variables: { id: params.id },
			errorsHandler,
			error: () => routerInstance.goTo(DeliveryRoutes.List),
			errorNotification: "La livraison à laquelle vous essayez d'accéder n'est pas disponible.",
		});

		if (retrieval.products) {
			for (let i = 0; i < retrieval.products.length; i++) {
				if (!productsGroupedToBill[retrieval.products[i].productId])
					productsGroupedToBill[retrieval.products[i].productId] = {
						id: retrieval.products[i].productId,
						name: retrieval.products[i].name,
						reference: retrieval.products[i].reference,
						quantity: retrieval.products[i].quantity,
						vat: retrieval.products[i].vat,
						unitWholeSalePrice: retrieval.products[i].unitWholeSalePrice,
						totalWholeSalePrice: retrieval.products[i].totalProductWholeSalePrice,
						totalOnSalePrice: retrieval.products[i].totalProductOnSalePrice,
						totalVatPrice: retrieval.products[i].totalProductVatPrice,
					};
				else {
					productsGroupedToBill[retrieval.products[i].productId].quantity += retrieval.products[i].quantity;
					productsGroupedToBill[retrieval.products[i].productId].totalWholeSalePrice +=
						retrieval.products[i].totalProductWholeSalePrice;
					productsGroupedToBill[retrieval.products[i].productId].totalOnSalePrice +=
						retrieval.products[i].totalProductOnSalePrice;
					productsGroupedToBill[retrieval.products[i].productId].totalVatPrice +=
						retrieval.products[i].totalProductVatPrice;
				}

				if (!retrieval.products[i].isReturnable) continue;

				if (!returnablesGroupedToBill[retrieval.products[i].returnableId])
					returnablesGroupedToBill[retrieval.products[i].returnableId] = {
						id: retrieval.products[i].returnableId,
						name: `${retrieval.products[i].returnableName} (Consignes déposées)`,
						quantity: retrieval.products[i].quantity,
						vat: retrieval.products[i].returnableVat,
						unitWholeSalePrice: retrieval.products[i].returnableWholeSalePrice,
						totalWholeSalePrice: retrieval.products[i].totalReturnableWholeSalePrice,
						totalOnSalePrice: retrieval.products[i].totalReturnableOnSalePrice,
						totalVatPrice: retrieval.products[i].totalReturnableVatPrice,
					};
				else {
					returnablesGroupedToBill[retrieval.products[i].returnableId].quantity += retrieval.products[i].quantity;
					returnablesGroupedToBill[retrieval.products[i].returnableId].totalWholeSalePrice +=
						retrieval.products[i].totalReturnableWholeSalePrice;
					returnablesGroupedToBill[retrieval.products[i].returnableId].totalOnSalePrice +=
						retrieval.products[i].totalReturnableOnSalePrice;
					returnablesGroupedToBill[retrieval.products[i].returnableId].totalVatPrice +=
						retrieval.products[i].totalReturnableVatPrice;
				}
			}
		}

		if (retrieval.returnedReturnables) {
			for (let i = 0; i < retrieval.returnedReturnables.length; i++) {
				if (!returnablesGroupedToBill[retrieval.returnedReturnables[i].id])
					returnablesGroupedToBill[retrieval.returnedReturnables[i].id] = {
						id: retrieval.returnedReturnables[i].id,
						name: `${retrieval.returnedReturnables[i].name} (Consignes récupérées)`,
						quantity: retrieval.returnedReturnables[i].quantity,
						vat: retrieval.returnedReturnables[i].vat,
						unitWholeSalePrice: retrieval.returnedReturnables[i].unitWholeSalePrice,
						totalWholeSalePrice: retrieval.returnedReturnables[i].totalWholeSalePrice,
						totalOnSalePrice: retrieval.returnedReturnables[i].totalOnSalePrice,
						totalVatPrice: retrieval.returnedReturnables[i].totalVatPrice,
					};
				else {
					returnablesGroupedToBill[retrieval.returnedReturnables[i].id].quantity +=
						retrieval.returnedReturnables[i].quantity;
					returnablesGroupedToBill[retrieval.returnedReturnables[i].id].totalWholeSalePrice +=
						retrieval.returnedReturnables[i].totalWholeSalePrice;
					returnablesGroupedToBill[retrieval.returnedReturnables[i].id].totalOnSalePrice +=
						retrieval.returnedReturnables[i].totalOnSalePrice;
					returnablesGroupedToBill[retrieval.returnedReturnables[i].id].totalVatPrice +=
						retrieval.returnedReturnables[i].totalVatPrice;
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

	const markAsRetrieved = () =>
		open(ConfirmRetrievals, {
			retrievals: [retrieval],
			onClose: (res) => {
				if (res.success) routerInstance.goTo(DeliveryRoutes.List);
			},
		});

	onDestroy(() => (retrieval = null));

	$: buttons =
		retrieval && !retrieval.deliveredOn
			? [
					{
						text: "Marquer comme récupérée",
						color: "green",
						click: () => markAsRetrieved(),
					},
			  ]
			: [];
</script>

<TransitionWrapper>
	<PageHeader
		name="Commande {retrieval
			? retrieval.deliveredOn
				? ` récupérée le ${format(new Date(retrieval.deliveredOn), 'P', { locale: fr })}`
				: ` prévue le ${format(new Date(retrieval.scheduledOn), 'P', { locale: fr })}`
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
											{purchaseOrder.reference} ({format(new Date(purchaseOrder.createdOn), "P", { locale: fr })})
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
		{#if retrieval.comment && retrieval.comment.length > 0}
			<div class="px-0 md:px-5 overflow-x-auto -mx-4 md:mx-0 bg-white border-t md:border border-gray-400">
				<div class=" px-4 py-5">
					<p class="uppercase font-bold pb-2">Remarques</p>
					<p>{retrieval.comment}</p>
				</div>
			</div>
		{/if}
	</PageBody>
</TransitionWrapper>
