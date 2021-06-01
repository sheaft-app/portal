<script>
	import { onMount, getContext } from "svelte";
	import Loader from "../../components/Loader.svelte";
	import { bindClass } from "../../../vendors/svelte-forms/src/index";
	import ErrorContainer from "./../../components/ErrorContainer.svelte";
	import Select from "./../../components/controls/select/Select.js";
	import { GET_NATIONALITIES } from "../queries";

	export let formName = null,
		name = null,
		selectedValue = null,
		displayError = true,
		errorsHandler = null;

	const { query } = getContext("api");
	const getLabel = (option) => option.name;

	let isLoading = true;
	let nationalities = [];

	onMount(async () => {
		await query({
			query: GET_NATIONALITIES,
			errorsHandler,
			success: (res) => {
				if (selectedValue && typeof selectedValue == "string")
					selectedValue = res.data.find((n) => n.code == selectedValue);

				nationalities = res.data;
			},
			errorNotification: "Impossible de récupérer la liste des nationalités",
		});
		isLoading = false;
	});

</script>

{#if isLoading}
	<Loader />
{:else}
	<div class="themed" use:bindClass={{ form: formName, name }}>
		<Select
			getOptionLabel={getLabel}
			getSelectionLabel={getLabel}
			items={nationalities}
			iconClasses="mr-3"
			isClearable={false}
			showChevron={true}
			hideSelectedOnFocus={true}
			optionIdentifier="code"
			listPlacement="top"
			placeholder="ex : Française"
			bind:selectedValue
			preferredOptions={["FR", "BE", "CH"]}
			containerStyles="font-weight: 600;"
		/>
	</div>
	{#if displayError}
		<ErrorContainer field={$formName.fields[name]} />
	{/if}
{/if}

<style>
	.themed {
		--inputPadding: 15px;
		--selectedItemPadding: 0 15px;
		--borderFocusColor: #a0aec0;
		--placeholderColor: #a0afbf;
	}

</style>
