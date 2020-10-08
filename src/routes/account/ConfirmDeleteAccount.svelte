<script>
  import { faTimes } from "@fortawesome/free-solid-svg-icons";
  import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
  import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
  import { DELETE_ACCOUNT } from "./mutations.js";
  import SheaftErrors from "./../../services/SheaftErrors";

  const errorsHandler = new SheaftErrors();

  export let onClose, close;

  var graphQL = GetGraphQLInstance();
  let validationInput = null;
  let reason = null;

  $: valid = validationInput == "SUPPRIMER";

  const handleSubmit = async () => {
    isRemoving = true;

    var res = await graphQL.mutate(DELETE_ACCOUNT, {
      input: { id: user.id, reason }
    });

    isRemoving = false;

    if (!res.success) {
      //TODO error
      return;
    }

    await closeModal(res);
  };

  const closeModal = async res => {
    close();
    await onClose(res);
  };
</script>

<ActionConfirm
  {errorsHandler}
  title="Supprimer mon compte"
  level="danger"
  icon={faTimes}
  submitText="Supprimer"
  closeText="Annuler"
  submit={handleSubmit}
  {valid}
  close={() => closeModal({ success: false, data: null })}>
  <p class="leading-5" />
  <form class="mt-6">
    <p class="block uppercase tracking-wide text-red-500 text-xs font-bold">
      Attention, la suppression du compte est irréversible, vous perdrez toutes
      vos données (points, commandes, etc...).
    </p>
    <p class="mb-3 mt-1">
      Vous pouvez indiquer une raison pour nous aider à améliorer le service.
    </p>
    <textarea
      bind:value={reason}
      class="appearance-none block w-full text-gray-700 border input-bg-clr
      rounded py-3 px-4 leading-tight focus:outline-none focus:border-green-200
      focus:shadow-outline-green focus:bg-white"
      placeholder="Raison (optionnel)"
      type="text" />
    <p class="mb-3 mt-4">
      Pour confirmer veuillez écrire SUPPRIMER dans le champs ci-dessous
    </p>
    <input
      bind:value={validationInput}
      class="appearance-none block w-full text-gray-700 border input-bg-clr
      rounded py-3 px-4 leading-tight focus:outline-none focus:border-green-200
      focus:shadow-outline-green focus:bg-white"
      type="text"
      placeholder="Confirmez en écrivant SUPPRIMER" />
  </form>
</ActionConfirm>
