<script>
  import { faTimes } from "@fortawesome/free-solid-svg-icons";
  import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
  import { DELETE_ACCOUNT } from "./mutations.js";
  import SheaftErrors from "./../../services/SheaftErrors";
  import { getContext } from "svelte";

  export let onClose, close;

  const errorsHandler = new SheaftErrors();
  const { mutate } = getContext("api");

  let validationInput = null;
  let reason = null;
  let isRemoving = false;

  $: valid = validationInput == "SUPPRIMER";

  const handleSubmit = async () => {
    isRemoving = true;
    await mutate({
			mutation: DELETE_ACCOUNT,
			variables: { input: { id: user.id, reason } },
			errorsHandler,
			success: (res) => closeModal(res), 
			errorNotification: "Impossible de supprimer votre compte, veuillez réessayer ultérieurement"
		});
    isRemoving = false;
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
  isLoading={isRemoving}
  submitText="Supprimer"
  closeText="Annuler"
  submit={handleSubmit}
  {valid}
  {close}>
  <p class="leading-5" />
  <form class="mt-6">
    <p class="block uppercase tracking-wide text-red-500 text-xs font-bold">
      Attention, la suppression du compte est irréversible, vous perdrez toutes
      vos données (points, commandes, etc.).
    </p>
    <p class="mb-3 mt-1">
      Vous nous quittez ? 😔 Pour nous aider à améliorer notre service, dites-nous pourquoi ici :
    </p>
    <textarea
      bind:value={reason}
      class="appearance-none block w-full text-gray-700 border input-bg-clr
      rounded py-3 px-4 leading-tight focus:outline-none focus:border-green-200
      focus:shadow-outline-green focus:bg-white"
      placeholder="Raison (optionnel)"
      type="text" />
    <p class="mb-3 mt-4">
      Pour confirmer, veuillez écrire SUPPRIMER dans le champ ci-dessous
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
