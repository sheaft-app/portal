<script>
  import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
  import { DELETE_SELLING_POINT } from "./mutations";
  import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
  import GetRouterInstance from "./../../services/SheaftRouter.js";
  import SheaftErrors from "./../../services/SheaftErrors";
import { GET_SELLING_POINTS } from "./queries";

  const errorsHandler = new SheaftErrors();

  export let sellingPoint, close, onClose;

  const graphQLInstance = GetGraphQLInstance();
  const routerInstance = GetRouterInstance();

	const closeModal = async (obj) => {
		close();
		if (onClose) await onClose(obj);
	}

  const handleSubmit = async () => {
    var res = await graphQLInstance.mutate(
      DELETE_SELLING_POINT, 
      {
      id: sellingPoint.id
    }, 
    errorsHandler.Uuid,
    GET_SELLING_POINTS);

    if (!res.success) {
      // todo
      return;
    }
    
    return await closeModal(res);
  }
</script>

<ActionConfirm title="Suppression" level="danger" submit={handleSubmit} close={() => closeModal({ success: false, data: null })} {errorsHandler}>
  <p class="leading-5 text-gray-600">
    Vous vous apprêtez à <span class="text-gray-700">supprimer ce point de vente</span>
  </p>
  <p class="text-gray-600">
    Cette opération est <span class="text-red-600 font-bold">irréversible.</span>
  </p>
</ActionConfirm>
