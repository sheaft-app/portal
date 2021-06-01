<script>
	import { onMount, getContext } from "svelte";
	import Icon from "svelte-awesome";
	import { format } from "date-fns";
	import fr from "date-fns/locale/fr";
	import DeliveryPickModal from "./../cart/DeliveryPickModal.svelte";
	import { timeSpanToFrenchHour } from "./../../helpers/app.js";
	import { faEdit } from "@fortawesome/free-regular-svg-icons";
	import { faClock, faCircleNotch } from "@fortawesome/free-solid-svg-icons";

	const { open } = getContext("modal");

	export let data = null;
	export let selected = null;
	export let selectedDeliveryHour = null;
	export let isLoading = false;
	export let businessQuickOrderProducts = [];
	export let disabled = false;

	$: oneOptionOnly =
		data && data.deliveries && data.deliveries.length === 1 && data.deliveries[0].deliveryHours.length === 1;

	onMount(() => {
		updateCartProducts();
	});

	const showDeliveryPickModal = () => {
		if (disabled || (selected && selectedDeliveryHour && oneOptionOnly)) {
			return;
		}
		open(DeliveryPickModal, {
			data,
			selected,
			selectedDeliveryHour,
			storeDelivery: true,
			onClose: (pickedDelivery, pickedDeliveryHour) => {
				selected = pickedDelivery;
				selectedDeliveryHour = pickedDeliveryHour;
				updateCartProducts();
			},
		});
	};
	const updateCartProducts = () => {
		let items = businessQuickOrderProducts.sort((a, b) => (a.producer.name > b.producer.name ? 1 : 0));

		if (data && selected && selectedDeliveryHour) {
			// mettre à jour le lieu et l'horaire livraison dans le cartItem
			let newItems = items
				.map((item) => {
					if (item.producer.id === data.id) {
						return {
							...item,
							producer: {
								...item.producer,
								delivery: selected,
								deliveryHour: selectedDeliveryHour,
							},
						};
					} else {
						return item;
					}
				})
				.sort((a, b) => (a.producer.name > b.producer.name ? 1 : 0));

			if (businessQuickOrderProducts.length > 1) {
				businessQuickOrderProducts = newItems;
			}
		}
	};

</script>

{#if isLoading}
	<div class="p-4 bg-gray-100 border-gray-400 border">
		<div class="flex">
			<Icon data={faCircleNotch} spin class="mr-2 w-4" />
			<p class="uppercase font-medium text-xs">Chargement des options de livraison</p>
		</div>
	</div>
{:else}
	{#if data && !selected && !selectedDeliveryHour}
		<div
			id={data.id}
			class="cursor-pointer p-4 bg-gray-100 border border-gray-400"
			class:disabled
			on:click={showDeliveryPickModal}
		>
			<div class="flex text-accent">
				<Icon data={faEdit} class="mr-2 w-4" />
				<p class="uppercase font-medium text-xs">Sélectionner l'horaire et le lieu de récupération</p>
			</div>
		</div>
	{/if}

	{#if !data && !selected && !selectedDeliveryHour && !isLoading}
		<div class="p-4 bg-red-500 text-white border">
			<p>Une erreur est survenue pendant la récupération des informations de livraison du producteur.</p>
			<p>Essayez de rafraîchir la page. Si l'erreur persiste, contactez le service technique.</p>
		</div>
	{/if}
	{#if data && selected && selectedDeliveryHour}
		<div class="p-4 bg-gray-100 border-gray-400 border delivery-picker" class:disabled id={data.id}>
			<div class="block md:flex md:flex-row">
				<div class="flex w-full mt-2 md:mt-0">
					<Icon data={faClock} size=".8" class="mr-2 w-4 mt-1" />
					<p class="uppercase text-sm font-medium">
						{format(new Date(selectedDeliveryHour.expectedDeliveryDate), "PPPP", {
							locale: fr,
						})} <br /> de {`${timeSpanToFrenchHour(selectedDeliveryHour.from)}`}
						à {`${timeSpanToFrenchHour(selectedDeliveryHour.to)}`}
					</p>
				</div>
			</div>
			{#if oneOptionOnly}
				<div class="mt-2">
					<p class="text-gray-600 ml-6 text-xs">Pas d'autre horaire disponible</p>
				</div>
			{:else}
				<div class="flex text-accent mt-2 cursor-pointer" on:click={showDeliveryPickModal}>
					<Icon data={faEdit} class="mr-2 w-4" />
					<p class="uppercase font-medium text-xs">Modifier l'horaire et/ou le lieu de récupération</p>
				</div>
			{/if}
		</div>
	{/if}
{/if}
