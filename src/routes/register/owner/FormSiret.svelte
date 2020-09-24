<script>
  import InputSiret from "../InputSiret.svelte";
  import GetGraphQLInstance from "./../../../services/SheaftGraphQL";
  import GetRouterInstance from "./../../../services/SheaftRouter";
	import { form, bindClass } from '../../../../vendors/svelte-forms/src/index';
  import { SEARCH_COMPANY_SIRET } from "../queries.js";
  import Loader from "./../../../components/Loader.svelte";
  import Icon from "svelte-awesome";
  import CityService from "./../../../services/CityService.js";
  import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";

  export let company, stepper = 0;

  const graphQLInstance = GetGraphQLInstance();
  const routerInstance = GetRouterInstance();
  const cityService = new CityService();

  let isSearchingSiret = false;
  let isSearchingAddress = false;

  const addressIsDefined = address =>
    address.line1 &&
    address.line1.length > 0 &&
    address.zipcode &&
    address.zipcode.length > 0 &&
    address.city &&
    address.city.length > 0;

  const searchCompanyAddress = async text => {
    isSearchingAddress = true;
    var res = await cityService.SearchByAddress(text);
    isSearchingAddress = false;
    return res;
  };

  const validateSiret = async () => {
    siretForm.validate();

    if ($siretForm.valid) {
      var siret = company.legals.siret.toString();
      if (siret.length < 14 || siret.length > 14) return;

      isSearchingSiret = true;
      var res = await graphQLInstance.query(SEARCH_COMPANY_SIRET, { input: siret});
      if (!res.success) {
        isSearchingSiret = false;
        stepper++;
        //TODO
        return;
      }

    company.legals.address = res.data.address;
    company.name = res.data.name;
    company.firstName = company.firstName
      ? company.firstName
      : res.data.firstName;
    company.lastName = company.lastName
      ? company.lastName
      : res.data.lastName;

      // if (addressIsDefined(company.legals.address)) {
      //   var res = await searchCompanyAddress(
      //     `${company.legals.address.line1}, ${company.legals.address.zipcode} ${company.legals.address.city}`
      //   );
      //   if (res.success) {
      //     company.legals.address = res.data;
      //   }
      // }
      stepper++;
      isSearchingSiret = false;
    }
  };

  const siretForm = form(() => ({
    siret: { value: company.legals.siret, validators: ['required'], enabled: true }
	}), {
    initCheck: false
  });

  const cancel = () => {
    localStorage.removeItem("user_choosen_role");
    routerInstance.goBack();
  }

  $: isValid = company.legals.siret && company.legals.siret.toString().length == 14;
</script>

<div class="text-center pb-8 px-5">
  Étape 1/5
  <p class="font-bold text-xl">Commençons par votre SIRET</p>
  <p class="text-gray-600">Grâce à votre SIRET, nous pourrons charger certaines informations de base.</p>
</div>
<form>
  <fieldset>
    <div class="flex">
      <div class="form-control w-full">
        <InputSiret
          disabled={isSearchingSiret}
          bind:value={company.legals.siret}
          bindClassData={{ form: siretForm, name: "siret" }}
          placeholder="SIRET (14 chiffres)" />
      </div>
    </div>
  </fieldset>
  <div class="flex w-full justify-center mt-5">
    <div>
      <button
        on:click={() => cancel()}
        aria-label="Retour"
        class="form-button uppercase text-sm cursor-pointer rounded-full
        px-6 py-2 flex items-center justify-center m-auto border border-gray-600 mr-2">
        Retour
      </button>
    </div>
    <div>
      <button
        class:disabled={isSearchingSiret || !isValid}
        on:click={validateSiret}
        aria-label="Suivant"
        disabled={isSearchingSiret || !isValid}
        class="form-button uppercase text-sm cursor-pointer text-white
        shadow rounded-full px-6 py-2 flex items-center justify-center
        m-auto bg-primary">
        Suivant
        {#if isSearchingSiret}
          <Icon data={faCircleNotch} spin class="ml-2" />
        {/if}
      </button>
    </div>
  </div>
</form>