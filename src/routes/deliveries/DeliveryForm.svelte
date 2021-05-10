<script>
  import Icon from "svelte-awesome";
  import { faPaperPlane, faCircleNotch, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
  import OpeningHoursContainer from "./../../components/opening-hours/OpeningHoursContainer.svelte";
  import Toggle from "./../../components/controls/Toggle.svelte";
  import { normalizeOpeningHours, denormalizeOpeningHours } from "../../helpers/app";
	import { form, bindClass } from '../../../vendors/svelte-forms/src/index';
	import ErrorContainer from "./../../components/ErrorContainer.svelte";

  export let submit, initialValues, isLoading;
  let delivery = initialValues;

  // pour éviter d'avoir un two-way binding avec delivery directement
  // comme on normalise l'envoi, donc qu'on modifie delivery, le two-way binding peut provoquer une boucle
  let openings = denormalizeOpeningHours(delivery.deliveryHours);

  const handleSubmit = () => {
    deliveryForm.validate();

    if ($deliveryForm.valid) {
      delivery.deliveryHours = normalizeOpeningHours(openings);
      submit();
    }
  }

  const deliveryForm = form(() => ({
    deliveryHours: { value: openings, validators: ['required', 'openingsDays', 'openingsDates'], enabled: true }
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
  <div class="flex flex-wrap mb-6 lg:mb-0">
    <div class="w-full lg:w-1/2">
      <div class="form-control">
        <div class="w-full" use:bindClass={{ form: deliveryForm, name: "deliveryHours" }}>
          <label for="grid-timestamp">Horaires de livraison *</label>
          <OpeningHoursContainer bind:openings={openings} />
          <ErrorContainer field={$deliveryForm.fields.deliveryHours} />
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