<script>
	import DeliveryBatchesRoutes from "./routes.js";
	import ListDeliveryBatches from "./ListDeliveryBatches.svelte";
	import CreateDeliveryBatch from "./CreateDeliveryBatch.svelte";
	import EditDeliveryBatch from "./EditDeliveryBatch.svelte";
	import DeliveryProcess from "./process/DeliveryProcess.svelte";
	import FlatDeliveryProcess from "./process/FlatDeliveryProcess.svelte";
	import SetNextDelivery from "./process/SetNextDelivery.svelte";
	import EndDelivery from "./process/EndDelivery.svelte";
	import ListDeliveryBatchesHistory from "./ListDeliveryBatchesHistory.svelte";
	import PickDeliveryMode from "./process/PickDeliveryMode.svelte";
	import DeliveryBatchSummary from "./DeliveryBatchSummary.svelte";
	import Router from "svelte-spa-router";
	import Meta from "../../components/Meta.svelte";

	export let params = {};
	export const prefix = DeliveryBatchesRoutes.Prefix;

	const routes = {};
	routes[DeliveryBatchesRoutes.List.SubPart] = ListDeliveryBatches;
	routes[DeliveryBatchesRoutes.History.SubPart] = ListDeliveryBatchesHistory;
	routes[DeliveryBatchesRoutes.Summary.SubPart] = DeliveryBatchSummary;
	routes[DeliveryBatchesRoutes.Create.SubPart] = CreateDeliveryBatch;
	routes[DeliveryBatchesRoutes.FlatProcess.SubPart] = FlatDeliveryProcess;
	routes[DeliveryBatchesRoutes.PickDeliveryMode.SubPart] = PickDeliveryMode;
	routes[DeliveryBatchesRoutes.Edit.SubPart] = EditDeliveryBatch;
	routes[DeliveryBatchesRoutes.Process.SubPart] = DeliveryProcess;
	routes[DeliveryBatchesRoutes.NextDelivery.SubPart] = SetNextDelivery;
	routes[DeliveryBatchesRoutes.EndDelivery.SubPart] = EndDelivery;
</script>

<Meta />
<Router {routes} {prefix} />
