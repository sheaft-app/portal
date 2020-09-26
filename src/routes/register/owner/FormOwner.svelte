<script>
  import LegalsForm from "../../../components/forms/LegalsForm.svelte";

  export let company, stepper = 2, errorsHandler;

  let form = null;

  const next = () => {
    if (!form) return;

    form.validate();

    if ($form.valid) {
      ++stepper;
    }
  }
</script>

<div class="text-center pb-8 px-5">
  Étape 3/5
  <p class="font-bold text-xl">Qui est le représentant légal ?</p>
  <p class="text-gray-600">Si il y en a plusieurs, renseignez un seul d'entre eux.</p>
</div>
<LegalsForm bind:user={company.legals.owner} {errorsHandler} bind:facturationForm={form} canFlex={true} hideResidence={true}>
  <div slot="basics-header" class="-my-3 -mx-5 px-5 py-3 mb-4 bg-gray-100 border-b border-gray-400 lg:rounded-t font-semibold flex justify-between items-center">
    <p>Représentant légal</p>
  </div>
  <div slot="address-header" class="-my-3 -mx-5 px-5 py-3 mb-4 bg-gray-100 border-b border-gray-400 lg:rounded-t font-semibold flex justify-between items-center">
    <p>Domicile représentant légal</p>
  </div>
</LegalsForm>
{#if form}
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
        on:click={next}
        class:disabled={!$form.valid}
        aria-label="Suivant"
        class="form-button uppercase text-sm cursor-pointer text-white
        shadow rounded-full px-6 py-2 flex items-center justify-center
        m-auto bg-primary">
        Suivant
      </button>
    </div>
  </div>
{/if}