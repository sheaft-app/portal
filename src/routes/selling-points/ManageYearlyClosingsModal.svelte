<script>
  import { faCheck } from "@fortawesome/free-solid-svg-icons";
  import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
	import GetAuthInstance from "../../services/SheaftAuth";
  import { GET_BUSINESS_CLOSINGS } from "./queries.js";
  import { UPDATE_BUSINESS_CLOSINGS } from "./mutations.js";
  import GetNotificationsInstance from "./../../services/SheaftNotifications.js";
  import GetGraphQLInstance from "./../../services/SheaftGraphQL";
  import SheaftErrors from "./../../services/SheaftErrors";
  import ClosingDates from "./../../components/ClosingDates.svelte";
  import { normalizeClosingDates, denormalizeClosingDates } from "../../helpers/app";
  import { onMount } from "svelte";
  import Loader from "../../components/Loader.svelte";
  
  const errorsHandler = new SheaftErrors();
  const notificationsInstance = GetNotificationsInstance();
  const graphQLInstance = GetGraphQLInstance();
	const authInstance = GetAuthInstance();
  
  export let onClose, close;

  let isLoading = false;
  let isInitializing = true;
  let closings = [];

  $: valid = true;

  onMount(async () => {
    const result = await graphQLInstance.query(GET_BUSINESS_CLOSINGS);

    if (!result.success) {
      // todo
      isInitializing = false;
      return;
    }

    closings = denormalizeClosingDates(result.data);
    isInitializing = false;
  });

  async function submit() {
      isLoading = true;
  
      const result = await graphQLInstance.mutate(UPDATE_BUSINESS_CLOSINGS, {
        id: authInstance.user.profile.sub,
        closings: normalizeClosingDates(closings)
      },  errorsHandler.Uuid);
  
      if (!result)
          notificationsInstance.error(
              "Une erreur est survenue pendant la création de la fermeture."
              );
      else notificationsInstance.success(
              "Vos fermetures annuelles ont bien été mises à jour !"
              );
  
      
      isLoading = false;
  
      return await closeModal(result.data);
  }

  async function closeModal(res) {
    graphQLInstance.clearApolloCache(GET_BUSINESS_CLOSINGS); 

    if (onClose) {
      onClose(res);
    }
    
    close();
  }
</script>
  
<ActionConfirm
    {errorsHandler}
    title="Gérer les fermetures annuelles"
    {submit}
    {isLoading}
    close={closeModal}
    submitText="Sauvegarder"
    icon={faCheck}
    {valid}
    closeText="Fermer">
    <p class="pt-2 pb-1 leading-5">
      Renseignez ici les fermetures annuelles de votre exploitation.</p>
    <p class="pb-2 leading-5">Les clients ne pourront pas commander des produits à récupérer pendant ces périodes.
    </p>
    {#if isInitializing}
      <Loader />
    {:else}
      <ClosingDates bind:closings />
    {/if}
  </ActionConfirm>