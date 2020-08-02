<script>
  import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
  import GetGraphQLInstance from "./../../services/SheaftGraphQL";
  import { DELETE_PACKAGING } from "./mutations";
  import SheaftErrors from "./../../services/SheaftErrors";

  const errorsHandler = new SheaftErrors();

  export let packaging, close, onClose;

  let isLoading = false;
  const graphQLInstance = GetGraphQLInstance();

  const handleSubmit = async () => {
    isLoading = true;
    var res = await graphQLInstance.mutate(DELETE_PACKAGING, {
      id: packaging.id
    }, errorsHandler.Uuid);
    isLoading = false;

    if (!res.success) {
      //TODO
      return;
    }

    return await handleClose(res);
  };

  const handleClose = async res => {
    close();
    if (onClose) await onClose(res);
  };
</script>

<ActionConfirm
  title="Suppression"
  level="danger"
  isLoading={isLoading}
  submit={handleSubmit}
  {errorsHandler}
  close={() => handleClose({ success: false, data: null })}>
  <p class="leading-5">
    Vous vous apprêtez à
    <span class="text-gray-700">supprimer la consigne {packaging.name}</span>
  </p>
  <p>
    Cette opération est
    <span class="text-red-600 font-bold">irréversible</span>.
  </p>
</ActionConfirm>
