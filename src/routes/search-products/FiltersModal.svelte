<script>
	import Select from "./../../components/controls/select/Select.svelte";
	import GetRouterInstance from "../../services/SheaftRouter.js";
	import CategorySelect from "./../../components/controls/CategorySelect.svelte";
	import Toggle from "./../../components/controls/Toggle.svelte";
	import SortingSelect from "./SortingSelect.svelte";
	import Icon from "svelte-awesome";
	import ProducerItem from "./ProducerItem.svelte";
	import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
	import { SUGGEST_PRODUCER } from "./queries";
	import { getContext } from "svelte";
	import SheaftErrors from "../../services/SheaftErrors";
	import { isBio } from "../../helpers/app";

	export let close, filters, producer;

	const routerInstance = GetRouterInstance();
	const { query } = getContext("api");
	const errorsHandler = new SheaftErrors();

	let isLoading = false;

	const getOptionLabel = (option) =>
		!option || !option.address || !option.address.city || !option.address.zipcode
			? ""
			: `<p class="leading-none mt-1 uppercase">${option.name}</p><p class="leading-none text-xs mt-1 uppercase">${option.address.zipcode} ${option.address.city}</p>`;

	const getSelectionLabel = (option) => option.name;

	const loadData = async (filterText) => {
		let data = [];
		await query({
			query: SUGGEST_PRODUCER,
			variables: { input: { text: filterText } },
			errorsHandler,
			success: (res) => (data = res),
			error: () => (data = []),
			errorNotification: "Impossible de récupérer les producteurs.",
		});
		return data;
	};

	const handleSelect = (selectedItem) => {
		routerInstance.replaceQueryParams({
			producerId: selectedItem.detail.id,
		});

		return close();
	};

	const toggleBio = () => {
		let values = routerInstance.getQueryParams();

		if (!values["labels"]) {
			routerInstance.replaceQueryParams({
				labels: ["bio"],
			});
			return close();
		}

		if (values["labels"].includes("bio")) {
			routerInstance.replaceQueryParams({
				labels: values["labels"].split(",").filter((t) => t !== "bio"),
			});
			return close();
		}

		routerInstance.replaceQueryParams({
			labels: [values["labels"], "bio"],
		});

		return close();
	};

	$: if (!producer) {
		routerInstance.replaceQueryParams({ producerId: producer });
	}

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
	<label class="block uppercase tracking-wide text-xs font-bold mb-2"> Tri </label>
	<SortingSelect {filters} callback={close} inline={true} />
</div>
<div class="mt-6">
	<div class="themed">
		<label class="block uppercase tracking-wide text-xs font-bold mb-2"> Producteur </label>
		<Select
			loadOptions={(text) => loadData(text)}
			{getOptionLabel}
			isDisabled={isLoading}
			isWaiting={isLoading}
			icon={faSearch}
			iconClasses="mr-3 text-accent"
			{getSelectionLabel}
			on:select={handleSelect}
			isClearable={true}
			showChevron={false}
			hideSelectedOnFocus={true}
			optionIdentifier="id"
			placeholder="Entrez le nom d'un producteur"
			inputAttributes={{ style: "cursor: pointer !important;" }}
			Item={ProducerItem}
			noOptionsMessage="Aucune correspondance trouvée pour ce nom"
			bind:selectedValue={producer}
			containerStyles="height: 60px; font-weight: 600; color: #4a5568; padding-left:1em;"
		/>
	</div>
</div>
<div class="mt-6">
	<label class="block uppercase tracking-wide text-xs font-bold mb-2"> Labels </label>
	<Toggle classNames="ml-3" isChecked={isBio(activeLabels)} onChange={() => toggleBio()}>
		<span>Produit issu de l'agriculture biologique</span>
	</Toggle>
</div>
<div class="mt-6">
	<label class="block uppercase tracking-wide text-xs font-bold mb-2"> Catégories </label>
	<CategorySelect callback={close} {errorsHandler} withSearch={true} grid="grid grid-cols-2 lg:grid-cols-3 gap-2" />
</div>

<style lang="scss">
	.themed {
		display: contents;
		--cursor: text;
		--padding: 22px 16px;
		--borderFocusColor: #a0aec0;
		--borderHoverColor: #a0aec0;
		--border: 1px solid #cbd5e0;
		--inputPadding: 45px;
		--inputColor: #205164;
		--indicatorTop: 16px;
		--indicatorColor: #ff4081;
	}
</style>
