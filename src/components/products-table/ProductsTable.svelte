<script>
    import { formatMoney } from "./../../helpers/app";
    import DeliveryKind from "./../../enums/DeliveryKind";
    import DeliveryStatus from "./../../enums/DeliveryStatus";
	import GetRouterInstance from "./../../services/SheaftRouter";
	import { format } from "date-fns";
	import fr from "date-fns/locale/fr";

	import ExpectedDeliveriesRoutes from "./../../routes/expected-deliveries/routes";

	export let delivery = null;
    export let comment = null;
    export let products = [];
    export let returnables = [];
    export let returnedReturnables = [];
    export let showPrepared = false, showDelivered = false;

    export let total = {
        wholeSalePrice: 0,
        vatPrice: 0,
        onSalePrice : 0
    };

    export let deliveryFees = {
        wholeSalePrice: 0,
        vatPrice: 0,
        onSalePrice: 0,
        vat: 20
    };

	const routerInstance = GetRouterInstance();

    const getTotalColSpan = () => {
        if(showPrepared && showDelivered)
            return 5;

        if(showPrepared)
            return 4;

        return 3;
    }
</script>

    {#if comment && comment.length > 0}
        <div class="px-0 md:px-5 overflow-x-auto -mx-4 md:mx-0 bg-white border-t md:border border-gray-400">
            <div class=" px-4 py-5">
                <p class="uppercase font-bold pb-2">Remarques</p>
                <p>{comment}</p>
            </div>
        </div>
    {/if}
    <div class="px-0 md:px-5 overflow-x-auto -mx-4 md:-mx-5 md:mb-5">
			<div class="flex flex-wrap bg-white w-full lg:w-auto px-4 lg:px-8">
				<div class="w-full">
					<section>
						<div class="-mx-4 lg:-mx-8">
							<table class="min-w-full leading-normal border border-gray-400 bg-gray-100">
								<thead>
									<tr class="border-b border-gray-400">
										<th class="px-4 md:px-8 py-3 text-left text-xs tracking-wider font-semibold uppercase">
											Produit
										</th>
										<th class="px-4 md:px-8 py-3 text-left text-xs tracking-wider font-semibold uppercase">
											Qté commandée
										</th>
                                        {#if showPrepared}
                                            <th class="px-4 md:px-8 py-3 text-left text-xs tracking-wider font-semibold uppercase">
                                                Qté préparée
                                            </th>
                                        {/if}
                                        {#if showDelivered}
                                            <th class="px-4 md:px-8 py-3 text-left text-xs tracking-wider font-semibold uppercase">
                                                Qté livrée
                                            </th>
                                        {/if}
										<th class="px-4 md:px-8 py-3 text-left text-xs tracking-widerhidden md:table-cell text-right font-semibold uppercase">
											PU HT
										</th>
										<th class="px-4 md:px-8 py-3 text-left text-xs tracking-wider text-right font-semibold uppercase">
											Total HT
										</th>
										<th class="px-4 md:px-8 py-3 text-left text-xs tracking-wider text-right font-semibold uppercase">
											Total TTC
										</th>
									</tr>
								</thead>
								<tbody>
									{#each products as product}
										<tr class="bg-white text-sm lg:text-base border-b">
											<td class="px-4 md:px-8 py-5">
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
											<td class="px-4 md:px-8 py-5">
												<p class="whitespace-no-wrap">{product.ordered}</p>
											</td>
                                        {#if showPrepared}
											<td class="px-4 md:px-8 py-5">
												<p class="whitespace-no-wrap">{product.prepared}</p>
											</td>
										{/if}
                                        {#if showDelivered}
											<td class="px-4 md:px-8 py-5">
												<p class="whitespace-no-wrap">{product.delivered}</p>
											</td>
										{/if}
											<td class="px-4 md:px-8 py-5 text-right">
												<p class="whitespace-no-wrap">
													{formatMoney(product.unitWholeSalePrice)}
												</p>
											</td>
											<td class="px-4 md:px-8 py-5 text-right">
												<p class="whitespace-no-wrap">
													{formatMoney(product.wholeSalePrice)}
												</p>
											</td>
											<td class="px-4 md:px-8 py-5 text-right">
												<p class="whitespace-no-wrap">
													{formatMoney(product.onSalePrice)}
												</p>
												<small class="whitespace-no-wrap">TVA : {product.vat}%</small>
											</td>
										</tr>
									{/each}
									{#each returnables as returnable}
										<tr class="bg-white text-sm lg:text-base border-b">
											<td class="px-4 md:px-8 py-5">
												<div class="items-center">
													<p>{returnable.name}</p>
													<small>Consignes déposée(s)</small>
													<p class="whitespace-no-wrap block lg:hidden">
														{formatMoney(returnable.unitWholeSalePrice)}
													</p>
												</div>
											</td>
											<td class="px-4 md:px-8 py-5">
												<p class="whitespace-no-wrap">{returnable.ordered}</p>
											</td>
                                        {#if showPrepared}
											<td class="px-4 md:px-8 py-5">
												<p class="whitespace-no-wrap">{returnable.prepared}</p>
											</td>
										{/if}
                                        {#if showDelivered}
											<td class="px-4 md:px-8 py-5">
												<p class="whitespace-no-wrap">{returnable.delivered}</p>
											</td>
										{/if}
											<td class="px-4 md:px-8 py-5 text-right">
												<p class="whitespace-no-wrap">
													{formatMoney(returnable.unitWholeSalePrice)}
												</p>
											</td>
											<td class="px-4 md:px-8 py-5 text-right">
												<p class="whitespace-no-wrap">
													{formatMoney(returnable.wholeSalePrice)}
												</p>
											</td>
											<td class="px-4 md:px-8 py-5 text-right">
												<p class="whitespace-no-wrap">
													{formatMoney(returnable.onSalePrice)}
												</p>
												<p class="whitespace-no-wrap">TVA : {returnable.vat}%</p>
											</td>
										</tr>
									{/each}
									{#each returnedReturnables as returnedReturnable}
										<tr class="bg-white text-sm lg:text-base border-b">
											<td class="px-4 md:px-8 py-5">
												<div class="items-center">
													<p>{returnedReturnable.name}</p>
													<small>Consignes récupérée(s)</small>
													<p class="whitespace-no-wrap block lg:hidden">
														{formatMoney(returnedReturnable.unitWholeSalePrice)}
													</p>
												</div>
											</td>
											<td/>
                                        {#if showPrepared}
											<td/>
                                            {/if}
                                        {#if showDelivered}
											<td class="px-4 md:px-8 py-5">
												<p class="whitespace-no-wrap">{returnedReturnable.delivered}</p>
											</td>
                                            {/if}
											<td class="px-4 md:px-8 py-5 text-right">
												<p class="whitespace-no-wrap">
													{formatMoney(returnedReturnable.unitWholeSalePrice)}
												</p>
											</td>
											<td class="px-4 md:px-8 py-5 text-right">
												<p class="whitespace-no-wrap">
													{formatMoney(returnedReturnable.wholeSalePrice)}
												</p>
											</td>
											<td class="px-4 md:px-8 py-5 text-right">
												<p class="whitespace-no-wrap">
													{formatMoney(returnedReturnable.onSalePrice)}
												</p>
												<p class="whitespace-no-wrap">TVA : {returnedReturnable.vat}%</p>
											</td>
										</tr>
									{/each}

									{#if deliveryFees.wholeSalePrice > 0}
										<tr class="bg-white text-sm lg:text-base border-b">
											<td class="px-4 md:px-8 py-5">
												<div class="items-center">
													<p>Livraison</p>
													<p class="whitespace-no-wrap block lg:hidden">
														{formatMoney(deliveryFees.wholeSalePrice)}
													</p>
												</div>
											</td>
											<td class="px-4 md:px-8 py-5">
												<p class="whitespace-no-wrap">1</p>
                                            </td>
                                        {#if showPrepared}
											<td class="px-4 md:px-8 py-5">
												<p class="whitespace-no-wrap">1</p>
                                            </td>
                                            {/if}
                                        {#if showDelivered}
											<td class="px-4 md:px-8 py-5">
												<p class="whitespace-no-wrap">1</p>
                                            </td>
                                            {/if}
											<td class="px-4 md:px-8 py-5 text-right">
												<p class="whitespace-no-wrap">
													{formatMoney(deliveryFees.wholeSalePrice)}
												</p>
											</td>
											<td class="px-4 md:px-8 py-5 text-right">
												<p class="whitespace-no-wrap">
													{formatMoney(deliveryFees.wholeSalePrice)}
												</p>
											</td>
											<td class="px-4 md:px-8 py-5 text-right">
												<p class="whitespace-no-wrap">
													{formatMoney(deliveryFees.onSalePrice)}
												</p>
												<p class="whitespace-no-wrap">TVA : 20%</p>
											</td>
										</tr>
									{/if}
									{#if delivery && delivery.kind === DeliveryKind.ProducerToStore.Value && delivery.status === DeliveryStatus.Delivered.Value}
										<tr>
											<td colspan={getTotalColSpan() + 2} class="text-lg border-t border-b border-l border-r border-gray-500 bg-white px-4 md:px-8 py-5">
												Cette commande fait partie de la livraison <strong>{delivery.reference}</strong> du <strong>{format(new Date(delivery.deliveredOn ? delivery.deliveredOn : delivery.scheduledOn), "PPPP", { locale: fr })}</strong>.
												Le montant total dépend des quantités réellement livrées, nous vous invitons donc à vous diriger sur le détail de la livraison pour connaitre tous les détails en cliquant <a href="javascript:void(0)" on:click={() => routerInstance.goTo(ExpectedDeliveriesRoutes.Details, {id:delivery.id})}>sur ce lien</a>.
											</td>	
										</tr>
									{:else}
										<tr>
											<td class="md:hidden table-cell" colspan={getTotalColSpan()-1}>
											</td>
											<td class="md:table-cell hidden" colspan={getTotalColSpan()}>
											</td>
											<td class="border-b border-l border-gray-400 bg-white px-4 md:px-8
						py-5 text-lg text-right uppercase font-semibold">
												Total HT:
											</td>
											<td class="border-b border-gray-400 bg-white px-4 md:px-8
						py-5 text-lg text-right font-bold">
												{formatMoney(total.wholeSalePrice + deliveryFees.wholeSalePrice)}
											</td>
										</tr>
										<tr>
											<td class="md:hidden table-cell" colspan={getTotalColSpan()-1}>
											</td>
											<td class="md:table-cell hidden" colspan={getTotalColSpan()}>
											</td>
											<td class="border-b border-l border-gray-400 bg-white px-4 md:px-8
						py-5 text-lg text-right uppercase font-semibold">
												Total TVA:
											</td>
											<td class="border-b border-gray-400 bg-white px-4 md:px-8
						py-5 text-lg text-right font-bold">
												{formatMoney(total.vatPrice + deliveryFees.vatPrice)}
											</td>
										</tr>
										<tr>
											<td class="md:hidden table-cell" colspan={getTotalColSpan()-1}>
											</td>
											<td class="md:table-cell hidden" colspan={getTotalColSpan()}>
											</td>
											<td class="border-b border-l border-gray-400 bg-white px-4 md:px-8
						py-5 text-lg text-right uppercase font-semibold">
												Total TTC:
											</td>
											<td class="border-b border-gray-400 bg-white px-4 md:px-8
						py-5 text-lg text-right font-bold">
												{formatMoney(total.onSalePrice + deliveryFees.onSalePrice)}
											</td>
										</tr>
									{/if}
								</tbody>
							</table>
						</div>
					</section>
				</div>
			</div>
		</div>