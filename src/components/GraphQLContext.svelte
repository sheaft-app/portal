<script>
    import { writable } from "svelte/store";
    import { setContext as baseSetContext } from "svelte";
    import GetGraphQLInstance from "./../services/SheaftGraphQL";
    import GetNotificationsInstance from "./../services/SheaftNotifications.js";
    
    export let key = "api";
    export let setContext = baseSetContext;
        
    const graphQLInstance = GetGraphQLInstance();
    const notificationsInstance = GetNotificationsInstance();

    export let isLoading = writable(false);

    const query = async ({ query, variables, errorsHandler, success = () => {}, error = () => {}, errorNotification }) => {
        isLoading.set(true);

        const res = await graphQLInstance.query(
            query,
            variables,
            errorsHandler.Uuid
        );

        isLoading.set(false);

        if (!res.success) {
            await error(res);
            
            if (errorNotification)
                notificationsInstance.error(errorNotification);
            return;
        }

        await success(res.data);

        return res.data;
    }

    const mutate = async ({ mutation, variables, errorsHandler, success, successNotification, error = () => {}, errorNotification, clearCache = [] }) => {
        isLoading.set(true);

        const res = await graphQLInstance.mutate(
            mutation,
            variables,
            errorsHandler.Uuid
        );

        isLoading.set(false);

        if (!res.success) {
            await error(res);
            if (errorNotification)
                notificationsInstance.error(errorNotification);
            return res;
        }

        clearCache.forEach((c) => graphQLInstance.clearApolloCache(c));
        await success(res.data);
        if (successNotification)
            notificationsInstance.success(successNotification);

        return res.data;
    }

    setContext(key, { mutate, query, isLoading });
</script>

<slot />