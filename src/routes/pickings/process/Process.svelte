<!-- liste des produits -->
<script>
	import { onMount, getContext } from "svelte";
	import GetRouterInstance from "./../../../services/SheaftRouter.js";
	import { GET_PICKING_DETAILS } from "../queries";
	import SheaftErrors from "../../../services/SheaftErrors";
	import PickingRoutes from "../routes";
	import TransitionWrapper from "../../../components/TransitionWrapper.svelte";
	import PageHeader from "../../../components/PageHeader.svelte";
	import { denormalizePickingProducts } from "../pickingForm";
	import PageBody from "../../../components/PageBody.svelte";
	import PickingStatus from "../../../enums/PickingStatus.js";

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
			success: (res) => {
				products = denormalizePickingProducts(res.productsToPrepare, res.preparedProducts);

				// la préparation est terminée
				if (res.status !== PickingStatus.Waiting.Value) {
				}
			},
			error: () => routerInstance.goTo(PickingRoutes.List),
			errorNotification: "La préparation à laquelle vous essayez d'accéder n'existe plus.",
		});
		isLoading = false;
	});

	$: buttons =
		picking && picking.status != PickingStatus.Completed.Value
			? [
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
				<p class="text-green-500 mb-2">Cette préparation est maintenant terminée.</p>
			{/if}
			<div>
				{#each products as product}
					<div class="bg-white shadow px-4 py-2 rounded mb-2 flex justify-between flex-wrap">
						<div>
							<p class="text-lg font-semibold">{product.name}</p>
							{#if product.prepared == 0}
								<p>{product.total} à préparer</p>
							{:else if product.prepared > 0 && !product.completed}
								<p>{product.prepared} préparé(s) sur {product.total}</p>
							{:else if product.completed}
								<p>{product.prepared} préparé(s)</p>
							{/if}
						</div>
						<div class="w-full md:w-auto mt-2 md:mt-0">
							{#if [PickingStatus.Waiting.Value, PickingStatus.InProgress.Value].includes(picking.status)}
								<button
									type="button"
									class:btn-outline={product.completed}
									class:btn-accent={!product.completed}
									on:click={routerInstance.goTo(PickingRoutes.ProcessProduct, {
										id: picking.id,
										productId: product.id,
									})}
									class="btn btn-lg"
								>
									{#if product.completed}
										Modifier
									{:else if !product.completed && product.prepared > 0}
										Continuer
									{:else}
										Préparer
									{/if}
								</button>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</PageBody>
</TransitionWrapper>
