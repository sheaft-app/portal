<script>
  import { faCheck } from "@fortawesome/free-solid-svg-icons";;
  import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
  import { PROCESS_PURCHASE_ORDERS } from "./mutations.js";
  import GetGraphQLInstance from "./../../services/SheaftGraphQL";
  import SheaftErrors from "./../../services/SheaftErrors";

  export let onClose, close, purchaseOrders;

  const errorsHandler = new SheaftErrors();
  const graphQLInstance = GetGraphQLInstance();
  
  let isLoading = false;

  const handleSubmit = async () => {
    isLoading = true;
    var res = await graphQLInstance.mutate(PROCESS_PURCHASE_ORDERS, {
      ids: purchaseOrders.map(o => o.id)
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
  title={purchaseOrders.length > 1 ? 'Préparer ces commandes' : 'Préparer cette commande'}
  level="info"
  icon={faCheck}
  submitText="Préparer"
  closeText="Fermer"
  submit={handleSubmit}
  {isLoading}
  close={() => handleClose({ success: false, data: null })}>
  <p class="leading-5 text-gray-500">
    Préparer {purchaseOrders.length > 1 ? 'ces commandes' : 'cette commande'} alertera
    automatiquement votre client que vous avez débuter la préparation de leur
    commande.
  </p>
</ActionConfirm>
