<script>
  import format from "date-fns/format";
  import setHours from "date-fns/setHours";
  import { fr } from "date-fns/locale";
  import DatePickerWrapper from "./../../components/controls/DatePickerWrapper.svelte";
  import { faCheck } from "@fortawesome/free-solid-svg-icons";
  import { onMount } from "svelte";
  import { getClient, query, mutate } from "svelte-apollo";
  import { push } from "svelte-spa-router";
  import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
  import { EXPORT_PICKING_FROM_ORDERS } from "./mutations.js";
  import GetNotificationsInstance from "./../../services/SheaftNotifications.js";
  import GetAuthInstance from "./../../services/SheaftAuth.js";
  import SheaftErrors from "./../../services/SheaftErrors";

  const errorsHandler = new SheaftErrors();

  export let onClose, close, purchaseOrders;
  const client = getClient();
  const notificationsInstance = GetNotificationsInstance();

  let date = new Date(),
    moment = null,
    dateChosen = false;
  let purchaseOrderIds = purchaseOrders.map((object, key) => {
    return object.id;
  });
  let isLoading = false;

  let name = null;

  $: dateSelectionRequired =
    purchaseOrders.filter(o => !o.expectedDelivery.expectedDeliveryDate).length > 0;

  $: valid =
    !dateSelectionRequired ||
    (dateSelectionRequired && dateChosen !== false && moment !== null);

  function getStatus(order) {
    switch (order.status) {
      case "WAITING":
        return "En attente";
      case "ACCEPTED":
        return "Acceptée";
      case "PROCESSING":
        return "En préparation";
      default:
        return "";
    }
  }

  function getUser(order) {
    if (GetAuthInstance().isInRole(["PRODUCER"])) {
      return order.sender;
    } else {
      return order.vendor;
    }
  }

  async function submit() {
    isLoading = true;
    const hours = moment === "am" ? 9 : 14;
    const expectedDeliveryDate = dateSelectionRequired
      ? format(setHours(new Date(date), hours), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")
      : null;

    const mutation = {
      mutation: EXPORT_PICKING_FROM_ORDERS,
      variables: {
        input: { purchaseOrderIds, expectedDeliveryDate, name }
      }
    };

    var result = await mutate(client, mutation);
    if (
      result &&
      result.data &&
      result.data.exportPickingFromOrders &&
      result.data.exportPickingFromOrders.id
    ) {
      notificationsInstance.success(
        "Votre demande de création d'un bon de préparation a bien été prise en compte, vous pouvez continuer à utiliser notre plateforme en attendant !"
      );
    } else {
      notificationsInstance.error(
        "Une erreur est survenue pendant    la demande de création du bon de préparation."
      );
    }

    isLoading = false;

    return await closeModal(result);
  }

  async function closeModal(obj) {
    close();
    await onClose(obj);
  }
</script>

<ActionConfirm
  {errorsHandler}
  title="Créer un bon de préparation"
  {submit}
  {isLoading}
  close={() => handleClose({ success: false, data: null })}
  level="success"
  submitText="Préparer"
  icon={faCheck}
  {valid}
  closeText="Fermer">
  <p class="py-2 leading-5">
    Voici les commandes qui vont être regroupées sur un même bon de préparation
  </p>
  <ul class="py-2 list-inside list-disc">
    {#each purchaseOrders as order}
      <li>
        {getUser(order).name + ' - ' + order.reference + ' : ' + getStatus(order)}
      </li>
    {/each}
  </ul>
  <div>
    <p class="py-2 leading-5">
      Vous pouvez spécifier un nom pour la création du bon de préparation pour
      faciliter son suivi dans le module dédié.
    </p>
    <input
      type="text"
      bind:value={name}
      placeholder="Nom du traitement (optionnel)" />
  </div>
  {#if dateSelectionRequired}
    <div class="py-2">
      <p class="leading-5">
        Certaines des commandes sélectionnées n'ont pas encore été acceptées,
        veuillez sélectionner une date de livraison estimée pour celles-ci.
      </p>
      <p class="py-2 leading-5">
        Les clients seront automatiquement notifiés de cette information.
      </p>
      <form>
        <div class="mt-2" style="width: fit-content;">
          <label
            class="block uppercase tracking-wide text-xs font-bold
            mb-2"
            for="grid-delivery">
            Date de livraison *
          </label>
          <DatePickerWrapper bind:selected={date} bind:dateChosen />
        </div>
        <div class="mt-5 sm:mt-3 mb-2">
          <label
            class="block uppercase tracking-wide text-xs font-bold
            mb-2"
            for="grid-delivery">
            Moment de la journée *
          </label>
          <div class="inline-flex shadow" style="width: 50%;">
            <button
              on:click={() => (moment = 'am')}
              type="button"
              class:selected={moment === 'am'}
              class="bg-white hover:bg-gray-100 border-r border-gray-400
              border-solid py-2 px-4 rounded-l transition
              duration-200 w-full ease-in-out">
              Matin
            </button>
            <button
              on:click={() => (moment = 'pm')}
              type="button"
              class:selected={moment === 'pm'}
              class="bg-white hover:bg-gray-100 py-2 px-4
              rounded-r transition duration-200 w-full ease-in-out">
              Après-midi
            </button>
          </div>
        </div>
      </form>
    </div>
  {/if}

</ActionConfirm>

<style lang="scss">
  button {
    &.selected {
      background-color: #ff4081;
      color: #ffffff;
    }
  }
</style>
