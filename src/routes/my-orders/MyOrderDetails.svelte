<script>
  import Loader from "./../../components/Loader.svelte";
  import CancelMyOrders from "./CancelMyOrders.svelte";
  import { onMount, getContext } from "svelte";
  import Icon from "svelte-awesome";
  import { faTruck, faTruckLoading, faChevronLeft, faHourglass, faCheck, faTimesCircle, faMapMarkerAlt, faCalendar, faClock } from "@fortawesome/free-solid-svg-icons";
  import { format } from "date-fns";
  import { fr } from "date-fns/locale";
  import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
  import GetAuthInstance from "./../../services/SheaftAuth";
  import GetRouterInstance from "./../../services/SheaftRouter";
  import GetGraphQLInstance from "./../../services/SheaftGraphQL";
  import OrderStatusKind from "./../../enums/OrderStatusKind";
  import Roles from "./../../enums/Roles";
  import MyOrderRoutes from "./routes";
  import { GET_MY_ORDER_DETAILS } from "./queries.js";
  import SheaftErrors from "../../services/SheaftErrors";
  import ErrorCard from "./../../components/ErrorCard.svelte";
  import { timeSpanToFrenchHour, encodeQuerySearchUrl, formatMoney } from "./../../helpers/app";

  export let params = {};

  const errorsHandler = new SheaftErrors();
  const { open } = getContext("modal");
  const authInstance = GetAuthInstance();
  const routerInstance = GetRouterInstance();
  const graphQLInstance = GetGraphQLInstance();

  let order = null;
  let isLoading = false;

  const getProcessStep = status => {
    switch (status) {
      case OrderStatusKind.Waiting.Value:
      case OrderStatusKind.Accepted.Value:
      case OrderStatusKind.Refused.Value:
        return 1;
      case OrderStatusKind.Processing.Value:
        return 2;
      case OrderStatusKind.Completed.Value:
        return 3;
      case OrderStatusKind.Shipping.Value:
      case OrderStatusKind.Delivered.Value:
        return 4;
      default:
        return 0;
    }
  };

  const getMyOrder = async id => {
    isLoading = true;
    var res = await graphQLInstance.query(GET_MY_ORDER_DETAILS, { id }, errorsHandler.Uuid);
    isLoading = false;

    if(!res.success){
      //TODO
      routerInstance.goTo(MyOrderRoutes.List);
      return;
    }

    order = res.data;
  }

  const cancelOrder = () => {
    open(CancelMyOrders, {
      orders: [order],
      onClose: async res => {
        if(res.success) {
          routerInstance.goTo(MyOrderRoutes.List);
        }
      }
    });
  }

  onMount(async () => {
    await getMyOrder(params.id);
  })

  $: canCancelOrder =
    order &&
    order.status != OrderStatusKind.Completed.Value &&
    order.status != OrderStatusKind.Cancelled.Value &&
    order.status != OrderStatusKind.Delivered.Value &&
    order.status != OrderStatusKind.Shipping.Value &&
    order.status != OrderStatusKind.Processing.Value &&
    order.status != OrderStatusKind.Refused.Value;
</script>

<svelte:head>
  <title>Mes Commandes</title>
</svelte:head>

<TransitionWrapper>
  <ErrorCard {errorsHandler} />
  {#if !order}
    <Loader />
  {:else}
    <section class="mx-0">
      <div class="mb-3">
        <button
          class="text-gray-600 items-center flex uppercase"
          on:click={() => routerInstance.goTo(MyOrderRoutes.List)}>
          <Icon data={faChevronLeft} scale=".8" class="mr-2 inline" />
          Mes commandes
        </button>
      </div>
      <h1 class="font-semibold uppercase mb-0">Détails de la commande</h1>
      <h4 class="text-gray-600">#{order.reference}</h4>
      <span class="bg-primary h-1 w-20 mt-2 mb-6 block"></span>
    </section>
    {#if order.status == OrderStatusKind.Cancelled.Value}
      <div
        class="py-5 px-8 md:px-5 overflow-x-auto -mx-4 md:mx-0 bg-gray-100
        shadow rounded mb-3">
        <p class="uppercase font-bold leading-none">Commande annulée</p>
        <div class="mt-2">
        <p>Votre commande a été annulée, vous ne pouvez plus interagir avec.</p>
          {#if order.reason}
            <p class="mt-2 font-semibold">Raison : {order.reason}</p>
          {/if}
        </div>
      </div>
    {/if}
    {#if order.status == OrderStatusKind.Refused.Value}
      <div
        class="py-5 px-8 md:px-5 overflow-x-auto -mx-4 md:mx-0 bg-red-100
        shadow rounded mb-3">
        <p class="uppercase font-bold leading-none">Commande refusée</p>
        <div class="mt-2">
        <p>Votre commande a été refusée, vous ne pouvez plus interagir avec.</p>
          {#if order.reason}
            <p class="mt-2 font-semibold">Raison : {order.reason}</p>
          {/if}
        </div>
      </div>
    {/if}
    {#if order.status === OrderStatusKind.Waiting.Value}
      <div
        class="py-5 px-5 overflow-x-auto -mx-4 md:mx-0 bg-blue-100 shadow
        rounded mb-3">
        <p class="uppercase font-bold leading-none">
          Votre commande est en cours de traitement
        </p>
        <div class="mt-2">
          <p>
            Votre commande a été envoyée au producteur. Celui-ci doit
            maintenant définir s'il est apte à la traiter en fonction de son
            stock et de sa capacité de production.
          </p>
          <p>
            Vous recevrez un e-mail dès l'instant où le producteur aura traité
            votre commande.
          </p>
        </div>
      </div>
    {/if}
    {#if order.status == OrderStatusKind.Shipping.Value}
      <div
        class="py-5 px-5 overflow-x-auto -mx-4 md:mx-0 bg-green-100 shadow
        rounded mb-3">
        <p class="uppercase font-bold leading-none">
          Commande en livraison
        </p>
        <div class="mt-2">
          <p>Votre commande est en cours de livraison</p>
        </div>
      </div>
    {/if}
    {#if order.status == OrderStatusKind.Delivered.Value}
      <div
        class="py-5 px-5 overflow-x-auto -mx-4 md:mx-0 bg-green-100 shadow
        rounded mb-3">
        <p class="uppercase font-bold leading-none">Commande récupérée</p>
        <div class="mt-2">
          <p>Vous avez récupéré cette commande.</p>
        </div>
      </div>
    {/if}
    {#if order.status !== OrderStatusKind.Refused.Value && order.status !== OrderStatusKind.Cancelled.Value && order.status !== OrderStatusKind.Delivered.Value && order.expectedDelivery.expectedDeliveryDate}
      <div
        class="py-5 px-5 overflow-x-auto -mx-4 md:mx-0 bg-white shadow
        md:rounded md:mb-3 border-t md:border-none border-gray-400">
        <div class="flex">
          {#if authInstance.isInRole([Roles.Store.Value])}
            <Icon data={faTruck} scale="1" class="mr-5" />
            <div>
              <p class="uppercase font-bold leading-none">
                Livraison de la commande
              </p>
              <div class="mt-2">
                <p class="leading-none">
                  {#if order.status !== OrderStatusKind.Accepted.Value}
                    Si votre commande est acceptée, la livraison aura lieu
                  {:else}Votre commande sera livrée le{/if}
                  <b>
                    {format(
                      new Date(order.expectedDelivery.expectedDeliveryDate),
                      'PPPP',
                      {
                        locale: fr
                      }
                    )}
                  </b>
                  entre
                  <b>{order.expectedDelivery.from}</b>
                  et
                  <b>{order.expectedDelivery.to}</b>
                </p>
              </div>
            </div>
          {:else}
            <div>
              <p class="uppercase font-bold leading-none">
                Où et quand récupérer ma commande ?
              </p>
              <div class="mt-2">
                <div class="flex">
                  <Icon data={faMapMarkerAlt} class="mr-3 w-3 h-3" style="margin-top: 0.5em;" />
                  <div>
                    <p>{order.expectedDelivery.address.line1}</p>
                    {#if order.expectedDelivery.address.line2}  
                      <p>{order.expectedDelivery.address.line2}</p>
                    {/if}
                    <p>{order.expectedDelivery.address.zipcode} {order.expectedDelivery.address.city}</p>
                  </div>
                </div>
                <div>
                  <p class="mb-1">
                    <Icon data={faCalendar} class="mr-2 w-3 h-3" />
                    {format(
                      new Date(order.expectedDelivery.expectedDeliveryDate),
                      'PPPP',
                      {
                        locale: fr
                      }
                    )}
                  </p>
                  <p class="mb-1">
                    <Icon data={faClock} class="mr-2 w-3 h-3" />
                    entre
                    {timeSpanToFrenchHour(order.expectedDelivery.from)}
                    et
                    {timeSpanToFrenchHour(order.expectedDelivery.to)}
                  </p>
                </div>
                <a
                  target="_blank"
                  class="btn btn-lg bg-accent text-white shadow font-semibold mt-2
                  hover:bg-gray-100"
                  style="width: fit-content"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeQuerySearchUrl(order.expectedDelivery.address)}`}>
                  Voir sur Google Maps
                </a>
              </div>
            </div>
          {/if}
        </div>
      </div>
    {/if}
    {#if order.status !== OrderStatusKind.Cancelled.Value && order.status !== OrderStatusKind.Refused.Value}
      <div
        class="px-0 py-5 md:py-0 md:px-5 overflow-x-auto -mx-4 md:mx-0 bg-white
        border-t md:border-l md:border-r border-gray-400">
        <div class="md-stepper-horizontal green mb-5">
          <div
            class="md-step p-0 md:p-6"
            class:active={getProcessStep(order.status) >= 1}>
            <div class="md-step-circle">
              {#if getProcessStep(order.status) <= 1}
                1
              {:else}
                <Icon data={faCheck} class="mb-1" />
              {/if}
            </div>
            <div class="md-step-title text-xs md:text-base">
              {#if order.status == OrderStatusKind.Waiting.Value}En attente{:else}Acceptée{/if}
            </div>
            <div class="md-step-bar-left hidden md:block" />
            <div class="md-step-bar-right hidden md:block" />
          </div>
          <div
            class="md-step p-0 md:p-6"
            class:active={getProcessStep(order.status) >= 2}>
            <div class="md-step-circle">
              {#if getProcessStep(order.status) <= 2}
                <span>2</span>
              {:else}
                <Icon data={faCheck} class="mb-1" />
              {/if}
            </div>
            <div class="md-step-title text-xs md:text-base">Préparation</div>
            <div class="md-step-optional" />
            <div class="md-step-bar-left hidden md:block" />
            <div class="md-step-bar-right hidden md:block" />
          </div>
          <div
            class="md-step p-0 md:p-6"
            class:active={getProcessStep(order.status) >= 3}>
            <div class="md-step-circle">
              {#if getProcessStep(order.status) <= 3}
                <span>3</span>
              {:else}
                <Icon data={faCheck} class="mb-1" />
              {/if}
            </div>
            <div class="md-step-title text-xs md:text-base">Prête</div>
            <div class="md-step-bar-left hidden md:block" />
            <div class="md-step-bar-right hidden md:block" />
          </div>
          <div
            class="md-step p-0 md:p-6"
            class:active={getProcessStep(order.status) >= 4}>
            <div class="md-step-circle">
              {#if getProcessStep(order.status) <= 4 && order.status !== OrderStatusKind.Delivered.Value}
                <span>4</span>
              {:else}
                <Icon data={faCheck} class="mb-1" />
              {/if}
            </div>
            <div class="md-step-title text-xs md:text-base">Récupérée</div>
            <div class="md-step-bar-left hidden md:block" />
            <div class="md-step-bar-right hidden md:block" />
          </div>
        </div>
      </div>
    {/if}
    <div class="px-0 md:px-5 overflow-x-auto -mx-4 md:mx-0 bg-white border-t md:border border-gray-400">
      <div
        class="flex flex-wrap bg-white w-full items-center">
        <div
          class="w-full lg:w-2/6 px-4 py-5 border-b lg:border-b-0
          lg:border-r border-solid border-gray-400">
          <p class="uppercase font-bold pb-2">La commande</p>
          <div class="mt-3">
            <div class="flex items-center mb-2">
              <p>
                <span class="text-gray-600">Référence :</span>
                {order.reference}
              </p>
            </div>
            <div class="flex items-center mb-2">
              <p>
                <span class="text-gray-600">Passée le :</span>
                {format(new Date(order.createdOn), 'PPPPp', { locale: fr })}
              </p>
            </div>
            {#if order.status == OrderStatusKind.Delivered.Value}
              <div class="flex items-center mb-2">
                <p>
                  <span class="text-gray-600">Livrée le :</span>
                  {format(
                    new Date(order.expectedDelivery.deliveredOn),
                    'PPPPp',
                    { locale: fr }
                  )}
                </p>
              </div>
            {/if}
          </div>
        </div>
        <div
          class="w-full lg:w-2/6 px-4 py-5 border-b lg:border-b-0
          lg:border-r border-solid border-gray-400">
          <p class="uppercase font-bold pb-2">Le panier</p>
          <div class="mt-3">
            <div class="flex items-center mb-2">
              <p>
                <span class="text-gray-600">Articles :</span>
                {order.productsCount}
              </p>
            </div>
            <div class="flex items-center mb-2">
              <p>
                <span class="text-gray-600">Montant :</span>
                {formatMoney(order.totalOnSalePrice)}
              </p>
            </div>
          </div>
        </div>
        <div
          class="w-full lg:w-2/6 border-b md:border-b-0 border-solid
          border-gray-400 px-4 py-5">
          <p class="uppercase font-bold pb-2">Le producteur</p>
          <div class="mt-3">
            <div>
              <p class="mb-2">
                <span class="text-gray-600">Nom :</span>
                {order.vendor.name}
              </p>
              <p class="text-base mb-2">
                <a href="mailto:{order.vendor.email}">{order.vendor.email}</a>
              </p>
              <p class="text-base mb-2">
                {#if order.vendor.phone}
                  <span class="text-gray-600">Tél :</span>
                  <a href="tel:{order.vendor.phone}">{order.vendor.phone}</a>
                {/if}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="px-0 md:px-5 overflow-x-auto -mx-4 md:-mx-5 md:mb-3">
      <div class="flex flex-wrap bg-white w-full lg:w-auto px-4 lg:px-8">
        <div class="w-full">
          <section>
            <div class="-mx-4 lg:-mx-8">
              <table class="min-w-full leading-normal">
                <thead>
                  <tr>
                    <th
                      class="px-4 md:px-8 py-3 border-b md:border-l border-gray-400
                      bg-gray-100 text-left text-xs font-semibold text-gray-600
                      uppercase tracking-wider">
                      Produit
                    </th>
                    <th
                      class="px-4 md:px-8 py-3 border-b border-gray-400
                      bg-gray-100 text-left text-xs font-semibold text-gray-600
                      uppercase tracking-wider hidden lg:table-cell">
                      Prix unitaire TTC
                    </th>
                    <th
                      class="px-4 md:px-8 py-3 border-b border-gray-400
                      bg-gray-100 text-center md:text-left text-xs font-semibold
                      text-gray-600 uppercase tracking-wider">
                      Qté
                    </th>
                    <th
                      class="px-4 md:px-8 py-3 border-b md:border-r border-gray-400
                      bg-gray-100 text-right text-xs font-semibold text-gray-600
                      uppercase tracking-wider">
                      Prix Total TTC
                    </th>
                  </tr>
                </thead>
                <tbody class="border-b md:border border-gray-400">
                  {#each order.products as line, index}
                    <tr>
                      <td
                        class="px-4 md:px-8 py-5 border-b border-gray-200
                        bg-white text-sm lg:text-base">
                        <div class="items-center">
                          <p>{line.name}</p>
                          <p class="whitespace-no-wrap block lg:hidden">
                            {formatMoney(line.unitOnSalePrice)} / unité
                          </p>
                          <p class="text-gray-600 whitespace-no-wrap">
                            #{line.reference}
                          </p>
                        </div>
                      </td>
                      <td
                        class="px-4 md:px-8 py-5 border-b border-gray-200
                        bg-white text-sm lg:text-base hidden lg:table-cell">
                        <p class="whitespace-no-wrap">
                          {formatMoney(line.unitOnSalePrice)}
                        </p>
                      </td>
                      <td
                        class="px-4 md:px-8 py-5 border-b border-gray-200
                        bg-white text-sm lg:text-base text-center md:text-left">
                        <p class="whitespace-no-wrap">{line.quantity}</p>
                      </td>
                      <td
                        class="px-4 md:px-8 py-5 border-b border-gray-200
                        bg-white text-sm lg:text-base text-right">
                        <p class="whitespace-no-wrap">
                          {formatMoney(line.totalOnSalePrice)}
                        </p>
                      </td>
                    </tr>
                  {/each}
                  <tr>
                    <td
                      class="bg-white px-4 md:px-8
                      py-5 text-lg text-right uppercase font-semibold md:hidden table-cell"
                      colspan="2">
                      Total TTC:
                    </td>
                    <td
                      class="bg-white px-4 md:px-8
                      py-5 text-lg text-right uppercase font-semibold md:table-cell hidden"
                      colspan="3">
                      Total TTC:
                    </td>
                    <td
                      class="bg-white px-4 md:px-8
                      py-5 text-lg text-right
                      font-bold"
                      colspan="1">
                      {formatMoney(order.totalOnSalePrice)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
    <div
      class:hidden={!canCancelOrder}
      class="bg-white shadow md:rounded overflow-hidden md:mb-3 -mx-4 md:mx-0">
      <div class="px-4 md:px-8 py-5">
        <p class="uppercase font-bold">Annuler la commande</p>
        <div class="mt-5">
          <p>
            Vous pouvez annuler votre commande tant que celle-ci n'est pas en
            cours de préparation.
          </p>
          <p>
            Attention : annuler un certain nombre de commandes par mois peut
            vous faire perdre des points.
          </p>
          <button
            on:click={cancelOrder}
            class="btn btn-lg btn-accent shadow mt-3 font-semibold
            hover:bg-gray-100">
            Annuler ma commande
          </button>
        </div>
      </div>
    </div>
  {/if}
</TransitionWrapper>

<style>
  .md-stepper-horizontal {
    display: table;
    width: 100%;
    margin: 0 auto;
  }
  .md-stepper-horizontal .md-step {
    display: table-cell;
    position: relative;
  }
  .md-stepper-horizontal .md-step:first-child .md-step-bar-left,
  .md-stepper-horizontal .md-step:last-child .md-step-bar-right {
    display: none;
  }
  .md-stepper-horizontal .md-step .md-step-circle {
    width: 30px;
    height: 30px;
    margin: 0 auto;
    background-color: #999999;
    border-radius: 50%;
    text-align: center;
    line-height: 30px;
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
  }
  .md-stepper-horizontal.green .md-step.active .md-step-circle {
    background-color: #00786a;
  }
  .md-stepper-horizontal.orange .md-step.active .md-step-circle {
    background-color: #f96302;
  }
  .md-stepper-horizontal .md-step.active .md-step-circle {
    background-color: rgb(33, 150, 243);
  }
  .md-stepper-horizontal .md-step.done .md-step-circle:before {
    font-family: "FontAwesome";
    font-weight: 100;
    content: "\f00c";
  }
  .md-stepper-horizontal .md-step.done .md-step-circle *,
  .md-stepper-horizontal .md-step.editable .md-step-circle * {
    display: none;
  }
  .md-stepper-horizontal .md-step.editable .md-step-circle {
    -moz-transform: scaleX(-1);
    -o-transform: scaleX(-1);
    -webkit-transform: scaleX(-1);
    transform: scaleX(-1);
  }
  .md-stepper-horizontal .md-step.editable .md-step-circle:before {
    font-family: "FontAwesome";
    font-weight: 100;
    content: "\f040";
  }
  .md-stepper-horizontal .md-step .md-step-title {
    margin-top: 16px;
    font-weight: 600;
  }
  .md-stepper-horizontal .md-step .md-step-title,
  .md-stepper-horizontal .md-step .md-step-optional {
    text-align: center;
    color: rgba(0, 0, 0, 0.26);
  }
  .md-stepper-horizontal .md-step.active .md-step-title {
    font-weight: 600;
    color: #205164;
  }
  .md-stepper-horizontal .md-step.active.done .md-step-title,
  .md-stepper-horizontal .md-step.active.editable .md-step-title {
    font-weight: 600;
  }
  .md-stepper-horizontal .md-step .md-step-optional {
    font-size: 12px;
  }
  .md-stepper-horizontal .md-step.active .md-step-optional {
    color: rgba(0, 0, 0, 0.54);
  }
  .md-stepper-horizontal .md-step .md-step-bar-left,
  .md-stepper-horizontal .md-step .md-step-bar-right {
    position: absolute;
    top: 36px;
    height: 1px;
    border-top: 1px solid #dddddd;
  }
  .md-stepper-horizontal .md-step .md-step-bar-right {
    right: 0;
    left: 50%;
    margin-left: 20px;
  }
  .md-stepper-horizontal .md-step .md-step-bar-left {
    left: 0;
    right: 50%;
    margin-right: 20px;
  }
</style>
