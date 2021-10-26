<script>
	import Icon from "svelte-awesome";
	import { faPaperPlane, faCircleNotch } from "@fortawesome/free-solid-svg-icons";
	import CitySearch from "./../../components/search/CitySearch.svelte";
	import OpeningHoursContainer from "./../../components/opening-hours/OpeningHoursContainer.svelte";
	import Toggle from "./../../components/controls/Toggle.svelte";
	import { denormalizeOpeningHours, denormalizeClosingDates, getNextAvailableDateFromDay } from "./../../helpers/app";
	import { bindClass } from "../../../vendors/svelte-forms/src/index";
	import ErrorContainer from "./../../components/ErrorContainer.svelte";
	import ClosingDates from "./../../components/ClosingDates.svelte";
	import form from "../../stores/form";
	import { validators, initialValues } from "./sellingPointForm";
	import { onDestroy } from "svelte";
	import InputCheckbox from "../../components/controls/InputCheckbox.svelte";
	import { format } from "date-fns";
	import fr from "date-fns/locale/fr";

	export let submit,
		sellingPoint = { ...initialValues };

	(() => (sellingPoint = form.initialize(sellingPoint, validators, initialValues)))();

	onDestroy(async () => {
		await form.destroy();
	});

	sellingPoint.denormalizedDeliveryHours = denormalizeOpeningHours(sellingPoint.deliveryHours);
	sellingPoint.denormalizedClosings = denormalizeClosingDates(sellingPoint.closings);
	sellingPoint.limitOrdersBefore = sellingPoint.lockOrderHoursBeforeDelivery != null;
	sellingPoint.limitOrdersCount = sellingPoint.maxPurchaseOrdersPerTimeSlot != null;

	$: lastOrderingDay = () => {
		let orderingDay = firstSelectedOrderingDay();
		if (!orderingDay) return null;

		return new Date(firstSelectedOrderingDay().getTime() - sellingPoint.lockOrderHoursBeforeDelivery * 60 * 60 * 1000);
	};

	$: firstSelectedOrderingDay = () => {
		if (!sellingPoint.denormalizedDeliveryHours || sellingPoint.denormalizedDeliveryHours.length < 1) return null;

		let firstSelectedDay = null;
		for(let i = 0; i < sellingPoint.denormalizedDeliveryHours.length; i++){
		 	firstSelectedDay = sellingPoint.denormalizedDeliveryHours[i].days?.find((d) => d.checked);
			 
			if(firstSelectedDay)
				break;
		}

		if(!firstSelectedDay)
			return null;
			
		return new Date(
			getNextAvailableDateFromDay(firstSelectedDay.Index, sellingPoint.denormalizedDeliveryHours[0].start)
		);
	};
</script>

<!-- svelte-ignore component-name-lowercase -->
<form class="w-full pb-5" on:submit|preventDefault={() => form.validateAndSubmit(submit)}>
	<div class="flex flex-wrap mb-6 lg:mb-0">
		<div class="w-full">
			<div class="form-control">
				<div class="w-full">
					<label for="grid-name">Nom *</label>
					<input
						bind:value={sellingPoint.name}
						class:disabled={$form.isSubmitting}
						disabled={$form.isSubmitting}
						id="grid-name"
						type="text"
						placeholder="ex : Marché d'Annecy (vieille ville)"
					/>
				</div>
			</div>
			<div class="form-control">
				<label>Type de point de vente *</label>
				<div class="w-full justify-center button-group" use:bindClass={{ form, name: "kind" }}>
					<button
						on:click={() => (sellingPoint.kind = "MARKET")}
						type="button"
						disabled={$form.isSubmitting}
						class:selected={sellingPoint.kind === "MARKET"}
						class:disabled={$form.isSubmitting}
					>
						Marché ouvert
					</button>
					<button
						on:click={() => (sellingPoint.kind = "FARM")}
						type="button"
						disabled={$form.isSubmitting}
						class:selected={sellingPoint.kind === "FARM"}
						class:disabled={$form.isSubmitting}
					>
						Site de production
					</button>
					<button
						on:click={() => (sellingPoint.kind = "COLLECTIVE")}
						type="button"
						disabled={$form.isSubmitting}
						class:selected={sellingPoint.kind === "COLLECTIVE"}
						class:disabled={$form.isSubmitting}
					>
						Magasin de producteurs
					</button>
				</div>
				<ErrorContainer field={$form.fields.kind} />
			</div>
			<div class="form-control w-full" style="display: block;">
				<label>Adresse *</label>
				<CitySearch
					invalid={$form && $form.fields.address
						? !$form.fields.address.valid && $form.fields.address.dirty
						: false}
					bind:selectedAddress={sellingPoint.address}
					bindClassData={{ form, name: "address" }}
				/>
				<ErrorContainer field={$form.fields.address} />
			</div>
			<div class="form-control" style="display: block;">
				<label>Actif</label>
				<Toggle
					labelPosition="left"
					disabled={$form.isSubmitting}
					classNames="ml-1"
					bind:isChecked={sellingPoint.available}
				/>
			</div>
			<div class="form-control">
				<div class="w-full" use:bindClass={{ form, name: "openings" }}>
					<label>Horaires de vente *</label>
					<OpeningHoursContainer bind:openings={sellingPoint.denormalizedDeliveryHours} />
					<ErrorContainer field={$form.fields.openings} />
				</div>
			</div>
			<hr class="my-5" />
			<div class="form-control">
				<label>Plages de fermeture</label>
				<p class="text-gray-600 mb-2">
					Si ce point de vente est fermé durant certaines périodes de l'année, renseignez les dates pour que
					vos clients ne puissent pas placer de commandes avec retrait sur ces périodes.
				</p>
				<ClosingDates bind:closings={sellingPoint.denormalizedClosings} />
			</div>
			<hr class="my-5" />

			<div class="form-control">
				<div class="w-full mt-5">
					<label>Limitations</label>
				</div>
			</div>
			<div class="form-control">
				<div class="w-full">
					<InputCheckbox
						checked={sellingPoint.limitOrdersBefore}
						onClick={() => (sellingPoint.limitOrdersBefore = !sellingPoint.limitOrdersBefore)}
					/>
					<span class="mr-1">Autoriser la prise de commandes jusqu'à</span>
					{#if sellingPoint.limitOrdersBefore}
						<input
							id="lockOrders"
							type="number"
							style="width: 80px; display: inline-block;"
							bind:value={sellingPoint.lockOrderHoursBeforeDelivery}
						/>
					{:else}
						x
					{/if}
					<span class="ml-1">heures avant la distribution</span>
					{#if sellingPoint.limitOrdersBefore && lastOrderingDay()}
						<strong
							>(soit avant le {format(lastOrderingDay(), "EEEE H", { locale: fr })}h si la distribution a lieu le {format(
								firstSelectedOrderingDay(),
								"EEEE à H",
								{ locale: fr }
							)}h)</strong>
					{/if}
				</div>
			</div>
			<div class="form-control">
				<div class="w-full">
					<InputCheckbox
						checked={sellingPoint.limitOrdersCount}
						onClick={() => (sellingPoint.limitOrdersCount = !sellingPoint.limitOrdersCount)}
					/>
					<span class="mr-1">Autoriser un maximum de </span>
					{#if sellingPoint.limitOrdersCount}
						<input
							id="maxOrders"
							type="number"
							style="width: 80px; display: inline-block;"
							bind:value={sellingPoint.maxPurchaseOrdersPerTimeSlot}
						/>
					{:else}
						x
					{/if}
					<span class="ml-1">commandes par distribution.</span>
				</div>
			</div>
			<div class="form-control">
				<div class="w-full mt-5">
					<label>Automatisations</label>
				</div>
			</div>
			<div class="form-control mt-3" style="display: block;">
				<InputCheckbox
					checked={sellingPoint.autoAcceptRelatedPurchaseOrder}
					onClick={() =>
						(sellingPoint.autoAcceptRelatedPurchaseOrder = !sellingPoint.autoAcceptRelatedPurchaseOrder)}
				/>
				<span class="mr-1"
					>Accepter automatiquement les nouvelles commandes (les commandes non acceptées dans un délais de 72h
					sont automatiquement refusées)</span
				>
			</div>
			<p class="text-sm mt-5">* champs requis</p>
			<div class="form-control mt-5 mb-5">
				<button
					type="submit"
					class:disabled={$form.isSubmitting || !$form.valid}
					class="btn btn-primary btn-xl justify-center w-full md:w-auto"
				>
					<Icon
						data={$form.isSubmitting ? faCircleNotch : faPaperPlane}
						class="mr-2 inline"
						spin={$form.isSubmitting}
					/>
					Valider
				</button>
			</div>
		</div>
	</div>
</form>
