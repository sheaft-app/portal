<script>
    import { onMount } from "svelte";
    import DeliveryKind from './../../enums/DeliveryKind.js';
    import { items } from "./store";
    import { GET_SELLING_POINTS } from "./queries";
    import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
    import Table from "./../../components/table/Table.svelte";
	import Loader from './../../components/Loader.svelte';
    import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
    import GetRouterInstance from "./../../services/SheaftRouter.js";
    import SellingPointRoutes from "./routes";
    import SheaftErrors from "../../services/SheaftErrors";
    import ErrorCard from "./../../components/ErrorCard.svelte";

    const errorsHandler = new SheaftErrors();
    const graphQLInstance = GetGraphQLInstance();
    const routerInstance = GetRouterInstance();

    let isLoading = true;
    let sellingPoints = [];

    onMount(async() => {
        await fetchSellingPoints();
    });

    const fetchSellingPoints = async() => {
        var res = await graphQLInstance.query(GET_SELLING_POINTS, null, errorsHandler.Uuid);

        if (!res.success) {
            // todo
            return;
        }

        items.set(res.data);

        isLoading = false;
        window.scrollTo(0, 0);
    }
</script>

<svelte:head>
  <title>Mes points de vente</title>
</svelte:head>

<TransitionWrapper>
    <ErrorCard {errorsHandler} />
    {#if isLoading}
        <Loader />
    {:else if $items.length < 1}
        <div class="w-full h-full flex justify-center">
            <div
            class="text-center text-xl text-gray-600 m-auto px-6">
                <p class="mb-3">Vous n'avez pas encore de point de vente direct.</p>
                <div
                class="flex flex-wrap mb-5 justify-center w-full flex-col-reverse
                md:flex-row">
                    <a
                        class="btn btn-lg btn-accent justify-center"
                        href="javascript:void(0)"
                        on:click={() => routerInstance.goTo(SellingPointRoutes.Create)}
                        >
                        Créer un point de vente direct
                    </a>
                </div>
            </div>
        </div>
    {:else}
        <div
            class="overflow-x-auto bg-white rounded shadow -mx-4 -my-4 lg:mx:0 lg:my-0">
            <div
            class="p-4 text-gray-500 border-b border-gray-200 w-full flex
            items-center md:flex bg-white">
            <a
                href="javascript:void(0)"
                on:click={() => routerInstance.goTo(SellingPointRoutes.Create)}
                class="btn btn-primary btn-lg">
                <span>Ajouter un point de vente</span>
            </a>
            </div>
            <Table
                {items}
                isLoading={isLoading}
                canSelect={false}
                navigate={SellingPointRoutes.Details}
                headers={[{ name: 'Nom' }, { name: 'Adresse' }, { name: 'Type' }]}
                let:item={sellingPoint}
            >
                <td
                    class="px-2 md:px-6 py-4 whitespace-no-wrap border-b
                    border-gray-200">
                    <div
                    class="text-sm leading-5 font-medium truncate"
                    style="max-width: 180px;">
                    {sellingPoint.name}
                    </div>
                </td>
                <td class="px-2 md:px-6 py-4 whitespace-no-wrap">
                    {#if sellingPoint.address}
                    <div class="text-sm leading-5">
                        {sellingPoint.address.zipcode} {sellingPoint.address.city}
                    </div>
                    <div class="text-sm leading-5">
                        {sellingPoint.address.line1}
                    </div>
                    {/if}
                </td>
                <td class="px-2 md:px-6 py-4 whitespace-no-wrap">
                    <div class="text-sm leading-5">
                        {DeliveryKind.label(sellingPoint.kind)}
                    </div>
                </td>
            </Table>
        </div>
    {/if}
</TransitionWrapper>


<!-- <div class="w-full h-full flex justify-center">
    <div
    class="text-center text-xl text-gray-600 m-auto px-6" >
    <p>Aucune commande pour le moment.</p>
    <p class="mb-5">Ne vous en faites pas, ça ne devrait pas tarder !</p>
    <img
        src="/img/no_orders.svg"
        class="m-auto"
        style="width: 200px; height: auto"
        alt="Aucune commande ici" />
    </div>
</div> -->