<script>
    import { onMount } from "svelte";
    import { GET_DELIVERIES } from "./queries";
    import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
    import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
    import GetRouterInstance from "./../../services/SheaftRouter.js";
    import DeliveryRoutes from "./routes";
    import SheaftErrors from "../../services/SheaftErrors";
    import ErrorCard from "../../components/ErrorCard.svelte";

    const errorsHandler = new SheaftErrors();
    const graphQLInstance = GetGraphQLInstance();
    const routerInstance = GetRouterInstance();

    let isLoading = true;

    onMount(async () => {
        await fetchDeliveries();
    });

    const fetchDeliveries = async () => {
        isLoading = true;
        var res = await graphQLInstance.query(GET_DELIVERIES, null, errorsHandler.Uuid);

        if (!res.success) {
            // todo
            return;
        }

        // Actuellement, on ne gère que les horaires de livraison PRODUCER_TO_STORE
        // Le producteur n'a donc qu'une seule Delivery de ce type
        if (res.data.length > 0) {
            routerInstance.goTo(DeliveryRoutes.Details, { id: res.data[0].id })
        } else {
            routerInstance.goTo(DeliveryRoutes.Create)
        }
        
        isLoading = false;
        window.scrollTo(0, 0);
    }
</script>