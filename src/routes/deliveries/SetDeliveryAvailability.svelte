<script>
  import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
  import { getContext } from "svelte";
  import { SET_DELIVERY_AVAILABILITY } from "./mutations.js";
  import SheaftErrors from "./../../services/SheaftErrors";

  export let close, onClose, delivery;

  const errorsHandler = new SheaftErrors();
  const { mutate, isLoading } = getContext("api");

  const handleSubmit = async () => await mutate({
    mutation: SET_DELIVERY_AVAILABILITY,
    variables: { ids: [delivery.id], available: !delivery.available },
    errorsHandler,
    success: (res) => handleClose(res),
    successNotification: `Le créneau a bien été ${delivery.available ? 'désactivé' : 'activé'}`,
    errorNotification: `Impossible ${delivery.available ? 'de désactiver' : 'd\'activer'} ce créneau`
  });
    
  const handleClose = async res => {
    close();
    await onClose(res);
  };
</script>

<ActionConfirm
  title={delivery.available ? 'Désactiver' : 'Activer'}
  level={delivery.available ? 'warning' : "success"}
  isLoading={$isLoading}
  {errorsHandler}
  submit={handleSubmit}
  close={() => handleClose({ success: false, data: null })}>  
  <p>
    Cette opération {delivery.available ? 'désactivera' : 'activera'} cette livraison.
  </p>
</ActionConfirm>
