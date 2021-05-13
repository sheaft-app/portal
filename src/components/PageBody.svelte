<script>
	import GetRouterInstance from "../services/SheaftRouter";
	import Actions from "./table/Actions.svelte";
	import PageEmpty from "./PageEmpty.svelte";
	import ErrorCard from "./ErrorCard.svelte";
	import Loader from "./Loader.svelte";

	export let actions = [], noResultsPage, errorsHandler, noResults = false, isLoading = false, loadingMessage;
	const routerInstance = GetRouterInstance();
</script>

{#if isLoading}
	<Loader text={loadingMessage}/>
{:else}
	{#if actions && actions.length > 0}
		<Actions {actions}/>
	{/if}

	{#if errorsHandler}
		<ErrorCard {errorsHandler}/>
	{/if}

	{#if noResults}
		<PageEmpty {noResultsPage}/>
	{:else}
		<slot/>
	{/if}
{/if}
