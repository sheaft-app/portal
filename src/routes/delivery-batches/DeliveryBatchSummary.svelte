<script>
	import { GET_DELIVERY_BATCH_DETAILS } from "./queries";
	import { onMount, getContext } from "svelte";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";
	import SheaftErrors from "../../services/SheaftErrors";
	import GetRouterInstance from "../../services/SheaftRouter";
	import DeliveryBatchesRoutes from "./routes";
	import Icon from "svelte-awesome";
	import { faEye } from "@fortawesome/free-solid-svg-icons";
	import { denormalizeDeliveryBatchProducts } from "./deliveryBatchForm";
	import DeliveryBatchStatus from "../../enums/DeliveryBatchStatus";
	import format from "date-fns/format";
	import fr from "date-fns/locale/fr";
	import { timeSpanToTime } from "../../helpers/app";

	export let params = {};

	const { query } = getContext("api");
	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();

	let deliveryBatch;
	let isLoading = true;

	onMount(async () => {
		isLoading = true;
		await query({
			query: GET_DELIVERY_BATCH_DETAILS,
			variables: { id: params.id },
			errorsHandler,
			success: (res) => {
				deliveryBatch = {
					...res,
					deliveries: res.deliveries.map((d) => ({
						...d,
						products: denormalizeDeliveryBatchProducts(d.products),
					})),
				};
			},
			error: () => routerInstance.goTo(DeliveryBatchesRoutes.History),
			errorNotification: "Impossible de récupérer l'état de la livraison, retour à l'accueil.",
		});
		isLoading = false;
	});

	const calculateDelivered = (product) =>
		Math.abs(product.productsToDeliver) +
		Math.abs(product.productsInExcess) -
		Math.abs(product.productsBroken) -
		Math.abs(product.productsMissing);
</script>

<TransitionWrapper>
	<PageHeader name="Résumé de la livraison" previousPage={DeliveryBatchesRoutes.History}>
		{#if deliveryBatch?.deliveryFormsUrl}
			<div class="mt-2">
				<a
					target="_blank"
					href={deliveryBatch.deliveryFormsUrl}
					class="btn btn-outline btn-lg"
					style="display: inline-block;"
				>
					<Icon data={faEye} class="mr-2" />
					Voir les bons de livraison
				</a>
			</div>
		{/if}
	</PageHeader>
	<PageBody {errorsHandler} {isLoading}>
		<p class="text-2xl font-semibold">
			{deliveryBatch.name} :
			<span class="uppercase" class:text-primary={deliveryBatch.status == DeliveryBatchStatus.Completed.Value}>
				{DeliveryBatchStatus.label(deliveryBatch.status)}
			</span>
		</p>
		<p>
			planifiée pour le {format(new Date(deliveryBatch.scheduledOn), "PPPP", { locale: fr })}
			à {timeSpanToTime(deliveryBatch.from).hours}h{timeSpanToTime(deliveryBatch.from).minutes == 0
				? "00"
				: timeSpanToTime(deliveryBatch.from).minutes}
		</p>
		<p>complétée le {format(new Date(deliveryBatch.completedOn), "PPPP", { locale: fr })}</p>
		<div class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 mt-3 shadow py-2">
			<div class="text-center">
				<p class="text-green-500 font-semibold text-2xl">{Math.abs(deliveryBatch.productsDeliveredCount)}</p>
				<p>Produits livrés</p>
			</div>
			<div class="text-center">
				<p class="text-orange-500 font-semibold text-2xl">{Math.abs(deliveryBatch.missingProductsCount)}</p>
				<p>Produits manquants</p>
			</div>
			<div class="text-center">
				<p class="text-green-500 font-semibold text-2xl">{Math.abs(deliveryBatch.returnedReturnablesCount)}</p>
				<p>Consignes récupérées</p>
			</div>
		</div>
		{#each deliveryBatch.deliveries as delivery (delivery.id)}
			<div class="px-4 bg-white mb-3 mt-3 rounded-lg shadow py-3">
				<p class="font-semibold text-xl">{delivery.client.name}</p>
				<a target="_blank" href={delivery.deliveryFormUrl} class="btn-link mt-1">
					<Icon data={faEye} class="mr-2" />
					Voir le bon de livraison
				</a>
				<div class="px-0 md:px-5 overflow-x-auto -mx-4 md:-mx-5 md:mb-5 mt-2">
					<div class="flex flex-wrap bg-white w-full lg:w-auto px-4 lg:px-8">
						<div class="w-full">
							<section>
								<div class="-mx-4 lg:-mx-8">
									<table class="min-w-full leading-normal border-t border-gray-400">
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
                            uppercase tracking-wider"
												>
													Attendus
												</th>
												<th
													class="px-4 md:px-8 py-3 border-b border-r border-gray-400
                            bg-gray-100 text-right text-xs font-semibold text-gray-600
                            uppercase tracking-wider"
												>
													Livrés
												</th>
											</tr>
										</thead>
										<tbody>
											{#each delivery.products as product}
												<tr>
													<td
														class="px-4 md:px-8 py-5 border-b border-l border-gray-400
                                bg-white text-sm lg:text-base"
													>
														<div class="items-center">
															<p>{product.name}</p>
														</div>
													</td>
													<td
														class="px-4 md:px-8 py-5 border-b border-gray-400
                                bg-white text-sm lg:text-base"
													>
														<p class="whitespace-no-wrap">
															{product.productsToDeliver}
														</p>
													</td>
													<td
														class="px-4 md:px-8 py-5 border-b border-r border-gray-400
                                                        bg-white text-sm lg:text-base text-right"
													>
														<p class="whitespace-no-wrap">
															{calculateDelivered(product)}
														</p>
													</td>
												</tr>
											{/each}
										</tbody>
									</table>
								</div>
							</section>
						</div>
					</div>
				</div>
				{#if delivery.comment}
					<p>Commentaire : <span class="font-semibold">{delivery.comment}</span></p>
				{/if}
				{#if delivery.returnedReturnablesCount}
					<p>
						Consignes récupérées : <span class="font-semibold"
							>{Math.abs(delivery.returnedReturnablesCount)}</span
						>
					</p>
				{/if}
			</div>
		{/each}
	</PageBody>
</TransitionWrapper>
