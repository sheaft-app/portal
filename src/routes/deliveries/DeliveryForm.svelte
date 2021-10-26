<script>
	import { onDestroy } from "svelte";
	import Icon from "svelte-awesome";
	import { faPaperPlane, faCircleNotch } from "@fortawesome/free-solid-svg-icons";
	import OpeningHoursContainer from "./../../components/opening-hours/OpeningHoursContainer.svelte";
	import Toggle from "./../../components/controls/Toggle.svelte";
	import { bindClass } from "../../../vendors/svelte-forms/src/index";
	import ErrorContainer from "./../../components/ErrorContainer.svelte";
	import ClosingDates from "./../../components/ClosingDates.svelte";
	import form from "../../stores/form";
	import { initialValues, validators } from "./deliveryForm";
	import SortList from "../../components/SortList.svelte";
	import SimpleStoreCard from "./SimpleStoreCard.svelte";
	import InputCheckbox from "../../components/controls/InputCheckbox.svelte";
	import DeliveryFeesApplication from "../../enums/DeliveryFeesApplication";
	import { format } from "date-fns";
	import fr from "date-fns/locale/fr";
import { getNextAvailableDateFromDay } from "../../helpers/app";

	export let submit,
		delivery = { ...initialValues };

	(() => (delivery = form.initialize(delivery, validators, initialValues)))();

	onDestroy(async () => await form.destroy());

	$: lastOrderingDay = () => {
		let orderingDay = firstSelectedOrderingDay();
		if (!orderingDay) return null;

		return new Date(firstSelectedOrderingDay().getTime() - delivery.lockOrderHoursBeforeDelivery * 60 * 60 * 1000);
	};

	$: firstSelectedOrderingDay = () => {
		if (!delivery.denormalizedDeliveryHours || delivery.denormalizedDeliveryHours.length < 1) return null;

		let firstSelectedDay = null;
		for(let i = 0; i < delivery.denormalizedDeliveryHours.length; i++){
		 	firstSelectedDay = delivery.denormalizedDeliveryHours[i].days.find((d) => d.checked);
			 
			if(firstSelectedDay)
				break;
		}

		if(!firstSelectedDay)
			return null;

		return new Date(
			getNextAvailableDateFromDay(firstSelectedDay.Index, delivery.denormalizedDeliveryHours[0].start)
		);
	};
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
		<Toggle
			labelPosition="left"
			disabled={$form.isSubmitting}
			classNames="ml-1"
			bind:isChecked={delivery.available}
		/>
	</div>
	<div class="form-control">
		<div class="w-full" use:bindClass={{ form, name: "openings" }}>
			<label>Horaires de livraison *</label>
			<OpeningHoursContainer bind:openings={delivery.denormalizedDeliveryHours} />
			<ErrorContainer field={$form.fields.openings} />
		</div>
	</div>
	<hr class="my-5" />
	<div class="form-control">
		<label>Plages de fermeture</label>
		<p class="text-gray-600 mb-2">
			Si ce créneau n'est pas assuré durant certaines périodes de l'année, renseignez les dates pour que les
			magasins ne puissent pas placer de commandes avec livraison sur ces périodes.
		</p>
		<ClosingDates bind:closings={delivery.denormalizedClosings} />
	</div>
	{#if delivery.agreements.length > 1}
		<hr class="my-5" />
		<div class="form-control">
			<label>Ordre de livraison des magasins</label>
			<p class="text-gray-600 mb-2">
				C'est l'ordre par défaut dans lequel nous classons les magasins dans vos tournées. Vous pourrez toujours
				modifier l'ordre avant chaque tournée si cas exceptionnel. Attrapez le bloc d'un magasin pour le faire
				glisser dans la liste.
			</p>
			<SortList bind:data={delivery.agreements} component={SimpleStoreCard} />
		</div>
	{/if}
	<hr class="my-5" />
	<div class="form-control">
		<div class="w-full mt-5">
			<label>Limitations</label>
		</div>
	</div>
	<div class="form-control">
		<div class="w-full">
			<InputCheckbox
				checked={delivery.limitOrdersAmount}
				onClick={() => (delivery.limitOrdersAmount = !delivery.limitOrdersAmount)}
			/>
			<span class="mr-1">Autoriser uniquement les commandes d'un montant supérieur ou égal à</span>
			{#if delivery.limitOrdersAmount}
				<input
					id="refuseOrders"
					type="number"
					style="width: 80px; display: inline-block;"
					bind:value={delivery.acceptPurchaseOrdersWithAmountGreaterThan}
				/>
			{:else}
				x
			{/if}
			<span class="ml-1">€ HT</span>
		</div>
	</div>
	<div class="form-control">
		<div class="w-full">
			<InputCheckbox
				checked={delivery.limitOrdersBefore}
				onClick={() => (delivery.limitOrdersBefore = !delivery.limitOrdersBefore)}
			/>
			<span class="mr-1">Autoriser la prise de commandes jusqu'à</span>
			{#if delivery.limitOrdersBefore}
				<input
					id="lockOrders"
					type="number"
					style="width: 80px; display: inline-block;"
					bind:value={delivery.lockOrderHoursBeforeDelivery}
				/>
			{:else}
				x
			{/if}
			<span class="ml-1">heures avant la livraison </span>
			{#if delivery.limitOrdersBefore && lastOrderingDay()}
				<strong
					>(soit avant le {format(lastOrderingDay(), "EEEE H", { locale: fr })}h si la livraison a lieu le {format(
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
				checked={delivery.limitOrdersCount}
				onClick={() => (delivery.limitOrdersCount = !delivery.limitOrdersCount)}
			/>
			<span class="mx-1">Autoriser un maximum de </span>
			{#if delivery.limitOrdersCount}
				<input
					id="maxOrders"
					type="number"
					style="width: 80px; display: inline-block;"
					bind:value={delivery.maxPurchaseOrdersPerTimeSlot}
				/>
			{:else}
				x
			{/if}
			<span class="ml-1">commandes par créneau de livraison</span>
		</div>
	</div>
	<div class="form-control">
		<div class="w-full mt-5">
			<label>Frais de livraison</label>
		</div>
	</div>
	<div class="form-control">
		<div class="w-full">
			<InputCheckbox
				checked={delivery.applyDeliveryFees}
				onClick={() => {
					delivery.applyDeliveryFees = !delivery.applyDeliveryFees;
					delivery.applyDeliveryFeesWhen = DeliveryFeesApplication.Always.Value;
				}}
			/>
			<span class="mx-1">Appliquer des frais de livraison de </span>
			{#if delivery.applyDeliveryFees}
				<input
					id="deliveryFees"
					type="number"
					style="width: 80px; display: inline-block;"
					bind:value={delivery.deliveryFeesWholeSalePrice}
				/>
			{:else}
				x
			{/if}
			<span class="ml-1">€ HT (TVA 20%) pour chaque livraison</span>
			{#if delivery.applyDeliveryFees}
				<div class="mt-3">
					Ces frais s'appliquent:
					<div class="mt-4 ml-4">
						<div>
							<input
								checked={delivery.applyDeliveryFeesWhen == DeliveryFeesApplication.Always.Value}
								on:change={(event) => (delivery.applyDeliveryFeesWhen = event.currentTarget.value)}
								type="radio"
								name="amount"
								value={DeliveryFeesApplication.Always.Value}
							/>
							Quelque soit le montant de la commande
						</div>
						<div>
							<input
								checked={delivery.applyDeliveryFeesWhen ==
									DeliveryFeesApplication.TotalLowerThanPurchaseOrderAmount.Value}
								on:change={(event) => (delivery.applyDeliveryFeesWhen = event.currentTarget.value)}
								type="radio"
								name="amount"
								value={DeliveryFeesApplication.TotalLowerThanPurchaseOrderAmount.Value}
							/>
							Si le montant de la commande est inférieur à
							<input
								id="applyWhen"
								type="number"
								style="width: 80px; display: inline-block;"
								bind:value={delivery.deliveryFeesMinPurchaseOrdersAmount}
							/> € HT
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
	<div class="form-control">
		<div class="w-full mt-5">
			<label>Automatisations</label>
		</div>
	</div>
	<div class="form-control mt-3" style="display: block;">
		<InputCheckbox
			checked={delivery.autoAcceptRelatedPurchaseOrder}
			onClick={() => (delivery.autoAcceptRelatedPurchaseOrder = !delivery.autoAcceptRelatedPurchaseOrder)}
		/>
		<span class="mx-1"
			>Accepter automatiquement les nouvelles commandes (les commandes non acceptées dans un délais de 72h sont
			automatiquement refusées)</span
		>
	</div>
	<p class="text-sm mt-5">* champs requis</p>
	<div class="form-control mt-5">
		<button
			type="submit"
			class:disabled={!$form.valid || $form.isSubmitting}
			disabled={$form.isSubmitting}
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
</form>
