<script>
  import Loader from "./../../components/Loader.svelte";
  import { onMount, getContext } from "svelte";
  import Icon from "svelte-awesome";
  import AcceptPurchaseOrders from "./AcceptPurchaseOrders.svelte";
  import RefusePurchaseOrders from "./RefusePurchaseOrders.svelte";
  import CancelPurchaseOrders from "./CancelPurchaseOrders.svelte";
  import ProcessPurchaseOrders from "./ProcessPurchaseOrders.svelte";
  import CompletePurchaseOrders from "./CompletePurchaseOrders.svelte";
	import CreatePickingOrders from "./CreatePickingOrders.svelte";
  import DeliverPurchaseOrders from "./DeliverPurchaseOrders.svelte";
  import { format } from "date-fns";
  import { fr } from "date-fns/locale";
  import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
  import GetGraphQLInstance from "./../../services/SheaftGraphQL";
  import GetRouterInstance from "./../../services/SheaftRouter";
  import { GET_ORDER_DETAILS } from "./queries.js";
  import { 
    canCreatePickingOrder,
    canCancelOrder,
    canAcceptOrder,
    canRefuseOrder,
    canProcessOrder,
    canCompleteOrder,
    canDeliverOrder,
    canShipOrder
  } from "./validators";
  import {
    faTimes,
    faBackspace,
    faCheckDouble,
    faCheck,
    faTruck,
    faTruckLoading,
    faClipboardCheck,
    faPlay,
    faChevronLeft,
    faTimesCircle,
    faHourglass,
    faCircleNotch,
faFileExport
  } from "@fortawesome/free-solid-svg-icons";
  import PurchaseOrderRoutes from "./routes";
  import OrderStatusKind from "./../../enums/OrderStatusKind";
  import SheaftErrors from "../../services/SheaftErrors";
  import ErrorCard from "./../../components/ErrorCard.svelte";

  export let params = {};

  const errorsHandler = new SheaftErrors();
  const { open } = getContext("modal");
  const graphQLInstance = GetGraphQLInstance();
  const routerInstance = GetRouterInstance();

  let order = null;
  let isLoading = false;

  const getPurchaseOrder = async id => {
    isLoading = true;
    var res = await graphQLInstance.query(
      GET_ORDER_DETAILS,
      { id },
      errorsHandler.Uuid
    );
    isLoading = false;

    if (!res.success) {
      //TODO;
      routerInstance.goTo(PurchaseOrderRoutes.List);
      return;
    }

    order = res.data;
  };

  onMount(async () => {
    await getPurchaseOrder(params.id);
  });

  function createPickingOrder() {
    handleOrdersModal(CreatePickingOrders, [order]);
  }

  const cancelOrder = () => {
    handleOrdersModal(CancelPurchaseOrders, [order]);
  };

  const refuseOrder = () => {
    handleOrdersModal(RefusePurchaseOrders, [order]);
  };

  const acceptOrder = () => {
    handleOrdersModal(AcceptPurchaseOrders, [order]);
  };

  const processOrder = () => {
    handleOrdersModal(ProcessPurchaseOrders, [order]);
  };

  const completeOrder = () => {
    handleOrdersModal(CompletePurchaseOrders, [order]);
  };

  const deliverOrder = () => {
    handleOrdersModal(DeliverPurchaseOrders, [order]);
  };

  const handleOrdersModal = (modal, items) => {
    open(modal, {
      purchaseOrders: items,
      onClose: async res => {
        if (res.success) {
          var s = res.data[0];
          order.status = s.status;
          order.reason = s.reason;
          order.expectedDelivery.expectedDeliveryDate =
            s.expectedDelivery.expectedDeliveryDate;
        }
      }
    });
  };
</script>

<svelte:head>
  <title>Détails de la commande</title>
</svelte:head>

<TransitionWrapper>
  <ErrorCard {errorsHandler} />
  {#if !order}
    <Loader />
  {:else}
    <section class="mx-0 pb-5">
      <div class="mb-3">
        <button
          class="text-gray-600 items-center flex uppercase"
          on:click={() => routerInstance.goBack()}>
          <Icon data={faChevronLeft} scale=".8" class="mr-2 inline" />
          Retour
        </button>
      </div>
      <div class="flex flex-wrap items-center">
        <div>
          <h1 class="text-2xl lg:text-3xl mb-0">Détails de la commande</h1>
        </div>
      </div>
    </section>
    {#if order.status == OrderStatusKind.Cancelled.Value}
      <div
        class="py-5 px-3 md:px-8 overflow-x-auto -mx-4 md:mx-0 bg-orange-400
        shadow rounded mb-5 text-white">
        <div class="flex">
          <Icon data={faTimesCircle} scale="1.5" class="mr-5" />
          <div>
            <p class="uppercase font-bold leading-none">Commande annulée</p>
            <div class="mt-2">
              {#if order.reason}
                <p>Cette commande a été annulée pour la raison suivante :</p>
                <p class="mt-2 font-semibold">{order.reason}</p>
              {:else}
                <p>
                  Cette commande a été annulée, vous ne pouvez plus interagir
                  avec.
                </p>
              {/if}
            </div>
          </div>
        </div>
      </div>
    {/if}
    {#if order.status == OrderStatusKind.Refused.Value}
      <div
        class="py-5 px-3 md:px-8 overflow-x-auto -mx-4 md:mx-0 bg-red-400
        text-white shadow rounded mb-5">
        <div class="flex">
          <Icon data={faTimesCircle} scale="1.5" class="mr-5" />
          <div>
            <p class="uppercase font-bold leading-none">Commande refusée</p>
            <div class="mt-2">
              {#if order.reason}
                <p>Cette commande a été refusée pour la raison suivante :</p>
                <p>{order.reason}</p>
              {:else}
                <p>Cette commande a été refusée.</p>
              {/if}
            </div>
          </div>
        </div>
      </div>
    {/if}
    {#if order.status !== OrderStatusKind.Refused.Value && order.status !== OrderStatusKind.Cancelled.Value && order.expectedDelivery.expectedDeliveryDate && order.status != OrderStatusKind.Delivered.Value}
      <div
        class="py-5 px-3 md:px-8 overflow-x-auto -mx-4 md:mx-0 bg-white shadow
        rounded mb-5">
        <div class="flex">
          {#if order.status == 'COMPLETED'}
            <Icon data={faCheck} scale="1.5" class="mr-5 text-green-400" />
          {:else}
            <Icon data={faCircleNotch} scale="1.5" class="mr-5 text-blue-400" />
          {/if}
          <div>
            <div class="mt-2">
              <p class="leading-none">
                La commande est à livrer le
                <b class="text-blue-400">
                  {format(
                    new Date(order.expectedDelivery.expectedDeliveryDate),
                    'PPPP',
                    {
                      locale: fr
                    }
                  )}
                </b>
                entre
                <b class="text-blue-400">{order.expectedDelivery.from}</b>
                et
                <b class="text-blue-400">{order.expectedDelivery.to}</b>
              </p>
              {#if order.expectedDelivery.address}
                <p>
                  Adresse de livraison :
                  <b class="text-blue-400">
                    {order.expectedDelivery.address.line1}, {order.expectedDelivery.address.zipcode}
                    {order.expectedDelivery.address.city}
                  </b>
                </p>
              {/if}
            </div>
          </div>
        </div>
      </div>
    {/if}
    {#if order.status == OrderStatusKind.Shipping.Value}
      <div
        class="py-5 px-3 md:px-8 overflow-x-auto -mx-4 md:mx-0 bg-white shadow
        rounded mb-5">
        <div class="flex">
          <Icon data={faTruck} scale="1.5" class="mr-5 text-blue-400" />
          <div>
            <p class="uppercase font-bold leading-none">
              Commande en cours de livraison
            </p>
            <div class="mt-2">
              <p>Cette commande est en cours de livraison.</p>
            </div>
          </div>
        </div>
      </div>
    {/if}
    {#if order.status == OrderStatusKind.Delivered.Value}
      <div
        class="py-5 px-3 md:px-8 overflow-x-auto -mx-4 md:mx-0 bg-white shadow
        rounded mb-5">
        <div class="flex">
          <Icon data={faTruckLoading} scale="1.5" class="mr-5 text-green-400" />
          <div>
            <p class="uppercase font-bold leading-none">Commande livrée</p>
            <div class="mt-2">
              <p>
                Cette commande a été livrée, vous ne pouvez plus interagir avec.
              </p>
            </div>
          </div>
        </div>
      </div>
    {/if}
    {#if order.status === OrderStatusKind.Waiting.Value}
      <div
        class="py-5 px-3 md:px-8 overflow-x-auto -mx-4 md:mx-0 bg-white shadow
        rounded mb-5">
        <div class="flex">
          <Icon data={faHourglass} scale="1.3" class="mr-5 text-orange-400" />
          <div>
            <p class="uppercase font-bold leading-none">
              Cette commande est en attente d'acceptation de votre part.
            </p>
          </div>
        </div>
      </div>
    {/if}
    {#if order.status !== OrderStatusKind.Refused.Value && order.status !== OrderStatusKind.Cancelled.Value}
      <div
        class="bg-white shadow border-b border-solid border-gray-300 mt-5 px-0
        md:px-5 py-5 overflow-x-auto -mx-4 md:mx-0">
        <div class="flex">
          <button
            on:click={createPickingOrder}
            class:hidden={!canCreatePickingOrder(order)}
            class="py-1 px-3 rounded items-center flex transition duration-300
            ease-in-out text-indigo-500">
            <Icon data={faFileExport} class="mr-2 hidden lg:inline" />
            <span>Créer un bon de préparation</span>
          </button>
          <button
            on:click={acceptOrder}
            class:hidden={!canAcceptOrder(order)}
            class="py-1 px-3 rounded items-center flex transition duration-300
            ease-in-out text-green-500">
            <Icon data={faCheck} class="mr-2 hidden lg:inline" />
            <span>Accepter la commande</span>
          </button>
          <button
            on:click={refuseOrder}
            class:hidden={!canRefuseOrder(order)}
            class="py-1 px-3 rounded items-center flex transition duration-300
            ease-in-out text-red-500">
            <Icon data={faTimes} class="mr-2 hidden lg:inline" />
            <span>Refuser la commande</span>
          </button>
          <button
            class:hidden={!canCancelOrder(order)}
            on:click={cancelOrder}
            class="py-1 px-3 rounded items-center flex transition duration-300
            ease-in-out text-orange-500">
            <Icon data={faBackspace} class="mr-2 hidden lg:inline" />
            <span>Annuler la commande</span>
          </button>
          <button
            class:hidden={!canProcessOrder(order)}
            on:click={processOrder}
            class="py-1 px-3 rounded items-center flex transition duration-300
            ease-in-out text-green-500">
            <Icon data={faPlay} class="mr-2 hidden lg:inline" />
            <span>Démarrer la préparation</span>
          </button>
          <button
            class:hidden={!canCompleteOrder(order)}
            on:click={completeOrder}
            class="py-1 px-3 rounded items-center flex transition duration-300
            ease-in-out text-green-500">
            <Icon data={faClipboardCheck} class="mr-2 hidden lg:inline" />
            <span>Terminer la préparation</span>
          </button>
          <button
            class:hidden={!canDeliverOrder(order)}
            on:click={deliverOrder}
            class="py-1 px-3 rounded items-center flex transition duration-300
            ease-in-out text-green-500">
            <Icon data={faTruckLoading} class="mr-2 hidden lg:inline" />
            <span>Marquer comme livrée</span>
          </button>
        </div>
      </div>
    {/if}
    <div class="px-0 md:px-5 overflow-x-auto -mx-4 md:-mx-5">
      <div
        class="flex flex-wrap bg-white w-full shadow items-center border-b
        border-gray-300">
        <div
          class="w-full lg:w-2/6 px-4 lg:px-8 py-5 border-b lg:border-b-0
          lg:border-r border-solid border-gray-300">
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
          class="w-full lg:w-2/6 px-4 lg:px-8 py-5 border-b lg:border-b-0
          lg:border-r border-solid border-gray-300">
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
                {order.totalWholeSalePrice}€
              </p>
            </div>
          </div>
        </div>
        <div
          class="w-full lg:w-2/6 border-b md:border-b-0 border-solid
          border-gray-300 px-4 lg:px-8 py-5">
          <p class="uppercase font-bold pb-2">Le client</p>
          <div class="mt-3">
            <div>
              <p class="mb-2">
                <span class="text-gray-600">Nom :</span>
                {order.sender.name}
              </p>
              <p class="text-base mb-2">
                <a href="mailto:{order.sender.email}">{order.sender.email}</a>
              </p>
              <p class="text-base mb-2">
                {#if order.sender.phone}
                  <a href="tel:{order.sender.phone}">{order.sender.phone}</a>
                {/if}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="px-0 md:px-5 overflow-x-auto -mx-4 md:-mx-5 mb-5">
      <div class="flex flex-wrap bg-white w-full lg:w-auto px-4 lg:px-8 shadow">
        <div class="w-full">
          <section>
            <div class="-mx-4 lg:-mx-8">
              <table class="min-w-full leading-normal">
                <thead>
                  <tr>
                    <th
                      class="px-4 md:px-8 py-3 border-b border-gray-300
                      bg-gray-100 text-left text-xs font-semibold text-gray-600
                      uppercase tracking-wider">
                      Produit
                    </th>
                    <th
                      class="px-4 md:px-8 py-3 border-b border-gray-300
                      bg-gray-100 text-left text-xs font-semibold text-gray-600
                      uppercase tracking-wider hidden lg:table-cell">
                      Prix unitaire
                    </th>
                    <th
                      class="px-4 md:px-8 py-3 border-b border-gray-300
                      bg-gray-100 text-center md:text-left text-xs font-semibold
                      text-gray-600 uppercase tracking-wider">
                      Qté
                    </th>
                    <th
                      class="px-4 md:px-8 py-3 border-b border-gray-300
                      bg-gray-100 text-right text-xs font-semibold text-gray-600
                      uppercase tracking-wider">
                      Prix total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {#each order.products as line, index}
                    <tr>
                      <td
                        class="px-4 md:px-8 py-5 border-b border-gray-200
                        bg-white text-sm lg:text-base">
                        <div class="items-center">
                          <p>{line.name}</p>
                          <p class="whitespace-no-wrap block lg:hidden">
                            {line.unitOnSalePrice}€
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
                          {line.unitOnSalePrice}€
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
                          {line.totalOnSalePrice}€
                        </p>
                      </td>
                    </tr>
                  {/each}
                  <tr>
                    <td
                      class="border-b-2 border-gray-200 bg-white px-4 md:px-8
                      py-5 text-lg text-right uppercase font-semibold hidden"
                      colspan="3">
                      Total :
                    </td>
                    <td
                      class="border-b-2 border-gray-200 bg-white px-4 md:px-8
                      py-5 text-lg text-right font-bold"
                      colspan="1">
                      {order.totalWholeSalePrice}€
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  {/if}
</TransitionWrapper>
