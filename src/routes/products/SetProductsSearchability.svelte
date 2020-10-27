<script>
  import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
  import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
  import { SET_PRODUCTS_SEARCHABILITY } from "./mutations.js";
  import SheaftErrors from "./../../services/SheaftErrors";
  import Toggle from "../../components/controls/Toggle.svelte";

  const errorsHandler = new SheaftErrors();

  export let selectedItems, close, onClose, visibleToStores = false, visibleToConsumers = false;
  const graphQLInstance = GetGraphQLInstance();

  let isLoading = false;

  const handleSubmit = async () => {
    isLoading = true;

    var res = await graphQLInstance.mutate(SET_PRODUCTS_SEARCHABILITY, {
      ids: selectedItems.map(s => s.id),
      visibleToStores: visibleToStores,
      visibleToConsumers: visibleToConsumers
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
  title="Changer la visibilité de ces produits"
  level={"warning"}
  isLoading={isLoading}
  {errorsHandler}
  submit={handleSubmit}
  close={() => handleClose({ success: false, data: null })}>
  <p>
    Choisissez si les produits ci-dessous sont visibles ou non (curseur rose = visible)
  </p>
    <ul class="text-sm mt-2 font-semibold">
      {#each selectedItems as product}
        <li>{product.name}</li>
      {/each}
    </ul>
    <br/>
    <p>Par les :</p>
    <br/>
    <label>Consommateurs</label>
		<Toggle
			labelPosition="left"
			disabled={isLoading}
			classNames="ml-1"
			bind:isChecked={visibleToConsumers}>
    </Toggle>
    <label>Magasins</label>
		<Toggle
			labelPosition="left"
			disabled={isLoading}
			classNames="ml-1"
			bind:isChecked={visibleToStores}>
		</Toggle>
</ActionConfirm>
