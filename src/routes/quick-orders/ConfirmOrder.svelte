<script>
  import GetRouterInstance from "../../services/SheaftRouter.js";
  import { format } from "date-fns";
  import { timeSpanToFrenchHour } from "./../../helpers/app.js";
  import { fr } from "date-fns/locale";
  import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
  import GetGraphQLInstance from "./../../services/SheaftGraphQL";
  import { CREATE_BUSINESS_ORDER } from "./mutations.js";
  import ProducerCardWithProducts from "./ProducerCardWithProducts.svelte";
  import SheaftErrors from "./../../services/SheaftErrors";

  const errorsHandler = new SheaftErrors();
  const graphQLInstance = GetGraphQLInstance();
  const routerInstance = GetRouterInstance();

  export let close, onClose, data;

  let isLoading = false;

  const handleSubmit = async (delivery, deliveryHour) => {
    isLoading = true;

    var res = await graphQLInstance.mutate(CREATE_BUSINESS_ORDER, {
      products: data.products,
      producersExpectedDeliveries: data.producersExpectedDeliveries,
      donation: data.donation
    }, errorsHandler.Uuid);

		isLoading = false;

		if (!res.success) {
			//TODO
			return;
		}

    if (onClose) await onClose();
  }

  const getProducerInfo = (producerId) => {
    const products = data.allProducts.filter((p) => p.producer.id === producerId);

    return {
      name: products[0].producer.name,
      products
    };
  }
</script>

<ActionConfirm
  {errorsHandler}
  title="Confirmer ma commande"
  {isLoading}
  {close}
  submit={handleSubmit}
  submitText="Envoyer"
  closeText="Fermer">
	{#each data.producersExpectedDeliveries as producer}
    <div class="mb-2">
      <ProducerCardWithProducts producer={getProducerInfo(producer.producerId)} delivery={producer} />
    </div>
  {/each}
</ActionConfirm>