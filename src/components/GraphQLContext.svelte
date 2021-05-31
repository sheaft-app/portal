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


    const clearApolloCache = (data) => Array.isArray(data)
        ? data.forEach((c) => graphQLInstance.clearApolloCache(c))
        : graphQLInstance.clearApolloCache(data);

    const query = async ({ query, variables, errorsHandler, success = () => {}, error = () => {}, errorNotification }) => {
        isLoading.set(true);

        try {
            const res = await graphQLInstance.query(
                query,
                variables,
                errorsHandler?.Uuid
            );

            isLoading.set(false);

            if (!res.success) {
                await error(res);

                if (errorNotification)
                    notificationsInstance.error(errorNotification);
                return;
            }

            if (res.pageInfo) {
                await success(res);
                return res;
            } else {
                await success(res.data);
                return res.data;
            }
        } catch(e) {
            console.error(e);
            await error(e);
            if (errorNotification)
                notificationsInstance.error(errorNotification);
            return;
        }
    }

    const mutate = async ({ mutation, variables, errorsHandler, success, successNotification, error = () => {}, errorNotification, clearCache = [] }) => {
        isLoading.set(true);

        try {
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

            clearApolloCache(clearCache);

            await success(res.data);
            if (successNotification)
                notificationsInstance.success(successNotification);

            return res.data;
        } catch (e) {
            console.error(e);
        }
    }
    setContext(key, { mutate, query, isLoading, clearApolloCache });
</script>

<slot />
