<script>
  import { faTimes } from "@fortawesome/free-solid-svg-icons";
  import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
  import { CANCEL_MY_ORDERS } from "./mutations.js";
  import SheaftErrors from "./../../services/SheaftErrors";
  import { MY_ORDERS } from "./queries";
  import { getContext } from "svelte";

  const errorsHandler = new SheaftErrors();

  export let onClose, close, orders;

  const { mutate } = getContext("api");

  let isLoading = false;
  let reason = null;

  const handleSubmit = async () => {
    isLoading = true;
    await mutate({
			mutation: CANCEL_MY_ORDERS,
			variables: { ids: orders.map(o => o.id), reason },
			errorsHandler,
			success: async (res) => await handleClose(res),
			successNotification: orders.length > 1 ? 'Commandes annulées' : 'Commande annulée',
			errorNotification: "Impossible d'annuler la commande.",
			clearCache: [MY_ORDERS]
    });
    isLoading = false;
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
  {close}>
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
