<script>
	import TransitionWrapper from "../../components/TransitionWrapper.svelte";
	import GetRouterInstance from "../../services/SheaftRouter";
	import CatalogForm from "./CatalogForm.svelte";
	import {CREATE_CATALOG} from "./mutations";
	import CatalogRoutes from "./routes";
	import SheaftErrors from "../../services/SheaftErrors";
	import {GET_CATALOGS} from "./queries";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";
	import form from "../../stores/form";
	import { getContext } from "svelte";
	import { normalizeCatalog } from "./catalogForm";

	export let isInModal = false, onClose, close;

	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();
	const { mutate, isLoading } = getContext("api");

	const handleSubmit = async () => await mutate({
		mutation: CREATE_CATALOG,
		variables: normalizeCatalog(form.values()),
		errorsHandler,
		success: async (res) => {
			if (isInModal) await handleClose(res);
			else routerInstance.goTo(CatalogRoutes.List);
		},
		successNotification: "Votre catalogue a bien été créée",
		errorNotification: "Impossible de créer votre catalogue",
		clearCache: [GET_CATALOGS]
	});

	const handleClose = async (res) => {
		close();
		if (onClose) await onClose(res);
	};
</script>

<TransitionWrapper>
	<PageHeader name="Créer un nouveau catalogue" previousPage={CatalogRoutes.List}/>
	<PageBody {errorsHandler} isLoading={$isLoading}>
		<CatalogForm submit={handleSubmit} close={handleClose} {errorsHandler}/>
	</PageBody>
</TransitionWrapper>
