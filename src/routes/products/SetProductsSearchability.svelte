<script>
  import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
  import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
  import { SET_PRODUCTS_SEARCHABILITY } from "./mutations.js";
  import SheaftErrors from "./../../services/SheaftErrors";

  const errorsHandler = new SheaftErrors();

  export let selectedItems, close, onClose, status;
  const graphQLInstance = GetGraphQLInstance();

  let isLoading = false;

  const handleSubmit = async () => {
    isLoading = true;

    var res = await graphQLInstance.mutate(SET_PRODUCTS_SEARCHABILITY, {
      ids: selectedItems.map(s => s.id),
      searchable: status
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
  title={status ? 'Afficher' : 'Masquer'}
  level={status ? 'success' : "warning"}
  isLoading={isLoading}
  {errorsHandler}
  submit={handleSubmit}
  close={() => handleClose({ success: false, data: null })}>
  <p>
    Cette opération rendra les produits ci-dessous {status ? 'visibles' : 'invisibles'} dans la recherche des produits
  </p>
  <ul class="text-sm mt-2 font-semibold">
    {#each selectedItems as product}
      <li>{product.name}</li>
    {/each}
  </ul>
</ActionConfirm>
