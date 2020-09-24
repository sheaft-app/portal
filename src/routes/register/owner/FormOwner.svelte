<script>
  import LegalsForm from "../../../components/forms/LegalsForm.svelte";
	import { form, bindClass } from '../../../../vendors/svelte-forms/src/index';

  export let company, stepper = 2, errorsHandler;

  let userIsInvalid = false;

  const ownerForm = form(() => ({
    firstName: { value: company.firstName, validators: ['required'], enabled: true },
    lastName: { value: company.lastName, validators: ['required'], enabled: true }
	}), {
    initCheck: false
  });
</script>

<div class="text-center pb-8 px-5">
  Étape 3/5
  <p class="font-bold text-xl">Qui est le propriétaire ?</p>
  <p class="text-gray-600">Si il y a plusieurs gérants, renseignez un seul d'entre eux.</p>
</div>
<LegalsForm bind:user={company.legals.owner} {errorsHandler} bind:invalid={userIsInvalid} canFlex={true} />
<div class="flex w-full justify-center mt-5">
  <div>
    <button
      on:click={() => stepper--}
      aria-label="Retour"
      class="form-button uppercase text-sm cursor-pointer text-gray-600
      rounded-full px-6 py-2 flex items-center justify-center m-auto border border-gray-600 mr-2">
      Précédent
    </button>
  </div>
  <div>
    <button
      on:click={() => stepper++}
      class:disabled={userIsInvalid}
      aria-label="Suivant"
      class="form-button uppercase text-sm cursor-pointer text-white
      shadow rounded-full px-6 py-2 flex items-center justify-center
      m-auto bg-primary">
      Suivant
    </button>
  </div>
</div>