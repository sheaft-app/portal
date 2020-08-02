<script>
  import { faCheck } from "@fortawesome/free-solid-svg-icons";;
  import SelectTime from "./SelectTime.svelte";
  import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
  import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
  import { CREATE_AGREEMENT } from "./mutations.js";
  import SheaftErrors from "./../../services/SheaftErrors";

  const errorsHandler = new SheaftErrors();

  export let onClosed, close, store;

  const graphQLInstance = GetGraphQLInstance();

  let selectedDelivery = null;
  let isLoading = false;
  let isValid = false;

  $: isValid = selectedDelivery && selectedDelivery.selectedHours.length > 0;

  const handleSubmit = async () => {
    isLoading = true;
    var res = await graphQLInstance.mutate(CREATE_AGREEMENT, {
      storeId: store.id,
      selectedHours: selectedDelivery.selectedHours.map((selectedHour) => {
        return {
          days: [selectedHour.day],
          from: selectedHour.from,
          to: selectedHour.to
        }
      }),
      deliveryModeId: selectedDelivery.deliveryId
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
  valid={isValid}
  submitText="Confirmer"
  closeText="Annuler"
  {close}>
  <p class="leading-5 text-gray-500">
    Vous vous apprêtez à demander un accord de partenariat avec {store.name}
  </p>
  <p class="leading-5 text-gray-500">
    Le magasin sera automatiquement notifié de votre demande.
  </p>
  <SelectTime bind:selectedDelivery={selectedDelivery} />
</ActionConfirm>
