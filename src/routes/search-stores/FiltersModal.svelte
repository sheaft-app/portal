<script>
	import GetRouterInstance from "../../services/SheaftRouter.js";
	import CategorySelect from "./../../components/controls/CategorySelect.svelte";
	import Toggle from "./../../components/controls/Toggle.svelte";
	import Icon from "svelte-awesome";
	import { faTimes } from "@fortawesome/free-solid-svg-icons";
	import SheaftErrors from "./../../services/SheaftErrors";
	import { isBio } from "../../helpers/app";

	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();

	export let close, filters;

	const toggleBio = () => {
		let values = routerInstance.getQueryParams();

		if (!values["labels"])
			return routerInstance.replaceQueryParams({
				labels: ["bio"],
			});

		if (values["labels"].includes("bio")) {
			return routerInstance.replaceQueryParams({
				labels: values["labels"].split(",").filter((t) => t !== "bio"),
			});
		}

		return routerInstance.replaceQueryParams({
			labels: [values["labels"], "bio"],
		});
	};

	$: activeLabels = routerInstance.getQueryParams()["labels"] ? routerInstance.getQueryParams()["labels"] : [];
</script>

<div class="flex justify-between items-center pb-2">
	<p class="text-lg font-medium">Filtres</p>
	<button on:click={() => close()}>
		<Icon data={faTimes} />
	</button>
</div>
<hr />
<div class="mt-6">
	<label class="block uppercase tracking-wide text-xs font-bold mb-2"> Labels </label>
	<Toggle classNames="ml-3" isChecked={isBio(activeLabels)} onChange={() => toggleBio()}>
		<span>Magasin vendant uniquement du bio</span>
	</Toggle>
</div>
<div class="mt-6">
	<label class="block uppercase tracking-wide text-xs font-bold mb-2"> Magasin proposant </label>
	<CategorySelect {errorsHandler} callback={close} withSearch={true} grid="grid grid-cols-2 lg:grid-cols-3 gap-2" />
</div>
