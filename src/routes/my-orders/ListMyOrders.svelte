<script>
  import {onMount} from "svelte";
  import Loader from "./../../components/Loader.svelte";
  import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
  import GetGraphQLInstance from "./../../services/SheaftGraphQL";
  import GetRouterInstance from "./../../services/SheaftRouter";
  import GetAuthInstance from "./../../services/SheaftAuth";
  import { isLoading, items } from "./store";
  import MyOrderListItem from "./MyOrderListItem.svelte";
  import { MY_ORDERS } from "./queries.js";
  import OrderByDirection from "./../../enums/OrderByDirection";
  import OrderStatusKind from "./../../enums/OrderStatusKind";
  import SearchProductRoutes from "./../search-products/routes";
  import QuickOrderRoutes from "./../quick-orders/routes";
  import Roles from "./../../enums/Roles";
  import SheaftErrors from "../../services/SheaftErrors";
  import ErrorCard from "./../../components/ErrorCard.svelte";

  const errorsHandler = new SheaftErrors();
  const authInstance = GetAuthInstance();
  const graphQLInstance = GetGraphQLInstance();
  const routerInstance = GetRouterInstance();

  const getMyOrders = async () => {
    isLoading.set(true);
    var res = await graphQLInstance.query(MY_ORDERS, {
      orderBy: { createdOn: OrderByDirection.DESC }
    }, errorsHandler.Uuid);
    isLoading.set(false);

    if (!res.success) {
      //TODO
      return;
    }

    items.set(
      res.data.map(p => {
        return {
          ...p,
          active:
            p.status !== OrderStatusKind.Cancelled.Value &&
            p.status !== OrderStatusKind.Refused.Value
        };
      })
    );
  };

  const goToOrderProducts = () => {
    if(authInstance.isInRole([Roles.Store.Value])){
      routerInstance.goTo(QuickOrderRoutes.Purchase);
      return;
    }

    routerInstance.goTo(SearchProductRoutes.Search);
  }

  onMount(async () => {
    await getMyOrders();
  });
</script>

<svelte:head>
  <title>Mes Commandes</title>
</svelte:head>

<TransitionWrapper>
  <ErrorCard {errorsHandler} />
  {#if $isLoading}
    <Loader />
  {:else if $items.length > 0}
    <div class="mx-0 overflow-x-auto w-full xl:w-9/12">
      <div
        class="align-middle inline-block min-w-full overflow-hidden items px-2">
        {#each $items.filter(o => o.active) as order, index}
          {#if index === 0}
            <p class="uppercase pb-2 text-lg">Commandes actives</p>
          {/if}
          <MyOrderListItem {order} />
        {/each}
        <div class="mb-10" />
        {#each $items.filter(o => !o.active) as order, index}
          {#if index === 0}
            <p class="uppercase pb-2 text-lg">Commandes passées</p>
          {/if}
          <MyOrderListItem {order} />
        {/each}
      </div>
    </div>
  {:else}
    <div
      class="text-center text-gray-600 flex w-full h-full justify-center
      items-center">
      <div>
        <p class="text-2xl">Vous n'avez aucune commande.</p>
        <p class="mb-5 text-2xl">Première étape, constituer un panier !</p>
        <button
          on:click={goToOrderProducts}
          aria-label="Accéder à la recherche de produits"
          class="btn btn-lg btn-accent mt-3 m-auto">
          Je me lance
        </button>
      </div>
    </div>
  {/if}
</TransitionWrapper>
