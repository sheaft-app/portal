<script>
  import { faCheck } from "@fortawesome/free-solid-svg-icons";;
  import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
  import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
  import { CREATE_AGREEMENT } from "./mutations.js";
  import SheaftErrors from "./../../services/SheaftErrors";

  const errorsHandler = new SheaftErrors();

  export let onClosed, close, producer, storeId;

  const graphQLInstance = GetGraphQLInstance();

  let isLoading = false;

  const handleSubmit = async () => {
    isLoading = true;
    var res = await graphQLInstance.mutate(CREATE_AGREEMENT, {
      storeId,
      deliveryModeId: producer.delivery.id
    });

    isLoading = false;

    if (!res.success) {
      // todo
      return;
    }

    return await closeModal(res);
  }

  async function closeModal(obj) {
    close();
    if (onClosed) await onClosed(obj);
  }
</script>

<ActionConfirm
  {errorsHandler}
  title='Demander un accord'
  level="success"
  icon={faCheck}
  submit={handleSubmit}
  {isLoading}
  submitText="Confirmer"
  closeText="Annuler"
  {close}>
  <p class="leading-5">
    Vous vous apprêtez à demander un accord de partenariat avec {producer.name}
  </p>
  <p class="leading-5">
    Le producteur sera automatiquement notifié de votre demande.
  </p>
</ActionConfirm>
