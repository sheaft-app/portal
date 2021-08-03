<script>
	import { onMount } from "svelte";
	import PurchaseOrderStatusKind from "../../enums/PurchaseOrderStatusKind.js";
	import AgreementStatusKind from "./../../enums/AgreementStatusKind.js";
	import Icon from "svelte-awesome";

	export let status, type;

	onMount(() => {
		if (type != "order" && type != "agreement") {
			throw 'Type must be "order" or "agreement"';
		}
	});

	$: data = type === "order" ? PurchaseOrderStatusKind.get(status) : AgreementStatusKind.get(status);
</script>

<div class={`w-6 h-6 rounded-full text-white inline-flex items-center justify-center bg-${data.Color}`}>
	<Icon
		data={data.Icon}
		scale=".7"
		spin={status === PurchaseOrderStatusKind.Processing.Value ||
			status === PurchaseOrderStatusKind.Waiting.Value ||
			status === AgreementStatusKind.WaitingForProducerApproval.Value ||
			status === AgreementStatusKind.WaitingForStoreApproval.Value}
	/>
</div>
