<script>
  import { onMount } from "svelte";
	import Loader from "../../components/Loader.svelte";
	import { form, bindClass } from '../../../vendors/svelte-forms/src/index';
  import ErrorContainer from "./../../components/ErrorContainer.svelte";
  import Select from "./../../components/controls/select/Select.js";
  import GetGraphQLInstance from "../../services/SheaftGraphQL";
  import { GET_NATIONALITIES } from "../queries";

  export let formName = null, name = null, selectedValue = null, displayError = true, errorsHandler = null;
  
  const graphQLInstance = GetGraphQLInstance();
  const getLabel = option => option.name;

  let isLoading = true;
  let nationalities = [];

  onMount(async () => {
    var res = await graphQLInstance.query(GET_NATIONALITIES, {}, errorsHandler.Uuid);

		if (!res.success) {
      // todo
      isLoadingLists = false;
			return;
    }

    nationalities = res.data;
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
      items={nationalities}
      iconClasses="mr-3"
      isClearable={false}
      showChevron={true}
      hideSelectedOnFocus={true}
      optionIdentifier="code"
      placeholder="ex : Française"
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