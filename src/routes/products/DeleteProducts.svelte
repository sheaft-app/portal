<script>
  import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
  import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
  import { DELETE_PRODUCTS } from "./mutations.js";
  import { GET_PRODUCTS } from "./queries.js";
  import SheaftErrors from "./../../services/SheaftErrors";

  const errorsHandler = new SheaftErrors();

  export let selectedItems, close, onClose;

  const graphQLInstance = GetGraphQLInstance();

  let isLoading = false;

  const handleSubmit = async () => {
    isLoading = true;

    var res = await graphQLInstance.mutate(DELETE_PRODUCTS, {
      ids: selectedItems.map(s => s.id)
    }, errorsHandler.Uuid, GET_PRODUCTS);

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
  title="Suppression"
  level="danger"
  isLoading={isLoading}
  submit={handleSubmit}
  {errorsHandler}
  close={() => handleClose({ success: false, data: null })}>
  <p class="leading-5">
    Vous vous apprêtez à
    <b>
      supprimer {selectedItems.length} produit{selectedItems.length > 1 ? "s" : ""}.
    </b>
  </p>
  <p>
    Cette opération supprimera tous les produits ci-dessous. Cette opération est
    <span class="text-red-600 font-bold">irréversible.</span>
  </p>
  <ul class="text-gray-600 mt-2 font-semibold">
    {#each selectedItems as product}
      <li>{product.name}</li>
    {/each}
  </ul>
</ActionConfirm>
