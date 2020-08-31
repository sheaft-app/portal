<script>
  import Icon from "svelte-awesome";
  import { faCircleNotch, faPaperPlane } from "@fortawesome/free-solid-svg-icons";

  export let submit, packaging, isLoading, isInModal = false, close = null;

  $: isValid = packaging &&
    packaging.name &&
    packaging.wholeSalePrice && 
    packaging.vat != null;

  const selectVat = (vat) => {
    return packaging.vat = vat;
  }
</script>

<form class="w-full" on:submit|preventDefault={submit}>
  <div class={`mb-6 lg:mb-0 ${!isInModal && "lg:w-1/2"}`}>
    <div class="form-control">
      <div class="w-full">
        <label for="grid-product">Nom de la consigne *</label>
        <input
          bind:value={packaging.name}
          class:disabled={isLoading}
          disabled={isLoading}
          required
          id="grid-product"
          type="text"
          placeholder="Pot en verre" />
      </div>
    </div>  
    <div class="form-control">
      <div class="w-full">
        <label for="grid-price">Prix hors taxes *</label>
        <input
          bind:value={packaging.wholeSalePrice}
          class:disabled={isLoading}
          disabled={isLoading}
          required
          id="grid-price"
          type="number"
          step=".01"
          placeholder="0.50" />
      </div>
    </div>
    <div class="form-control">
      <div class="w-full">
        <label for="grid-vat">TVA *</label>
        <div class="w-full text-lg justify-center button-group">
          <button
            on:click={() => selectVat(5.5)}
            type="button"
            class:selected={packaging.vat === 5.5}
            class:disabled={isLoading}>
            5,5%
          </button>
          <button
            on:click={() => selectVat(10)}
            type="button"
            class:selected={packaging.vat === 10}
            class:disabled={isLoading}>
            10%
          </button>
           <button
            on:click={() => selectVat(20)}
            type="button"
            class:selected={packaging.vat === 20}
            class:disabled={isLoading}>
            20%
          </button>
        </div>
      </div>
    </div>
    <div class="form-control">
      <div class="w-full">
        <label for="grid-description">Description</label>
        <textarea
          bind:value={packaging.description}
          id="grid-description"
          class:disabled={isLoading}
          disabled={isLoading}
          type="text"
          style="min-height:150px;" />
      </div>
    </div>
  </div>
  <p class="text-sm mt-5">* champs requis</p>   
  <div class="form-control mt-5">
    {#if isInModal && close}
      <button
        type="button"
        class:disabled={isLoading}
        on:click={close}
        disabled={isLoading}
        class="btn bg-white shadow btn-lg justify-center w-full md:w-auto lg:mr-2 mr-0 mb-2 lg:mb-0">
        Fermer
      </button>
    {/if}
    <button
      type="submit"
      class:disabled={isLoading || !isValid}
      disabled={isLoading || !isValid}
      class="btn btn-primary btn-xl justify-center w-full md:w-auto">
      <Icon
        data={isLoading ? faCircleNotch : faPaperPlane}
        class="mr-2 inline"
        spin={isLoading} />
      Valider
    </button>
  </div>
</form>