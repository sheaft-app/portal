<script>
	import Icon from "svelte-awesome";
	import { faPaperPlane, faCircleNotch } from "@fortawesome/free-solid-svg-icons";
	import CitySearch from "./../../components/search/CitySearch.svelte";
	import OpeningHoursContainer from "./../../components/opening-hours/OpeningHoursContainer.svelte";
	import Toggle from "./../../components/controls/Toggle.svelte";
	import { denormalizeOpeningHours, denormalizeClosingDates } from "./../../helpers/app";
	import { bindClass } from "../../../vendors/svelte-forms/src/index";
	import ErrorContainer from "./../../components/ErrorContainer.svelte";
	import ClosingDates from "./../../components/ClosingDates.svelte";
	import form from "../../stores/form";
	import { validators, initialValues } from "./sellingPointForm";
	import { onDestroy } from "svelte";

	export let submit, sellingPoint = { ...initialValues };

	(() => sellingPoint = form.initialize(sellingPoint, validators, initialValues))();

	onDestroy(async () => {
		await form.destroy();
	});

	sellingPoint.denormalizedDeliveryHours = denormalizeOpeningHours(sellingPoint.deliveryHours);
	sellingPoint.denormalizedClosings = denormalizeClosingDates(sellingPoint.closings);
	sellingPoint.limitOrders = sellingPoint.lockOrderHoursBeforeDelivery != null || sellingPoint.maxPurchaseOrdersPerTimeSlot != null;

	$: if (sellingPoint.limitOrders && !sellingPoint.lockOrderHoursBeforeDelivery) sellingPoint.lockOrderHoursBeforeDelivery = 24;
	$: if (sellingPoint.limitOrders && !sellingPoint.maxPurchaseOrdersPerTimeSlot) sellingPoint.maxPurchaseOrdersPerTimeSlot = 5;
</script>

<!-- svelte-ignore component-name-lowercase -->
<form class="w-full pb-5" on:submit|preventDefault={() => form.validateAndSubmit(submit)}>
	<div class="flex flex-wrap mb-6 lg:mb-0">
		<div class="w-full lg:w-1/2">
			<div class="form-control">
				<div class="w-full">
					<label for="grid-name">Nom *</label>
					<input
						bind:value={sellingPoint.name}
						class:disabled={$form.isSubmitting}
						disabled={$form.isSubmitting}
						id="grid-name"
						type="text"
						placeholder="ex : Marché d'Annecy (vieille ville)" />
				</div>
			</div>
			<div class="form-control">
				<label>Type de point de vente *</label>
				<div
					class="w-full justify-center button-group"
					use:bindClass={{ form, name: 'kind' }}>
					<button
						on:click={() => sellingPoint.kind = 'MARKET'}
						type="button"
						disabled={$form.isSubmitting}
						class:selected={sellingPoint.kind === 'MARKET'}
						class:disabled={$form.isSubmitting}>
						Marché ouvert
					</button>
					<button
						on:click={() => sellingPoint.kind = 'FARM'}
						type="button"
						disabled={$form.isSubmitting}
						class:selected={sellingPoint.kind === 'FARM'}
						class:disabled={$form.isSubmitting}>
						Site de production
					</button>
					<button
						on:click={() => sellingPoint.kind = 'COLLECTIVE'}
						type="button"
						disabled={$form.isSubmitting}
						class:selected={sellingPoint.kind === 'COLLECTIVE'}
						class:disabled={$form.isSubmitting}>
						Magasin de producteurs
					</button>
				</div>
				<ErrorContainer field={$form.fields.kind} />
			</div>
			<div class="form-control w-full" style="display: block;">
				<label>Adresse *</label>
				<CitySearch
					invalid={$form && $form.fields.address ? !$form.fields.address.valid && $form.fields.address.dirty : false}
					bind:selectedAddress={sellingPoint.address}
					bindClassData={{ form, name: 'address' }} />
				<ErrorContainer field={$form.fields.address} />
			</div>
			<div class="form-control" style="display: block;">
				<label>Actif</label>
				<Toggle
					labelPosition="left"
					disabled={$form.isSubmitting}
					classNames="ml-1"
					bind:isChecked={sellingPoint.available}>
				</Toggle>
			</div>
			<div class="form-control">
				<div
					class="w-full"
					use:bindClass={{ form, name: 'openings' }}>
					<label>Horaires de vente *</label>
					<OpeningHoursContainer bind:openings={sellingPoint.denormalizedDeliveryHours} />
					<ErrorContainer field={$form.fields.openings} />
				</div>
			</div>
			<hr class="my-5" />
			<div class="form-control">
				<label>Plages de fermeture</label>
				<p class="text-gray-600 mb-2">Si ce point de vente est fermé durant certaines périodes de l'année, renseignez les dates pour que vos clients ne puissent pas placer de commandes avec retrait sur ces périodes.</p>
				<ClosingDates bind:closings={sellingPoint.denormalizedClosings} />
			</div>
			<hr class="my-5" />
      		<div class="form-control mt-6" style="display: block;">
				<label>Limiter les commandes</label>
				<Toggle
					labelPosition="left"
					disabled={$form.isSubmitting}
					classNames="ml-1"
					bind:isChecked={sellingPoint.limitOrders} />
			</div>
			{#if sellingPoint.limitOrders}
				<div class="form-control">
					<div class="w-full">
            <span class="mr-1">Autoriser la prise de commandes jusqu'à</span>
            <input id="lockOrders" type="number" style="width: 70px; display: inline-block;" bind:value={sellingPoint.lockOrderHoursBeforeDelivery}>
            <span class="ml-1">heures avant l'horaire de vente.</span>
					</div>
				</div>
				<div class="form-control">
					<div class="w-full">
            <span class="mr-1">Autoriser un maximum de </span>
            <input id="maxOrders" type="number" style="width: 70px; display: inline-block;" bind:value={sellingPoint.maxPurchaseOrdersPerTimeSlot}>
            <span class="ml-1">commandes par horaire de vente.</span>
					</div>
				</div>
			{/if}
			<h3 class="uppercase font-bold mt-6">Automatisations</h3>
			<small>Configurez ces composants uniquement si vous êtes en mesure
				d'assurer un approvisionnement pour le consommateur (par exemple, du
				lait frais, ou si vous avez un stock conséquent)</small>
			<div class="form-control mt-3" style="display: block;">
				<label>Accepter automatiquement les nouvelles commandes</label>
				<Toggle
					labelPosition="left"
					disabled={$form.isSubmitting}
					classNames="ml-1"
					bind:isChecked={sellingPoint.autoAcceptRelatedPurchaseOrder} />
			</div>
			<div class="form-control" style="display: block;">
				<label>Marquer automatiquement les commandes acceptées comme terminées</label>
				<Toggle
					labelPosition="left"
					disabled={$form.isSubmitting}
					classNames="ml-1"
					bind:isChecked={sellingPoint.autoCompleteRelatedPurchaseOrder} />
			</div>
		</div>
	</div>
	<p class="text-sm mt-5">* champs requis</p>
	<div class="form-control mt-5 mb-5">
		<button
			type="submit"
			class:disabled={$form.isSubmitting || !$form.valid}
			class="btn btn-primary btn-xl justify-center w-full md:w-auto">
			<Icon
				data={$form.isSubmitting ? faCircleNotch : faPaperPlane}
				class="mr-2 inline"
				spin={$form.isSubmitting} />
			Valider
		</button>
	</div>
</form>
