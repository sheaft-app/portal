<script>
  import { onMount } from "svelte";
  import Icon from "svelte-awesome";
  import { faPaperPlane, faCircleNotch } from "@fortawesome/free-solid-svg-icons";
  import OpeningHoursContainer from "./../../components/opening-hours/OpeningHoursContainer.svelte";
  import Toggle from "./../../components/controls/Toggle.svelte";
  import { timeToTimeSpan, normalizeOpeningHours, denormalizeOpeningHours } from "../../helpers/app";
	import { form, bindClass } from '../../../vendors/svelte-forms/src/index';
	import ErrorContainer from "./../../components/ErrorContainer.svelte";
	import ConfigureYearlyClosings from "../../components/ConfigureYearlyClosings.svelte";

  export let submit, initialValues, isLoading;
  let delivery = initialValues;

  // pour éviter d'avoir un two-way binding avec delivery directement
  // comme on normalise l'envoi, donc qu'on modifie delivery, le two-way binding peut provoquer une boucle
  let openings = denormalizeOpeningHours(delivery.openingHours);

  const handleSubmit = () => {
    deliveryForm.validate();

    if ($deliveryForm.valid) {
      delivery.openingHours = normalizeOpeningHours(openings);
      submit();
    }
  }

  const deliveryForm = form(() => ({
    openingHours: { value: openings, validators: ['required', 'openingsDays', 'openingsDates'], enabled: true }
  }), {
    initCheck: false
  });
</script>

<form class="w-full" on:submit|preventDefault={handleSubmit}>
  <ConfigureYearlyClosings container="px-3 py-4 bg-white shadow mb-5" />
  <div class="flex flex-wrap mb-6 lg:mb-0">
    <div class="w-full lg:w-1/2">
      <div class="form-control">
        <div class="w-full" use:bindClass={{ form: deliveryForm, name: "openingHours" }}>
          <label for="grid-timestamp">Horaires de livraison *</label>
          <OpeningHoursContainer bind:openings={openings} />
          <ErrorContainer field={$deliveryForm.fields.openingHours} />
        </div>
      </div>
    </div>
  </div>
  <div class="form-control" style="display: block;">
    <label>Bloquer les commandes</label>
    <Toggle disabled={isLoading} classNames="ml-1" bind:isChecked={delivery.lockOrderHoursBeforeDelivery}>
      <div class="ml-2">
          <input type="number" style="width: 70px; display: inline-block;" bind:value={delivery.lockOrderHoursBeforeDelivery}>
          <span class="ml-1">heures avant le début de la livraison</span>
      </div>
    </Toggle>
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