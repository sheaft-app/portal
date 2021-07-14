<script>
    import { getContext } from "svelte";
    import ActionConfirm from "../../components/modal/ActionConfirm.svelte";
	import { GET_PICKINGS, GET_PICKING_DETAILS } from "./queries";
	import { START_PICKING } from "./mutations";
	import PreparationRoutes from "./routes";
    import { faCheck } from "@fortawesome/free-solid-svg-icons";
    import GetRouterInstance from "../../services/SheaftRouter";
    import SheaftErrors from "../../services/SheaftErrors";

    export let id, close;

    const errorsHandler = new SheaftErrors();
    const routerInstance = GetRouterInstance();
	const { mutate } = getContext("api");

    let isLoading = false;
    
    const submit = async () => {
		isLoading = true;
		await mutate({
			mutation: START_PICKING,
			variables: { id },
			errorsHandler,
			success: (res) => routerInstance.goTo(PreparationRoutes.Process, { id: res.id }),
			successNotification: "Préparation commencée !",
			errorNotification: "Impossible de commencer la livraison",
			clearCache: [GET_PICKINGS, id],
		});
		isLoading = false;
	};
</script>

<ActionConfirm
	{errorsHandler}
	title="Lancer la préparation"
	{submit}
	{isLoading}
	{close}
	submitText="Lancer"
	icon={faCheck}
	closeText="Fermer"
>
	<p class="pt-2 pb-1 leading-5">Vous vous apprêtez à lancer la préparation.</p>
</ActionConfirm>