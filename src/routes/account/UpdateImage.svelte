<script>
  import { faCheck } from "@fortawesome/free-solid-svg-icons";;
  import ImgEncoder from "svelte-image-encoder";
  import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
  import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
  import SheaftErrors from "./../../services/SheaftErrors";

  const errorsHandler = new SheaftErrors();

  export let id, mutation, close, onClose, initialSrc = "https://content.sheaft.com/pictures/users/profile.svg";
  var graphQLInstance = GetGraphQLInstance();
  let src = initialSrc;

  let url;
  let quality = 1;
  let imageChosen = false;
  let realTime = false;
  let showResult = true;
  $: valid = initialSrc !== src;
  let isLoading = false;

  function loadFile(e) {
    src = URL.createObjectURL(e.target.files[0]);
  }

  const handleSubmit = async () => {
    isLoading = true;
    var res = await graphQLInstance.mutate(mutation, { id: id, picture: url });
    isLoading = false;

    if (!res.success) {
      //TODO error
      return;
    }

    await handleClose(res);
  };

  const handleClose = async res => {
    close();
    return await onClose(res);
  };
</script>

<ActionConfirm
  {errorsHandler}
  title="Modifier la photo"
  icon={faCheck}
  {valid}
  isLoading={isLoading}
  submit={handleSubmit}
  submitText="Modifier"
  closeText="Annuler"
  close={() => handleClose({ success: false, data: null })}>
  <form>
    <div class="pt-5 m-auto text-center">
      <ImgEncoder
        {src}
        bind:imageChosen
        {quality}
        bind:url
        {realTime}
        width={128}
        height={128}
        crossOrigin="anonymous"
        classes="profile-image" />
      <input
        on:change={loadFile}
        type="file"
        hidden
        id="avatar"
        name="avatar"
        accept="image/png, image/jpeg" />
      <div class="mt-5 mb-5 m-auto text-center">
        <label
          class="btn px-3 py-2 btn-accent cursor-pointer justify-center"
          for="avatar">
          Choisir une nouvelle photo
        </label>
      </div>
    </div>
  </form>
</ActionConfirm>

<style lang="scss">
  :global(.profile-image) {
    @apply shadow-md;
    @apply rounded-full;
    @apply cursor-move;
    margin: auto;
  }
</style>
