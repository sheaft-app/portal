<script>
  import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
  import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
  import { SET_DELIVERY_AVAILABILITY } from "./mutations.js";
  import SheaftErrors from "./../../services/SheaftErrors";

  const errorsHandler = new SheaftErrors();

  export let close, onClose, delivery;
  const graphQLInstance = GetGraphQLInstance();

  let isLoading = false;

  const handleSubmit = async () => {
    isLoading = true;

    var res = await graphQLInstance.mutate(SET_DELIVERY_AVAILABILITY, {
      ids: [delivery.id],
      available: !delivery.available
    }, errorsHandler.Uuid);

    isLoading = false;

    if (!res.success) {
      //TODO
    }

    await handleClose(res);
  };

  const handleClose = async res => {
    close();
    await onClose(res);
  };
</script>

<ActionConfirm
  title={delivery.available ? 'Désactiver' : 'Activer'}
  level={delivery.available ? 'warning' : "success"}
  isLoading={isLoading}
  {errorsHandler}
  submit={handleSubmit}
  close={() => handleClose({ success: false, data: null })}>  
  <p>
    Cette opération {delivery.available ? 'désactivera' : 'activera'} cette livraison.
  </p>
</ActionConfirm>
