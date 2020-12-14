<script>
	import { onMount } from "svelte";
	import Icon from "svelte-awesome";
	import {
		faPaperPlane,
		faCircleNotch,
		faInfoCircle,
	} from "@fortawesome/free-solid-svg-icons";
	import CitySearch from "./../../components/search/CitySearch.svelte";
	import OpeningHoursContainer from "./../../components/opening-hours/OpeningHoursContainer.svelte";
	import Toggle from "./../../components/controls/Toggle.svelte";
	import {
		timeToTimeSpan,
		normalizeOpeningHours,
		denormalizeOpeningHours,
	} from "./../../helpers/app";
	import { form, bindClass } from "../../../vendors/svelte-forms/src/index";
	import ErrorContainer from "./../../components/ErrorContainer.svelte";

	export let submit, initialValues, isLoading;
	let sellingPoint = initialValues;
	let openings = denormalizeOpeningHours(sellingPoint.openingHours);
	let limitOrders =
		sellingPoint.lockOrderHoursBeforeDelivery != null ||
    sellingPoint.maxPurchaseOrdersPerTimeSlot != null;
    
  let lockOrders = sellingPoint.lockOrderHoursBeforeDelivery != null || sellingPoint.id != null ? sellingPoint.lockOrderHoursBeforeDelivery : 24;
  let maxOrders = sellingPoint.maxPurchaseOrdersPerTimeSlot != null || sellingPoint.id != null ? sellingPoint.maxPurchaseOrdersPerTimeSlot : 10;

  $:if(limitOrders && lockOrders == null){
    lockOrders = 24;
  }
  
  $:if(limitOrders && maxOrders == null){
    maxOrders = 5;
  }

	const selectKind = (kind) => {
		if (!isLoading) return (sellingPoint.kind = kind);

		return console.error(
			"Can't change kind when form hasn't been initialized."
		);
	};

	const handleSubmit = () => {
		sellingPointForm.validate();

		if ($sellingPointForm.valid && !isLoading) {
			sellingPoint.openingHours = normalizeOpeningHours(openings);
			delete sellingPoint.address["insee"];

			if (!limitOrders) {
				sellingPoint.lockOrderHoursBeforeDelivery = null;
				sellingPoint.maxPurchaseOrdersPerTimeSlot = null;
			} else if (lockOrders < 0 || maxOrders < 0){        
          return;
      }
      else{
        sellingPoint.lockOrderHoursBeforeDelivery = lockOrders;
        sellingPoint.maxPurchaseOrdersPerTimeSlot = maxOrders;
      }

			submit();
		}
	};

	const sellingPointForm = form(
		() => ({
			kind: {
				value: sellingPoint.kind,
				validators: ["required", "min:3"],
				enabled: true,
			},
			address: {
				value: sellingPoint.address,
				validators: ["required"],
				enabled: true,
			},
			openings: {
				value: openings,
				validators: ["required", "openingsDays", "openingsDates"],
				enabled: true,
			},
			maxPurchaseOrders: {
				value: maxOrders,
				validators: ["min:1"],
				enabled: true,
			},
			lockPurchaseOrders: {
				value: lockOrders,
				validators: ["min:0"],
				enabled: true,
			},
		}),
		{
			initCheck: false,
		}
	);
</script>

<form class="w-full pb-5" on:submit|preventDefault={handleSubmit}>
	<div class="flex flex-wrap mb-6 lg:mb-0">
		<div class="w-full lg:w-1/2">
			<div class="form-control">
				<div class="w-full">
					<label for="grid-name">Nom du point</label>
					<input
						bind:value={sellingPoint.name}
						class:disabled={isLoading}
						disabled={isLoading}
						id="grid-name"
						type="text"
						placeholder="ex : Marché d'Annecy (vieille ville)" />
					<small class="text-gray-600"><Icon
							data={faInfoCircle}
							scale="0.8"
							class="mr-2" />Donnez un nom (visible que par vous) au point de
						vente pour le retrouver plus facilement dans votre liste.</small>
				</div>
			</div>
			<div class="form-control">
				<label>Type de point de vente *</label>
				<div
					class="w-full justify-center button-group"
					use:bindClass={{ form: sellingPointForm, name: 'kind' }}>
					<button
						on:click={() => selectKind('MARKET')}
						type="button"
						class:selected={sellingPoint.kind === 'MARKET'}
						class:disabled={isLoading}>
						Marché ouvert
					</button>
					<button
						on:click={() => selectKind('FARM')}
						type="button"
						class:selected={sellingPoint.kind === 'FARM'}
						class:disabled={isLoading}>
						Site de production
					</button>
					<button
						on:click={() => selectKind('COLLECTIVE')}
						type="button"
						class:selected={sellingPoint.kind === 'COLLECTIVE'}
						class:disabled={isLoading}>
						Magasin de producteurs
					</button>
				</div>
				<ErrorContainer field={$sellingPointForm.fields.kind} />
			</div>
			<div class="form-control w-full" style="display: block;">
				<label for="grid-address">Adresse *</label>
				<CitySearch
					invalid={$sellingPointForm && $sellingPointForm.fields.address ? !$sellingPointForm.fields.address.valid && $sellingPointForm.fields.address.dirty : false}
					bind:selectedAddress={sellingPoint.address}
					bindClassData={{ form: sellingPointForm, name: 'address' }} />
				<ErrorContainer field={$sellingPointForm.fields.address} />
			</div>
			<div class="form-control">
				<div
					class="w-full"
					use:bindClass={{ form: sellingPointForm, name: 'openings' }}>
					<label for="grid-timestamp">Horaires de vente *</label>
					<OpeningHoursContainer bind:openings />
					<ErrorContainer field={$sellingPointForm.fields.openings} />
				</div>
			</div>
      <div class="form-control mt-6" style="display: block;">
				<label>Limiter les commandes</label>
				<Toggle
					labelPosition="left"
					disabled={isLoading}
					classNames="ml-1"
					bind:isChecked={limitOrders} />
			</div>
			{#if limitOrders}
				<div class="form-control">
					<div class="w-full">
            <span class="mr-1">Autoriser la prise de commandes jusqu'à</span>
            <input id="lockOrders" type="number" style="width: 70px; display: inline-block;" bind:value={lockOrders}>
            <span class="ml-1">heures avant l'horaire de vente.</span>
					</div>
				</div>
				<div class="form-control">
					<div class="w-full">
            <span class="mr-1">Autoriser un maximum de </span>
            <input id="maxOrders" type="number" style="width: 70px; display: inline-block;" bind:value={maxOrders}>
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
					disabled={isLoading}
					classNames="ml-1"
					bind:isChecked={sellingPoint.autoAcceptRelatedPurchaseOrder} />
			</div>
			<div class="form-control" style="display: block;">
				<label>Marquer automatiquement les commandes acceptées comme terminées</label>
				<Toggle
					labelPosition="left"
					disabled={isLoading}
					classNames="ml-1"
					bind:isChecked={sellingPoint.autoCompleteRelatedPurchaseOrder} />
			</div>
		</div>
	</div>
	<p class="text-sm mt-5">* champs requis</p>
	<div class="form-control mt-5 mb-5">
		<button
			type="submit"
			class:disabled={isLoading || !$sellingPointForm.valid}
			class="btn btn-primary btn-xl justify-center w-full md:w-auto">
			<Icon
				data={isLoading ? faCircleNotch : faPaperPlane}
				class="mr-2 inline"
				spin={isLoading} />
			Valider
		</button>
	</div>
</form>
