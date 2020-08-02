<script>
  import DisplayStatusIcon from "./DisplayStatusIcon.svelte";
  import { format } from "date-fns";
  import { fr } from "date-fns/locale";
  import GetRouterInstance from "./../../services/SheaftRouter";
  import MyOrderRoutes from "./routes";
  import OrderStatusKind from "./../../enums/OrderStatusKind";

  export let order;
  const routerInstance = GetRouterInstance();
</script>
<div
    on:click="{() => routerInstance.goTo(MyOrderRoutes.Details, {id: order.id})}"
    class="px-2 md:px-6 py-6 flex flex-wrap mb-3 bg-white shadow hover:bg-gray-100 transition duration-200 ease-in-out cursor-pointer">
    <div class="md:w-2/12 w-full mb-2 lg:mb-0 -mx-3">
    <DisplayStatusIcon status={order.status} />
    </div>
    <div class="w-8/12 md:w-6/12 px-3">
    <div class="text-lg lg:text-xl leading-5 font-medium">
        <p>{order.vendor.name}</p>
    </div>
    <div class="text-base leading-5">
        <p>#{order.reference}</p>
    </div>
    <div class="text-base leading-5 mt-3">
        {#if order.status == OrderStatusKind.Accepted.Value || order.status == OrderStatusKind.Processing.Value || order.status == OrderStatusKind.Completed.Value}
        <p class="text-accent text-base">
            à récupérer le {format(new Date(order.expectedDelivery.expectedDeliveryDate), 'PP', { locale: fr })}
        </p>
        {/if}
        <p class="text-gray-600">passée le {format(new Date(order.createdOn), 'PP', { locale: fr })}</p>
    </div>
    </div>
    <div class="w-4/12 px-3 text-right">
    <p>
        <span class="font-bold text-lg lg:text-xl">
            {order.totalOnSalePrice} €
        </span>
    </p>
    <p>
        <span class="font-medium text-gray-600 text-base">
            {order.productsCount} articles
        </span>
    </p>
    </div>
</div>