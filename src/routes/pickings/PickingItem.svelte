<script>
	import format from "date-fns/format";
	import fr from "date-fns/locale/fr";
	import GetRouterInstance from "../../services/SheaftRouter";
	import PickingRoutes from "./routes";
	import Icon from "svelte-awesome";
	import { faChevronRight, faEye } from "@fortawesome/free-solid-svg-icons";
	import PickingStatus from "../../enums/PickingStatus";
	import { getContext } from "svelte";
	import StartPickingModal from "./StartPickingModal.svelte";

	export let picking;

	const routerInstance = GetRouterInstance();
	const { open } = getContext("modal");
</script>

<div class="delivery-card rounded-3xl px-4 py-2 bg-white">
	<div
		class="flex justify-between py-2 border-b border-gray-300 flex-wrap flex-col-reverse xl:flex-nowrap xl:flex-row"
	>
		<div class="picking-item-title">
			<p class="font-semibold text-xl">{picking.name}</p>
			{#if picking.status !== PickingStatus.Waiting.Value}
				<p>commencée le {format(new Date(picking.startedOn), "PPPP", { locale: fr })}</p>
			{:else}
				<p>mise à jour le {format(new Date(picking.updatedOn), "PPPP", { locale: fr })}</p>
			{/if}
		</div>
		<div class="flex justify-between xl:justify-end items-top xl:flex-wrap xl:text-right">
			<span class="rounded-full px-4 py-1 text-gray-800 bg-green-200 delivery-status mb-1 xl:mb-0">
				{PickingStatus.label(picking.status)}
			</span>
			{#if picking?.preparationUrl}
				<div class="xl:w-full">
					<a target="_blank" href={picking.preparationUrl} class="btn-link" style="display: inline-block;">
						<Icon data={faEye} class="mr-1" />
						Voir le bon de prépa.
					</a>
				</div>
			{/if}
		</div>
	</div>
	<div class="flex justify-between py-2 w-full">
		<div>
			<p class="text-gray-500">Produits à préparer</p>
			<p class="text-primary text-2xl font-medium">{picking.productsToPrepareCount}</p>
		</div>
		<div>
			<p class="text-gray-500">Produits préparés</p>
			<p class="text-primary text-2xl font-medium">{picking.productsPreparedCount}</p>
		</div>
		<div>
			<p class="text-gray-500">Commandes</p>
			<p class="text-primary text-2xl font-medium">{picking.purchaseOrdersCount}</p>
		</div>
	</div>
	<div class="flex justify-between py-2 items-center flex-wrap md:space-x-4">
		<div class="flex space-x-2 w-full md:w-auto justify-center md:justify-start mt-1 md:mt-0">
			<button
				on:click={() => routerInstance.goTo(PickingRoutes.Edit, { id: picking.id })}
				class="btn btn-lg btn-outline text-lg font-semibold"
				>Modifier
			</button>
			{#if picking.status == PickingStatus.Waiting.Value}
				<button
					on:click={() => open(StartPickingModal, { id: picking.id })}
					class="btn btn-lg btn-accent text-lg font-semibold"
					>Lancer
					<Icon class="ml-2" data={faChevronRight} />
				</button>
			{:else}
				<button
					on:click={() => routerInstance.goTo(PickingRoutes.Process, { id: picking.id })}
					class="btn btn-lg btn-accent text-lg font-semibold"
					>Reprendre
					<Icon class="ml-2" data={faChevronRight} />
				</button>
			{/if}
		</div>
	</div>
</div>

<style>
	@media (min-width: 1280px) {
		.picking-item-title {
			max-width: 190px;
		}
	}

	.delivery-card {
		box-shadow: 0px 0px 30px 0px rgb(0 0 0 / 10%);
		max-width: 500px;
	}

	.delivery-card .delivery-status {
		height: fit-content;
		width: fit-content;
	}
</style>
