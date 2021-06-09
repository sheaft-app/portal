<script>
	import DayOfWeekKind from "./../../enums/DayOfWeekKind.js";
	import { onMount, getContext } from "svelte";
	import { GET_DELIVERIES } from "./queries";
	import Loader from "./../../components/Loader.svelte";
	import GetRouterInstance from "./../../services/SheaftRouter.js";
	import { timeSpanToFrenchHour } from "./../../helpers/app";
	import DeliveryRoutes from "./../deliveries/routes";

	const { query } = getContext("api");
	const routerInstance = GetRouterInstance();

	let deliveries = [];
	let isLoading = true;

	export let selectedDelivery = null,
		errorsHandler;

	onMount(async () => {
		deliveries = await query({
			query: GET_DELIVERIES,
			errorsHandler,
			errorNotification: "Impossible de récupérer les informations des créneaux.",
		});
		isLoading = false;
	});

	const getFormattedSelectedHours = (selectedHours) => {
		if (!selectedHours || selectedHours.length < 1) return "Aucun horaire configuré";

		if (selectedHours.length == 1) {
			return getFormattedSelectedHour(selectedHours[0]);
		}

		let hours = "<br/>";
		for (let i = 0; i < selectedHours.length; i++) {
			hours += getFormattedSelectedHour(selectedHours[i]) + "<br/>";
		}
		return hours;
	};

	const getFormattedSelectedHour = (selectedHour) =>
		`Le ${DayOfWeekKind.label(selectedHour.day).toLowerCase()} entre ${timeSpanToFrenchHour(
			selectedHour.from
		)} et ${timeSpanToFrenchHour(selectedHour.to)}`;
</script>

<div class="form-control mt-2" style="display: block;">
	<div class="mb-2">
		<label>Quelle livraison souhaitez-vous proposer à ce magasin ?</label>
	</div>
	{#if isLoading}
		<Loader />
	{:else if deliveries && deliveries.length < 1}
		<p>Vous devez renseigner vos créneaux de livraisons pour accepter un partenariat.</p>
		<button class="btn btn-accent btn-lg" on:click={() => routerInstance.goTo(DeliveryRoutes.List)}
			>Renseigner mes livraisons
		</button>
	{:else if deliveries && deliveries.length > 0}
		{#each deliveries as delivery}
			<div
				class:active={selectedDelivery && selectedDelivery.id == delivery.id}
				on:click={() => (selectedDelivery = delivery)}
				class="mb-2 cursor-pointer hover:bg-gray-100 shadow px-3 py-2 bg-white rounded"
			>
				<b>{delivery.name}</b> : {@html getFormattedSelectedHours(delivery.deliveryHours)}
			</div>
		{/each}
	{/if}
</div>

<style lang="scss">
	.active {
		@apply bg-accent;
		@apply text-white;

		&:hover {
			@apply bg-accent;
			@apply text-white;
		}
	}
</style>
