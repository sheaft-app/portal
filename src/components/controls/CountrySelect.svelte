<script>
  import { getContext, onMount } from "svelte";
	import Loader from "../../components/Loader.svelte";
	import { bindClass } from '../../../vendors/svelte-forms/src/index';
  import ErrorContainer from "./../../components/ErrorContainer.svelte";
  import Select from "./../../components/controls/select/Select.js";
  import { GET_COUNTRIES } from "../queries";

  export let formName = null, name = null, selectedValue = null, displayError = true, errorsHandler = null;
  
  const { query } = getContext("api");
  const getLabel = option => option.name;

  let isLoading = true;
  let countries = [];

  onMount(async () => {
    countries = await query({
      query: GET_COUNTRIES,
      errorsHandler,
      success: (res) => {
        if (selectedValue && typeof selectedValue == "string") selectedValue = res.find((c) => c.code == selectedValue)
      },
      errorNotification: "Impossible de récupérer la liste des pays"
    });
    isLoading = false;
  })
</script>

{#if isLoading}
  <Loader />
{:else}
  <div class="themed" use:bindClass={{ form: formName, name }}>
    <Select 
      getOptionLabel={getLabel}
      getSelectionLabel={getLabel}
      items={countries}
      iconClasses="mr-3"
      isClearable={false}
      showChevron={true}
      hideSelectedOnFocus={true}
      optionIdentifier="code"
      placeholder="ex : France"
      listPlacement="top"
      bind:selectedValue
      preferredOptions={["FR", "BE", "CH"]}
      containerStyles="font-weight: 600;" />
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