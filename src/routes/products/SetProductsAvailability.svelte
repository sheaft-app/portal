<script>
	import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
	import { GET_PRODUCTS } from "./queries";
	import { SET_PRODUCTS_AVAILABILITY } from "./mutations";
	import SheaftErrors from "./../../services/SheaftErrors";
	import { getContext } from "svelte";

	export let selectedItems, close, onClose, status;

	const errorsHandler = new SheaftErrors();
	const { mutate, isLoading } = getContext("api");

	const handleSubmit = async () => {
		return mutate({
			mutation: SET_PRODUCTS_AVAILABILITY,
			variables: { ids: selectedItems.map((s) => s.id), available: status },
			errorsHandler,
			success: (res) => handleClose(res),
			successNotification: `Le produit a bien été ${status ? "activé" : "désactivé"}`,
			errorNotification: `Impossible ${status ? "d'activer" : "de désactiver"} ce produit`,
			clearCache: [GET_PRODUCTS],
		});
	};

	const handleClose = async (res) => {
		close();
		await onClose(res);
	};
</script>

<ActionConfirm
	title={status ? "Rendre disponible" : "Rendre indisponible"}
	level={status ? "success" : "warning"}
	isLoading={$isLoading}
	{errorsHandler}
	submit={handleSubmit}
	close={() => handleClose({ success: false, data: null })}
>
	<p>
		Cette opération rendra les produits ci-dessous {status ? "" : "non"} disponibles à la vente.
	</p>
	<ul class="text-sm mt-2 font-semibold">
		{#each selectedItems as product}
			<li>{product.name}</li>
		{/each}
	</ul>
</ActionConfirm>
