<script>
  import { faCheck } from "@fortawesome/free-solid-svg-icons";;
  import ImgEncoder from "svelte-image-encoder";
  import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
  import SheaftErrors from "./../../services/SheaftErrors";

  const errorsHandler = new SheaftErrors();

  export let product, close, onClose;

  let initialSrc = product.picture;
  let src = initialSrc;

  let url;
  let quality = 1;
  let imageChosen = false;
  let realTime = false;
  let showResult = true;
  $: valid = initialSrc !== src;

  function loadFile(e) {
    src = URL.createObjectURL(e.target.files[0]);
  }

  const handleSubmit = async () => {    
    await handleClose({success:true, data:url});
  };

  const handleClose = async(res) => {
    close();
    await onClose(res);
  }
</script>

<ActionConfirm
  {errorsHandler}
  class="modal"
  title="Modifier l'image du produit"
  icon={faCheck}
  {valid}
  submit={handleSubmit}
  submitText="Modifier"
  closeText="Annuler"
  close={() => handleClose({success:false, data:null})}>
  <form>
    <div class="pt-5 m-auto text-center">
      {#if src}
        <ImgEncoder
          {src}
          bind:imageChosen
          {quality}
          bind:url
          {realTime}
          width={620}
          height={256}
          crossOrigin="anonymous"
          classes="product-image" />
      {/if}
      <input
        on:change={loadFile}
        type="file"
        hidden
        id="avatar"
        name="avatar"
        accept="image/png, image/jpeg" />
      <div class="mt-5 mb-5 m-auto text-center">
        {#if src}
          <p class="leading-5 text-gray-600 py-3 hidden lg:block">
            Faites glisser l'image pour la recadrer
          </p>
        {/if}
        <label
          class="bg-accent px-8 py-3 shadow rounded-full text-lg justify-center
          cursor-pointer"
          for="avatar">
          Choisir une nouvelle image
        </label>
      </div>
    </div>
  </form>
</ActionConfirm>

<style lang="scss">
  :global(.product-image) {
    @apply shadow-md;
    @apply cursor-move;
    margin: auto;
  }

  .modal {
    max-width: 48em !important;
  }
</style>
