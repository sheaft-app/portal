<script>
  import Icon from "svelte-awesome";
  import { faPaperPlane, faCircleNotch, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
  import OpeningHoursContainer from "./../../components/opening-hours/OpeningHoursContainer.svelte";
  import Toggle from "./../../components/controls/Toggle.svelte";
  import { 
		normalizeOpeningHours,
		denormalizeOpeningHours,
		normalizeClosingDates,
		denormalizeClosingDates } from "../../helpers/app";
	import { form, bindClass } from '../../../vendors/svelte-forms/src/index';
	import ErrorContainer from "./../../components/ErrorContainer.svelte";
	import ClosingDates from "./../../components/ClosingDates.svelte";

  export let submit, initialValues, isLoading;
  let delivery = initialValues;
	let closings = delivery.closings ? denormalizeClosingDates(delivery.closings) : [];
	let openings = denormalizeOpeningHours(delivery.deliveryHours);
	let limitOrders = delivery.lockOrderHoursBeforeDelivery != null || delivery.maxPurchaseOrdersPerTimeSlot != null;
    
	let lockOrders = delivery.lockOrderHoursBeforeDelivery != null || delivery.id != null ? delivery.lockOrderHoursBeforeDelivery : 24;
	let maxOrders = delivery.maxPurchaseOrdersPerTimeSlot != null || delivery.id != null ? delivery.maxPurchaseOrdersPerTimeSlot : 10;

	$: if(limitOrders && lockOrders == null) lockOrders = 24;
	$: if(limitOrders && maxOrders == null) maxOrders = 5;

  const handleSubmit = () => {
    deliveryForm.validate();
    
		if ($deliveryForm.valid && !isLoading) {
			delivery.deliveryHours = normalizeOpeningHours(openings);
			delivery.closings = normalizeClosingDates(closings);

			if (!limitOrders) {
				delivery.lockOrderHoursBeforeDelivery = null;
				delivery.maxPurchaseOrdersPerTimeSlot = null;
			} else if (lockOrders < 0 || maxOrders < 0){        
				return;
			}
			else{
				delivery.lockOrderHoursBeforeDelivery = lockOrders;
				delivery.maxPurchaseOrdersPerTimeSlot = maxOrders;
			}

			submit();
		}
  }

  const deliveryForm = form(() => ({
    deliveryHours: { value: openings, validators: ['required', 'openingsDays', 'openingsDates'], enabled: true },
			openings: {
				value: openings,
				validators: ["required", "openingsDays", "openingsDates"],
				enabled: true,
			},
			maxPurchaseOrders: {
				value: maxOrders,
				validators: ["min:1"],
				enabled: limitOrders,
			},
			lockPurchaseOrders: {
				value: lockOrders,
				validators: ["min:0"],
				enabled: limitOrders,
			},
  }), {
    initCheck: false
  });
</script>

<form class="w-full" on:submit|preventDefault={handleSubmit}>
  <div class="form-control">
    <div class="w-full">
      <label for="grid-name">Nom du créneau</label>
      <input
        bind:value={delivery.name}
        class:disabled={isLoading}
        disabled={isLoading}
        id="grid-name"
        type="text"
        placeholder="ex : Livraison bassin Annecien" />
    </div>
  </div>
  <div class="form-control">
    <div class="w-full" use:bindClass={{ form: deliveryForm, name: "deliveryHours" }}>
      <label for="grid-timestamp">Horaires de livraison *</label>
      <OpeningHoursContainer bind:openings={openings} />
      <ErrorContainer field={$deliveryForm.fields.deliveryHours} />
    </div>
  </div>
  <hr class="my-5" />
  <div class="form-control">
    <label>Plages de fermeture</label>
    <p class="text-gray-600 mb-2">Si cette n'est pas assurée durant certaines périodes de l'année, renseignez les dates pour que les magasins ne puissent pas placer de commandes avec livraison sur ces périodes.</p>
    <ClosingDates bind:closings />
  </div>
  
  <hr class="my-5" />
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
    <span class="ml-1">heures avant l'horaire de livraison.</span>
  </div>
</div>
<div class="form-control">
  <div class="w-full">
    <span class="mr-1">Autoriser un maximum de </span>
    <input id="maxOrders" type="number" style="width: 70px; display: inline-block;" bind:value={maxOrders}>
    <span class="ml-1">commandes par horaire de livraison.</span>
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
  bind:isChecked={delivery.autoAcceptRelatedPurchaseOrder} />
</div>
<div class="form-control" style="display: block;">
<label>Marquer automatiquement les commandes acceptées comme terminées</label>
<Toggle
  labelPosition="left"
  disabled={isLoading}
  classNames="ml-1"
  bind:isChecked={delivery.autoCompleteRelatedPurchaseOrder} />
</div>
  <p class="text-sm mt-5">* champs requis</p>   
  <div class="form-control mt-5">
    <button
      type="submit"
      class:disabled={!$deliveryForm.valid || isLoading}
      disabled={isLoading}
      class="btn btn-primary btn-xl justify-center w-full md:w-auto">
      <Icon
        data={isLoading ? faCircleNotch : faPaperPlane}
        class="mr-2 inline"
        spin={isLoading} />
      Valider
    </button>
  </div>
</form>