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

  $: activeAgreements = agreements.filter(
    a =>
      a.status === AgreementStatusKind.Accepted.Value ||
      a.status === AgreementStatusKind.WaitingForProducerApproval.Value ||
      a.status === AgreementStatusKind.WaitingForStoreApproval.Value
  );

  $: passedAgreements = agreements.filter(
    a =>
      a.status !== AgreementStatusKind.Accepted.Value &&
      a.status !== AgreementStatusKind.WaitingForProducerApproval.Value &&
      a.status !== AgreementStatusKind.WaitingForStoreApproval.Value
  );

  onMount(async () => {
    await getAgreements();
  });
</script>

<svelte:head>
  <title>Mes Accords</title>
</svelte:head>

<TransitionWrapper>
  <ErrorCard {errorsHandler} />
  {#if isLoading}
    <Loader />
  {:else if agreements.length > 0}
    <div class="mx-0 overflow-x-auto w-full xl:w-9/12">
      <div
        class="align-middle inline-block min-w-full overflow-hidden items px-2">
        <div class="mb-10">
          {#each activeAgreements as agreement, index}
            {#if index === 0}
              <p class="uppercase pb-2 text-lg">Accords actifs</p>
            {/if}
            <AgreementsListItem {agreement} />
          {/each}
        </div>
        {#each passedAgreements as agreement, index}
          {#if index === 0}
            <p class="uppercase pb-2 text-lg">Accords passés</p>
          {/if}
          <AgreementsListItem {agreement} />
        {/each}
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