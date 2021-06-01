<script>
	import GetRouterInstance from "../services/SheaftRouter";
	import PageEmpty from "./PageEmpty.svelte";
	import ErrorCard from "./ErrorCard.svelte";
	import Loader from "./Loader.svelte";

	export let noResultsPage,
		errorsHandler,
		noResults = false,
		isLoading = false,
		loadingMessage;
	const routerInstance = GetRouterInstance();

</script>

{#if !isLoading && errorsHandler}
	<ErrorCard {errorsHandler} />
{/if}

{#if !isLoading && noResults}
	<PageEmpty {noResultsPage} />
{/if}

{#if isLoading}
	<Loader text={loadingMessage} />
{:else}
	<slot />
{/if}
