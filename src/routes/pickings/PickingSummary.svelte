<script>
	import { GET_PICKING_DETAILS } from "./queries";
	import { onMount, getContext } from "svelte";
	import TransitionWrapper from "../../components/TransitionWrapper.svelte";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";
	import SheaftErrors from "../../services/SheaftErrors";
	import GetRouterInstance from "../../services/SheaftRouter";
	import PickingRoutes from "./routes";
	import Icon from "svelte-awesome";
	import { faEye } from "@fortawesome/free-solid-svg-icons";
	import { denormalizePickingProducts } from "./pickingForm";
	import PickingStatus from "../../enums/PickingStatus";
	import format from "date-fns/format";
	import fr from "date-fns/locale/fr";

	export let params = {};

	const { query } = getContext("api");
	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();

	let picking;
	let isLoading = true;

	onMount(async () => {
		isLoading = true;
		await query({
			query: GET_PICKING_DETAILS,
			variables: { id: params.id },
			errorsHandler,
			success: (res) => {
				picking = {
					...res,
					products: denormalizePickingProducts(res.productsToPrepare, res.preparedProducts),
				};
			},
			error: () => routerInstance.goTo(PickingRoutes.History),
			errorNotification: "Impossible de récupérer l'état de la préparation, retour à l'accueil.",
		});
		isLoading = false;
	});
</script>

<TransitionWrapper>
	<PageHeader name="Résumé de la préparation" previousPage={PickingRoutes.History}>
		{#if picking?.pickingUrl}
			<div class="mt-2">
				<a target="_blank" href={picking.pickingUrl} class="btn btn-outline btn-lg" style="display: inline-block;">
					<Icon data={faEye} class="mr-2" />
					Voir le bon de préparation
				</a>
			</div>
		{/if}
	</PageHeader>
	<PageBody {errorsHandler} {isLoading}>
		<p class="text-2xl font-semibold">
			{picking.name} :
			<span class="uppercase" class:text-primary={picking.status == PickingStatus.Completed.Value}>
				{PickingStatus.label(picking.status)}
			</span>
		</p>
		<p>
			débutée le {format(new Date(picking.startedOn), "PPPP", { locale: fr })}
		</p>
		<p>complétée le {format(new Date(picking.completedOn), "PPPP", { locale: fr })}</p>
		<div class="grid grid-cols-2 md:grid-cols-3 mt-3 shadow py-2 m-auto">
			<div class="text-center">
				<p class="text-green-500 font-semibold text-2xl">{picking.productsToPrepareCount}</p>
				<p>Produits à préparer</p>
			</div>
			<div class="text-center">
				<p class="text-green-500 font-semibold text-2xl">{picking.productsPreparedCount}</p>
				<p>Produits préparés</p>
			</div>
			<div class="text-center">
				<p class="text-green-500 font-semibold text-2xl">{picking.purchaseOrdersCount}</p>
				<p>Commandes</p>
			</div>
		</div>
		{#each picking.products as product (product.id)}
			<div class="px-4 bg-white mb-3 mt-3 rounded-lg shadow py-3">
				<p class="font-semibold text-xl">{product.name}</p>
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
													Client
												</th>
												<th
													class="px-4 md:px-8 py-3 border-b border-gray-400
                            bg-gray-100 text-left text-xs font-semibold text-gray-600
                            uppercase tracking-wider"
												>
													Commandés
												</th>
												<th
													class="px-4 md:px-8 py-3 border-b border-r border-gray-400
                            bg-gray-100 text-right text-xs font-semibold text-gray-600
                            uppercase tracking-wider"
												>
													Préparés
												</th>
											</tr>
										</thead>
										<tbody>
											{#each product.clients as client}
												<tr>
													<td
														class="px-4 md:px-8 py-5 border-b border-l border-gray-400
                                bg-white text-sm lg:text-base"
													>
														<div class="items-center">
															<p>{client.name}</p>
														</div>
													</td>
													<td
														class="px-4 md:px-8 py-5 border-b border-gray-400
                                bg-white text-sm lg:text-base"
													>
														<p class="whitespace-no-wrap">
															{client.expected}
														</p>
													</td>
													<td
														class="px-4 md:px-8 py-5 border-b border-r border-gray-400
                                                        bg-white text-sm lg:text-base text-right"
													>
														<p class="whitespace-no-wrap">
															{client.prepared}
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
			</div>
		{/each}
	</PageBody>
</TransitionWrapper>
