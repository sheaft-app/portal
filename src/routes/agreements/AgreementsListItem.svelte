<script>
    import AgreementRoutes from './routes';
    import { format } from "date-fns";
    import GetRouterInstance from "../../services/SheaftRouter.js";
    import { fr } from "date-fns/locale";

    export let agreement;

    const routerInstance = GetRouterInstance();
</script>
<div
    on:click={() => routerInstance.goTo(AgreementRoutes.Details, { id: agreement.id })}
    class="px-2 md:px-6 py-6 mb-3 bg-white shadow hover:bg-gray-100 transition duration-200 ease-in-out cursor-pointer">
    <div class="text-base leading-5">
        <p>Producteur : {agreement.delivery.producer.name}</p>
        <p>Magasin : {agreement.store.name}</p>
    </div>
    <div class="text-base leading-5 mt-3">
        <p class="text-gray-600">demandé le {format(new Date(agreement.createdOn), 'PP', { locale: fr })}</p>
    </div>
</div>
