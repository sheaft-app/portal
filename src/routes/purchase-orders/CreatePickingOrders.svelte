<script>
	import DatePickerWrapper from "./../../components/controls/DatePickerWrapper.svelte";
	import { faCheck } from "@fortawesome/free-solid-svg-icons";
	import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
	import { EXPORT_PICKING_FROM_ORDERS } from "./mutations.js";
	import GetAuthInstance from "./../../services/SheaftAuth.js";
	import SheaftErrors from "./../../services/SheaftErrors";
	import { GET_ORDERS } from "./queries";
	import { getContext } from "svelte";

	export let onClose, close, purchaseOrders;

	const errorsHandler = new SheaftErrors();
	const { mutate } = getContext("api");

	let date = new Date(),
		moment = null,
		dateChosen = false;
	let purchaseOrderIds = purchaseOrders.map((object, key) => {
		return object.id;
	});
	let isLoading = false;

	let name = null;

	$: dateSelectionRequired = purchaseOrders.filter((o) => !o.expectedDelivery.expectedDeliveryDate).length > 0;

	$: valid = !dateSelectionRequired || (dateSelectionRequired && dateChosen !== false && moment !== null);

	function getStatus(order) {
		switch (order.status) {
			case "WAITING":
				return "En attente";
			case "ACCEPTED":
				return "Acceptée";
			case "PROCESSING":
				return "En préparation";
			default:
				return "";
		}
	}

	const getUser = (order) => (GetAuthInstance().isInRole(["PRODUCER"]) ? order.sender : order.vendor);

	async function submit() {
		isLoading = true;
		await mutate({
			mutation: EXPORT_PICKING_FROM_ORDERS,
			variables: { purchaseOrderIds, name },
			errorsHandler,
			success: async (res) => closeModal(res),
			successNotification: "Votre demande de création d'un bon a bien été prise en compte.",
			errorNotification: "Impossible de faire la demande d'un bon.",
			clearCache: [GET_ORDERS],
		});
		isLoading = false;
	}

	async function closeModal(res) {
		close();
		await onClose(res);
	}

</script>

<ActionConfirm
	{errorsHandler}
	title="Créer un bon de préparation"
	{submit}
	{isLoading}
	{close}
	submitText="Préparer"
	icon={faCheck}
	{valid}
	closeText="Fermer"
>
	<p class="py-2 leading-5">Voici les commandes qui vont être regroupées sur un même bon de préparation</p>
	<ul class="py-2 list-inside list-disc">
		{#each purchaseOrders as order}
			<li>
				{getUser(order).name + " - " + order.reference + " : " + getStatus(order)}
			</li>
		{/each}
	</ul>
	<div>
		<p class="py-2 leading-5">
			Vous pouvez spécifier un nom pour la création du bon de préparation pour faciliter son suivi dans le module dédié.
		</p>
		<input type="text" bind:value={name} placeholder="Nom du traitement (optionnel)" />
	</div>
	{#if dateSelectionRequired}
		<div class="py-2">
			<p class="leading-5">
				Certaines des commandes sélectionnées n'ont pas encore été acceptées, veuillez sélectionner une date de
				livraison estimée pour celles-ci.
			</p>
			<p class="py-2 leading-5">Les clients seront automatiquement notifiés de cette information.</p>
			<form>
				<div class="mt-2" style="width: fit-content;">
					<label
						class="block uppercase tracking-wide text-xs font-bold
            mb-2"
						for="grid-delivery"
					>
						Date de livraison *
					</label>
					<DatePickerWrapper bind:iso={date} bind:dateChosen />
				</div>
				<div class="mt-5 sm:mt-3 mb-2">
					<label
						class="block uppercase tracking-wide text-xs font-bold
            mb-2"
						for="grid-delivery"
					>
						Moment de la journée *
					</label>
					<div class="inline-flex shadow" style="width: 50%;">
						<button
							on:click={() => (moment = "am")}
							type="button"
							class:selected={moment === "am"}
							class="bg-white hover:bg-gray-100 border-r border-gray-400
              border-solid py-2 px-4 rounded-l transition
              duration-200 w-full ease-in-out"
						>
							Matin
						</button>
						<button
							on:click={() => (moment = "pm")}
							type="button"
							class:selected={moment === "pm"}
							class="bg-white hover:bg-gray-100 py-2 px-4
              rounded-r transition duration-200 w-full ease-in-out"
						>
							Après-midi
						</button>
					</div>
				</div>
			</form>
		</div>
	{/if}
</ActionConfirm>

<style lang="scss">
	button {
		&.selected {
			background-color: #ff4081;
			color: #ffffff;
		}
	}

</style>
