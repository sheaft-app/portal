<script>
	import DeliveryBatchesRoutes from "./routes.js";
	import ListDeliveryBatches from "./ListDeliveryBatches.svelte";
	import CreateDeliveryBatch from "./CreateDeliveryBatch.svelte";
	import EditDeliveryBatch from "./EditDeliveryBatch.svelte";
	import Router from "svelte-spa-router";
	import Meta from "../../components/Meta.svelte";

	export let params = {};
	export const prefix = DeliveryBatchesRoutes.Prefix;

	const routes = {};
	routes[DeliveryBatchesRoutes.List.SubPart] = ListDeliveryBatches;
	routes[DeliveryBatchesRoutes.Create.SubPart] = CreateDeliveryBatch;
	routes[DeliveryBatchesRoutes.Edit.SubPart] = EditDeliveryBatch;

</script>

<Meta />
<Router {routes} {prefix} />
