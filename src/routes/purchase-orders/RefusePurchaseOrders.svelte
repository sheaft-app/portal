<script>
  import { faTimes } from "@fortawesome/free-solid-svg-icons";
  import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
  import { REFUSE_PURCHASE_ORDERS } from "./mutations.js";
  import GetGraphQLInstance from "./../../services/SheaftGraphQL";
  import SheaftErrors from "./../../services/SheaftErrors";

  export let onClose, close, purchaseOrders;

  const errorsHandler = new SheaftErrors();
  const graphQLInstance = GetGraphQLInstance();
  
  let isLoading = false;
  let reason = null;

  const handleSubmit = async () => {
    isLoading = true;
    var res = await graphQLInstance.mutate(REFUSE_PURCHASE_ORDERS, {
      ids: purchaseOrders.map(o => o.id),
      reason: reason
    });
    isLoading = false;

    if (!res.success) {
      //TODO
      return;
    }

    await handleClose(res);
  };

  const handleClose = async obj => {
    close();
    if (onClose) await onClose(obj);
  };
</script>

<ActionConfirm
  {errorsHandler}
  title={purchaseOrders.length > 1 ? 'Refuser ces commandes' : 'Refuser cette commande'}
  level="danger"
  icon={faTimes}
  submitText="Refuser"
  closeText="Fermer"
  submit={handleSubmit}
  {isLoading}
  close={() => handleClose({ success: false, data: null })}>
  <p class="leading-5">
    Refuser {purchaseOrders.length > 1 ? 'ces commandes' : 'cette commande'} alertera
    automatiquement vos client.
  </p>
  <form class="mt-2">
    <div class="form-control w-full">
      <label
        for="reason">
        Raison
      </label>
      <input
        bind:value={reason}
        id="reason"
        type="text"
        placeholder="Expliquez votre refus (optionnel)" />
    </div>
  </form>
</ActionConfirm>
