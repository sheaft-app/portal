<script>
	import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
	import { SET_SELLING_POINT_AVAILABILITY } from "./mutations.js";
	import SheaftErrors from "./../../services/SheaftErrors";
	import { getContext } from "svelte";

	export let close, onClose, sellingPoint;

	const errorsHandler = new SheaftErrors();
	const { mutate, isLoading } = getContext("api");

	const handleSubmit = async () => {
		mutate({
			mutation: SET_SELLING_POINT_AVAILABILITY,
			variables: { ids: [sellingPoint.id], available: !sellingPoint.available },
			errorsHandler,
			success: async (res) => await handleClose({ success: true, data: res }),
			successNotification: `Le point de vente a été ${sellingPoint.available ? "désactivé" : "activé"} avec succès`,
			errorNotification: `Le point de vente n'a pas pu être ${sellingPoint.available ? "désactivé" : "activé"}`,
		});
	};

	const handleClose = async (res) => {
		close();
		await onClose(res);
	};
</script>

<ActionConfirm
	title={sellingPoint.available ? "Désactiver" : "Activer"}
	level={sellingPoint.available ? "warning" : "success"}
	isLoading={$isLoading}
	{errorsHandler}
	submit={handleSubmit}
	close={() => handleClose({ success: false, data: null })}
>
	<p>
		Cette opération {sellingPoint.available ? "désactivera" : "activera"} ce point de vente.
	</p>
</ActionConfirm>
