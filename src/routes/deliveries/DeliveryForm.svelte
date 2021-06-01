<script>
	import { onDestroy } from "svelte";
	import Icon from "svelte-awesome";
	import { faPaperPlane, faCircleNotch } from "@fortawesome/free-solid-svg-icons";
	import OpeningHoursContainer from "./../../components/opening-hours/OpeningHoursContainer.svelte";
	import Toggle from "./../../components/controls/Toggle.svelte";
	import { denormalizeOpeningHours, denormalizeClosingDates } from "../../helpers/app";
	import { bindClass } from "../../../vendors/svelte-forms/src/index";
	import ErrorContainer from "./../../components/ErrorContainer.svelte";
	import ClosingDates from "./../../components/ClosingDates.svelte";
	import form from "../../stores/form";
	import { initialValues, validators } from "./deliveryForm";

	export let submit,
		delivery = { ...initialValues };

	(() => (delivery = form.initialize(delivery, validators, initialValues)))();

	onDestroy(async () => {
		await form.destroy();
	});

	delivery.denormalizedDeliveryHours = denormalizeOpeningHours(delivery.deliveryHours);
	delivery.denormalizedClosings = denormalizeClosingDates(delivery.closings);
	delivery.limitOrders = delivery.lockOrderHoursBeforeDelivery != null || delivery.maxPurchaseOrdersPerTimeSlot != null;

	$: if (delivery.limitOrders && !delivery.lockOrderHoursBeforeDelivery) delivery.lockOrderHoursBeforeDelivery = 24;
	$: if (delivery.limitOrders && !delivery.maxPurchaseOrdersPerTimeSlot) delivery.maxPurchaseOrdersPerTimeSlot = 5;

</script>

<!-- svelte-ignore component-name-lowercase -->
<form class="w-full" on:submit|preventDefault={() => form.validateAndSubmit(submit)}>
	<div class="form-control">
		<div class="w-full">
			<label for="grid-name">Nom *</label>
			<input
				bind:value={delivery.name}
				use:bindClass={{ form, name: "name" }}
				class:disabled={$form.isSubmitting}
				disabled={$form.isSubmitting}
				id="grid-name"
				type="text"
				placeholder="ex : Livraison bassin Annecien"
			/>
		</div>
	</div>
	<div class="form-control" style="display: block;">
		<label>Actif</label>
		<Toggle labelPosition="left" disabled={$form.isSubmitting} classNames="ml-1" bind:isChecked={delivery.available} />
	</div>
	<div class="form-control">
		<div class="w-full" use:bindClass={{ form, name: "denormalizedDeliveryHours" }}>
			<label>Horaires de livraison *</label>
			<OpeningHoursContainer bind:openings={delivery.denormalizedDeliveryHours} />
			<ErrorContainer field={$form.fields.deliveryHours} />
		</div>
	</div>
	<hr class="my-5" />
	<div class="form-control">
		<label>Plages de fermeture</label>
		<p class="text-gray-600 mb-2">
			Si cette n'est pas assurée durant certaines périodes de l'année, renseignez les dates pour que les magasins ne
			puissent pas placer de commandes avec livraison sur ces périodes.
		</p>
		<ClosingDates bind:closings={delivery.denormalizedClosings} />
	</div>
	<hr class="my-5" />
	<div class="form-control mt-6" style="display: block;">
		<label>Limiter les commandes</label>
		<Toggle
			labelPosition="left"
			disabled={$form.isSubmitting}
			classNames="ml-1"
			bind:isChecked={delivery.limitOrders}
		/>
	</div>
	{#if delivery.limitOrders}
		<div class="form-control">
			<div class="w-full">
				<span class="mr-1">Autoriser la prise de commandes jusqu'à</span>
				<input
					id="lockOrders"
					type="number"
					style="width: 70px; display: inline-block;"
					bind:value={delivery.lockOrderHoursBeforeDelivery}
				/>
				<span class="ml-1">heures avant l'horaire de livraison.</span>
			</div>
		</div>
		<div class="form-control">
			<div class="w-full">
				<span class="mr-1">Autoriser un maximum de </span>
				<input
					id="maxOrders"
					type="number"
					style="width: 70px; display: inline-block;"
					bind:value={delivery.maxPurchaseOrdersPerTimeSlot}
				/>
				<span class="ml-1">commandes par horaire de livraison.</span>
			</div>
		</div>
	{/if}
	<h3 class="uppercase font-bold mt-6">Automatisations</h3>
	<small
		>Configurez ces composants uniquement si vous êtes en mesure d'assurer un approvisionnement pour le consommateur
		(par exemple, du lait frais, ou si vous avez un stock conséquent)</small
	>
	<div class="form-control mt-3" style="display: block;">
		<label>Accepter automatiquement les nouvelles commandes</label>
		<Toggle
			labelPosition="left"
			disabled={$form.isSubmitting}
			classNames="ml-1"
			bind:isChecked={delivery.autoAcceptRelatedPurchaseOrder}
		/>
	</div>
	<div class="form-control" style="display: block;">
		<label>Marquer automatiquement les commandes acceptées comme terminées</label>
		<Toggle
			labelPosition="left"
			disabled={$form.isSubmitting}
			classNames="ml-1"
			bind:isChecked={delivery.autoCompleteRelatedPurchaseOrder}
		/>
	</div>
	<p class="text-sm mt-5">* champs requis</p>
	<div class="form-control mt-5">
		<button
			type="submit"
			class:disabled={!$form.valid || $form.isSubmitting}
			disabled={$form.isSubmitting}
			class="btn btn-primary btn-xl justify-center w-full md:w-auto"
		>
			<Icon data={$form.isSubmitting ? faCircleNotch : faPaperPlane} class="mr-2 inline" spin={$form.isSubmitting} />
			Valider
		</button>
	</div>
</form>
