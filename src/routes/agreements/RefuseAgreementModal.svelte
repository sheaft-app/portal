<script>
  import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
  import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
  import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
  import { REFUSE_AGREEMENTS } from "./mutations.js";
  import SheaftErrors from "./../../services/SheaftErrors";

  const errorsHandler = new SheaftErrors();

  export let onClose, close, agreement;

  const graphQLInstance = GetGraphQLInstance();

  let reason = null;
  let isLoading = false;

  const handleSubmit = async () => {
    isLoading = true;
    var res = await graphQLInstance.mutate(REFUSE_AGREEMENTS, {
      ids: [agreement.id],
      reason
    });

    isLoading = false;

    if (!res.success) {
      // todo
      return;
    }

    await handleClose(res);
  }

  const handleClose = async (res) => {
    close();
    if (onClose) await onClose(res);
  }
</script>

<ActionConfirm
  {errorsHandler}
  title='Refuser un accord'
  level="danger"
  icon={faExclamationTriangle}
  submit={handleSubmit}
  {isLoading}
  submitText="Confirmer"
  closeText="Annuler"
  close={() => handleClose({success:false, data:null})}>
  <p class="leading-5 text-gray-500">
    Vous vous apprêtez à refuser l'accord entre {agreement.delivery.producer.name} et {agreement.store.name}.
  </p>
  <div class="form-control w-full mt-2">
    <label
      for="reason">
      Raison
    </label>
    <input
      bind:value={reason}
      id="reason"
      type="text"
      placeholder="Expliquez brièvement la raison (optionnel)" />
  </div>
</ActionConfirm>
