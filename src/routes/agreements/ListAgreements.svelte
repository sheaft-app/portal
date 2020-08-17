<script>
  import { onMount } from "svelte";
  import Icon from "svelte-awesome";
  import GetAuthInstance from "./../../services/SheaftAuth.js";
  import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
  import GetRouterInstance from "./../../services/SheaftRouter.js";
  import SearchStoreRoutes from "./../search-stores/routes.js";
  import SearchProducerRoutes from "./../search-producers/routes.js";
  import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
  import Loader from "./../../components/Loader.svelte";
  import AgreementsListItem from "./AgreementsListItem.svelte";
  import { selectedItem } from "./../../stores/app.js";
  import { GET_AGREEMENTS } from "./queries.js";
  import StoreDetails from "./../search-stores/StoreDetails.svelte";
  import ProducerDetails from "./../search-producers/ProducerDetails.svelte";
  import Roles from "./../../enums/Roles";
  import AgreementStatusKind from "./../../enums/AgreementStatusKind";
  import SheaftErrors from "../../services/SheaftErrors";
  import ErrorCard from "./../../components/ErrorCard.svelte";

  const errorsHandler = new SheaftErrors();
  const graphQLInstance = GetGraphQLInstance();
  const routerInstance = GetRouterInstance();
  const authInstance = GetAuthInstance();

  let agreements = [];
  let isLoading = false;
  let selected = "active";
  let displayedAgreements = [];

  const getAgreements = async () => {
    isLoading = true;
    var res = await graphQLInstance.query(GET_AGREEMENTS, null, errorsHandler.Uuid);
    isLoading = false;

    if (!res.success) {
      // todo
      return;
    }

    agreements = res.data;
  };

  const changeAgreementsDisplay = () => {
    switch (selected) {
      case "active":
        displayedAgreements = activeAgreements;
        break;
      case "passed":
        displayedAgreements = passedAgreements;
        break;
      default:
        console.error("Type not supported");
    }
  }

  const selectAgreementsDisplay = (type) => {
    selected = type;
    changeAgreementsDisplay(type);
  }

  onMount(async () => {
    await getAgreements();

    if (agreements.length === 0) {
      return;
    } else if (activeAgreements.length >= 1) {
      selected = "active"
    } else {
      selected = "passed";
    }

    selectAgreementsDisplay(selected);
  });

  $: activeAgreements = agreements.filter(a =>
    a.status === AgreementStatusKind.Accepted.Value ||
    a.status === AgreementStatusKind.WaitingForProducerApproval.Value ||
    a.status === AgreementStatusKind.WaitingForStoreApproval.Value
  );

  $: passedAgreements = agreements.filter(a => 
    a.status !== AgreementStatusKind.Accepted.Value &&
    a.status !== AgreementStatusKind.WaitingForProducerApproval.Value &&
    a.status !== AgreementStatusKind.WaitingForStoreApproval.Value
  );
  
  $: hiddenNavigation = activeAgreements.length < 1 || passedAgreements.length < 1;
</script>

<svelte:head>
  <title>Mes Accords</title>
</svelte:head>

<TransitionWrapper>
  <ErrorCard {errorsHandler} />
  <h1 class="mb-6 hidden md:block">Accords</h1>
  {#if isLoading}
    <Loader />
  {:else if agreements.length > 0}
    {#if !hiddenNavigation}
      <div class="text-lg justify-center button-group mb-5 w-full -mx-1 md:mx-0">
        <button
          on:click={() => selectAgreementsDisplay("active")}
          type="button"
          class:selected={selected === "active"}
          class:disabled={isLoading}>
          Actifs
        </button>
        <button
          on:click={() => selectAgreementsDisplay("passed")}
          type="button"
          class:selected={selected === "passed"}
          class:disabled={isLoading}>
          Historique
        </button>
      </div>
    {/if}
    <div class="-mx-4 md:mx-0 md:overflow-x-auto md:w-full">
      <div
        class="align-middle inline-block min-w-full overflow-hidden items px-1">
        <div
          class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3
          md:gap-3 -mx-4 md:mx-0 mb-10">
          {#each displayedAgreements as agreement, index}
            <AgreementsListItem {agreement} />
          {/each}
        </div>
      </div>
    </div>
  {:else}
    <div
      class="text-center text-gray-600 flex w-full h-full justify-center
      items-center">
      <div>
        <p class="text-2xl">Vous n'avez aucun accord.</p>
        {#if authInstance.isInRole([Roles.Producer])}
          <p class="mb-5 text-2xl">Première étape, trouver des magasins !</p>
          <button
            on:click={() => routerInstance.goTo(SearchStoreRoutes.Search)}
            aria-label="Accéder à la recherche de magasins"
            class="btn btn-lg btn-accent mt-3 m-auto">
            Je me lance
          </button>
        {/if}

        {#if authInstance.isInRole([Roles.Store])}
          <p class="mb-5 text-2xl">Première étape, trouver des producteurs !</p>
          <button
            on:click={() => routerInstance.goTo(SearchProducerRoutes.Search)}
            aria-label="Accéder à la recherche de producteurs"
            class="btn btn-lg btn-accent mt-3 m-auto">
            Je me lance
          </button>
        {/if}
      </div>
    </div>
  {/if}
</TransitionWrapper>