<script>
	import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
	import { CREATE_BUSINESS_ORDER } from "./mutations.js";
	import ProducerCardWithProducts from "./ProducerCardWithProducts.svelte";
	import SheaftErrors from "./../../services/SheaftErrors";
	import { getContext } from "svelte";
	import { MY_ORDERS } from "../my-orders/queries";

	const errorsHandler = new SheaftErrors();
	const { mutate } = getContext("api");

	export let close, onClose, data;

	let isLoading = false;

	const handleSubmit = async () => {
		isLoading = true;
		await mutate({
			mutation: CREATE_BUSINESS_ORDER,
			variables: { products: data.products, producersExpectedDeliveries: data.producersExpectedDeliveries },
			errorsHandler,
			success: async () => onClose && (await onClose()),
			errorNotification: "Impossible d'envoyer la commande",
			clearCache: [MY_ORDERS],
		});
		isLoading = false;
	};

	const getProducerInfo = (producerId) => {
		const products = data.allProducts.filter((p) => p.producer.id === producerId);

		return {
			name: products[0].producer.name,
			products,
		};
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
	{#each data.producersExpectedDeliveries as producer}
		<div class="mb-2">
			<ProducerCardWithProducts producer={getProducerInfo(producer.producerId)} delivery={producer} />
		</div>
	{/each}
</ActionConfirm>
