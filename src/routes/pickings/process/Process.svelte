<!-- liste des produits -->
<script>
	import { onMount, getContext } from "svelte";
	import GetRouterInstance from "./../../../services/SheaftRouter.js";
	import { GET_BATCHES, GET_PICKING_DETAILS } from "../queries";
	import SheaftErrors from "../../../services/SheaftErrors";
	import PickingRoutes from "../routes";
	import TransitionWrapper from "../../../components/TransitionWrapper.svelte";
	import PageHeader from "../../../components/PageHeader.svelte";
	import { denormalizeProducts } from "../pickingForm";
	import PageBody from "../../../components/PageBody.svelte";
	import PickingStatus from "../../../enums/PickingStatus.js";
	import DeliveryKind from "../../../enums/DeliveryKind.js";
	import DeliveryBatchRoutes from "../../delivery-batches/routes";
	import RetrievalRoutes from "../../retrievals/routes";
	import Icon from "svelte-awesome";
	import { faCheck } from "@fortawesome/free-solid-svg-icons";
	import ProcessProducts from "./ProcessProducts.svelte";

	export let params;

	const { query } = getContext("api");
	const routerInstance = GetRouterInstance();
	const errorsHandler = new SheaftErrors();

	let picking = null;
	let products = [];
	let isLoading = true;
	let loadingMessage = "Chargement des informations de la préparation en cours...";

	onMount(async () => {
		isLoading = true;
		picking = await query({
			query: GET_PICKING_DETAILS,
			variables: { id: params.id },
			errorsHandler,
			success: async (res) => {
				products = denormalizeProducts(res.productsToPrepare, res.preparedProducts);
			},
			error: () => routerInstance.goTo(PickingRoutes.List),
			errorNotification: "La préparation à laquelle vous essayez d'accéder n'existe plus.",
			skipCache: true
		});
		isLoading = false;
	});

	$: buttons =
		picking && picking.status != PickingStatus.Completed.Value
			? [
					{
						text: "Bon de préparation",
						color: "teal",
						click: () =>
							window.open(picking.preparationUrl, "_blank")
					},
					{
						text: "Modifier",
						color: "blue",
						click: () =>
							routerInstance.goTo(PickingRoutes.Edit, {
								id: params.id,
							}),
					},
			  ]
			: [];
</script>

<TransitionWrapper>
	<PageHeader name={picking?.name ?? "Préparation en cours"} previousPage={PickingRoutes.List} {buttons} />
	<PageBody {errorsHandler} {isLoading} noResultsPage={null} loadingMessage="Chargement de la préparation...">
		{#if !isLoading}
			{#if ![PickingStatus.Waiting.Value, PickingStatus.InProgress.Value].includes(picking.status)}
				<div
					class="my-4 py-4 px-3 md:px-8 overflow-x-auto -mx-4 md:mx-0 bg-green-200 shadow
          md:rounded md:mb-2 flex items-center"
				>
					<Icon data={faCheck} style="width: 30px; height:30px;" />
					<div class="ml-3">
						<p>
							<strong>Cette préparation est maintenant terminée.</strong>
						</p>
						{#if picking.purchaseOrders
							.map((p) => p.expectedDelivery.kind)
							.includes(DeliveryKind.ProducerToStore.Value)}
							<p class="my-2">
								Vous pouvez programmer une livraison pour les commandes concernées en <a
									href="javascript:void(0)"
									on:click={() =>
										routerInstance.goTo(DeliveryBatchRoutes.List, { Query: { selectModal: true } })}>cliquant ici</a>.
							</p>
						{/if}
						{#if picking.purchaseOrders.some( (p) => [DeliveryKind.Market.Value, DeliveryKind.Farm.Value, DeliveryKind.Withdrawal.Value, DeliveryKind.Collective.Value].includes(p.expectedDelivery.kind) )}
							<p class="my-2">
								Vous pouvez accéder aux informations de distribution pour les commandes concernées en <a
									href="javascript:void(0)"
									on:click={() => routerInstance.goTo(RetrievalRoutes.List)}>cliquant ici</a>.
							</p>
						{/if}
					</div>
				</div>
			{/if}
			<div class="pt-2">
				<ProcessProducts 
					pickingId={params.id}
					{products}
				/>
			</div>
		{/if}
	</PageBody>
</TransitionWrapper>
