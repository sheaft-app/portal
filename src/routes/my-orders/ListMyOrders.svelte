<script>
	import GetAuthInstance from "../../services/SheaftAuth";
	import Roles from "../../enums/Roles";
	import StoreMyOrders from "./StoreMyOrders.svelte";
	import ConsumerMyOrders from "./ConsumerMyOrders.svelte";

	const authInstance = GetAuthInstance();
</script>

{#if authInstance.isInRole([Roles.Store.Value])}
	<StoreMyOrders />
{:else}
	<ConsumerMyOrders />
{/if}
