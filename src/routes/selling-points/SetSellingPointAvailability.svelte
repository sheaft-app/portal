<script>
  import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
  import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
  import { SET_SELLING_POINT_AVAILABILITY } from "./mutations.js";
  import SheaftErrors from "./../../services/SheaftErrors";

  const errorsHandler = new SheaftErrors();

  export let close, onClose, sellingPoint;
  const graphQLInstance = GetGraphQLInstance();

  let isLoading = false;

  const handleSubmit = async () => {
    isLoading = true;

    var res = await graphQLInstance.mutate(SET_SELLING_POINT_AVAILABILITY, {
      ids: [sellingPoint.id],
      available: !sellingPoint.available
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
  title={sellingPoint.available ? 'Désactiver' : 'Activer'}
  level={sellingPoint.available ? 'warning' : "success"}
  isLoading={isLoading}
  {errorsHandler}
  submit={handleSubmit}
  close={() => handleClose({ success: false, data: null })}>  
  <p>
    Cette opération {sellingPoint.available ? 'désactivera' : 'activera'} ce point de vente.
  </p>
</ActionConfirm>
