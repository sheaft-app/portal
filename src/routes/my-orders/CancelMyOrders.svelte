<script>
  import { faTimes } from "@fortawesome/free-solid-svg-icons";
  import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
  import GetGraphQLInstance from "./../../services/SheaftGraphQL";
  import { CANCEL_MY_ORDERS } from "./mutations.js";
  import SheaftErrors from "./../../services/SheaftErrors";
import { MY_ORDERS } from "./queries";

  const errorsHandler = new SheaftErrors();

  export let onClose, close, orders;

  const graphQLInstance = GetGraphQLInstance();

  let isLoading = false;
  let reason = null;

  const handleSubmit = async () => {
    isLoading = true;
    var res = await graphQLInstance.mutate(
      CANCEL_MY_ORDERS, 
      {
        ids: orders.map(o => o.id), 
        reason: reason
      },
      errorsHandler.Uuid,
      MY_ORDERS);
      
    isLoading = false;

    if(!res.success){
      //TODO
      return;
    }
    
    await handleClose(res);
  };

  const handleClose = async res => {
    close();
    if (onClose) await onClose(res);
  };
</script>

<ActionConfirm
  {errorsHandler}
  title={orders.length > 1 ? 'Annuler mes commandes' : 'Annuler ma commande'}
  level="danger"
  icon={faTimes}
  submit={handleSubmit}
  submitText="Confirmer"
  closeText="Fermer"
  {isLoading}
  close={() => handleClose({ success: false, data: null })}>
  <p class="leading-5">
    Annuler {orders.length > 1 ? 'ces commandes' : 'cette commande'} alertera automatiquement le producteur.
  </p>
  <form class="mt-2">
    <label
      class="block uppercase tracking-wide text-gray-700 text-xs font-bold"
      for="reason">
      Raison
    </label>
    <input
      bind:value={reason}
      class="appearance-none block w-full text-gray-700 border input-bg-clr
      rounded py-3 px-4 leading-tight focus:outline-none focus:border-green-200
      focus:shadow-outline-green focus:bg-white"
      id="reason"
      type="text"
      placeholder="Expliquez l'annulation (optionnel)" />
  </form>
</ActionConfirm>
