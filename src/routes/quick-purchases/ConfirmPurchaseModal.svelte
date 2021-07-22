<script>
	import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
	import { CREATE_BUSINESS_ORDER } from "./mutations.js";
	import ProducerCardWithProducts from "./ProducerCardWithProducts.svelte";
	import SheaftErrors from "./../../services/SheaftErrors";
	import { getContext } from "svelte";
	import { MY_ORDERS } from "../my-orders/queries";

	const errorsHandler = new SheaftErrors();
	const { mutate } = getContext("api");

	export let close, onClose, producers;

	let isLoading = false;

	const handleSubmit = async () => {
		isLoading = true;
		const products = producers.map((p) => p.products.map((pr) => ({ id: pr.id, quantity: pr.quantity }))).flat();

		const deliveries = producers.map((producer) => ({
			producerId: producer.id,
			comment: producer.comment,
			deliveryModeId: producer.delivery ? producer.delivery.id : null,
			expectedDeliveryDate: producer.deliveryHour ? producer.deliveryHour.expectedDeliveryDate : null,
		}));

		await mutate({
			mutation: CREATE_BUSINESS_ORDER,
			variables: { products: products, producersExpectedDeliveries: deliveries },
			errorsHandler,
			success: async () => onClose && (await onClose()),
			errorNotification: "Impossible d'envoyer la commande",
			clearCache: [MY_ORDERS],
		});
		isLoading = false;
	};
</script>

<ActionConfirm
	{errorsHandler}
	title="Confirmer ma commande"
	{isLoading}
	{close}
	submit={handleSubmit}
	submitText="Envoyer"
	closeText="Fermer"
>
	{#each producers as producer}
		<div class="mb-2">
			<ProducerCardWithProducts {producer} />
		</div>
	{/each}
</ActionConfirm>
