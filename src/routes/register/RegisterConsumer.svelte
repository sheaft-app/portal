<script>
  import Loader from "./../../components/Loader.svelte";
  import InputCheckbox from "./../../components/controls/InputCheckbox.svelte";
  import { REGISTER_CONSUMER } from "./mutations.js";
  import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
  import GetAuthInstance from "./../../services/SheaftAuth";
  import SheaftErrors from "./../../services/SheaftErrors";
  import GetRouterInstance from "./../../services/SheaftRouter";
  import { getContext, onDestroy } from "svelte";
  import ErrorCard from "../../components/ErrorCard.svelte";
	import { bindClass } from '../../../vendors/svelte-forms/src/index';
  import ErrorContainer from "./../../components/ErrorContainer.svelte";
  import { config } from "../../configs/config";
  import form from "../../stores/form";
  import { initialValues, validators } from "./registerConsumerForm";
  import { authUserAccount } from "./../../stores/auth.js";

  const authInstance = GetAuthInstance();
  const routerInstance = GetRouterInstance();
  const { mutate } = getContext("api");
  const errorsHandler = new SheaftErrors();

  let isRegistering = false;
  let acceptCgv = false;
  let acceptMangoCgv = false;
  let sub = null;
  let user = { ...initialValues($authUserAccount) }

  user = form.initialize(user, validators, initialValues());

  let isLoading = false;

  const handleSubmit = async () => {
    isRegistering = true;
    await mutate({
      mutation: REGISTER_CONSUMER,
      variables: user,
      errorsHandler,
      success: async () => {
        localStorage.removeItem("user_choosen_role");
        localStorage.removeItem("user_sponsoring");
        await authInstance.refreshLogin('/');
      },
      errorNotification: "Impossible d'enregistrer le compte. Veuillez réessayer ou contacter le support technique."
    });
    isRegistering = false;
  };

  const handleCancel = () => {
    localStorage.removeItem("user_choosen_role");
    routerInstance.goBack();
  };

  onDestroy(() => {
    if(sub != null)
      sub.unsubscribe();
  });
</script>

<svelte:head>
  <title>Enregistrement consommateur</title>
</svelte:head>

<TransitionWrapper>
  <div class="-my-2 m-auto py-2 overflow-x-auto md:w-3/5 mt-2 mb-8 h-full -mx-4 md:m-auto">
    <ErrorCard {errorsHandler}/>
    {#if !isRegistering && !isLoading}
      <div class="w-full text-center pt-2 pb-4">
        <h1 class="font-bold text-xl">Terminons votre inscription</h1>
      </div>
      <div class="px-5 py-3 bg-white w-full shadow lg:rounded">
        <form>
          <fieldset>
            <div class="w-full flex flex-wrap justify-center">
              <div class="mb-2 mt-2 form-control w-full">
                <label for="family_name">Nom*</label>
                <input
                  id="family_name"
                  type="text"
                  use:bindClass={{ form, name: "lastName" }}
                  bind:value={user.lastName} />
                <ErrorContainer field={$form.fields.lastName} />
              </div>
              <div class="mb-2 mt-2 form-control w-full">
                <label for="given_name">Prénom*</label>
                <input
                  id="given_name"
                  use:bindClass={{ form, name: "firstName" }}
                  type="text"
                  bind:value={user.firstName} />
                <ErrorContainer field={$form.fields.firstName} />
              </div>
            </div>
            <div class="w-full justify-center hidden">
              <div>
                <label
                  for="email"
                  class="block uppercase tracking-wide text-xs font-bold mb-2">
                  Adresse email*
                </label>
                <input
                  id="email"
                  type="email"
                  disabled="disabled"
                  use:bindClass={{ form, name: "email" }}
                  bind:value={user.email}
                  class="disabled appearance-none block w-full border back-bg-clr
                  rounded py-3 px-4 leading-tight focus:outline-none
                  focus:bg-white" />
                  <ErrorContainer field={$form.fields.email} />
              </div>
            </div>
            <!-- <div class="flex flex-wrap justify-center mb-2 mt-2">
              <div class="form-control w-full" style="display: block;">
                <label for="dept">Département*</label>
                <div class="themed" use:bindClass={{ form, name: "selectedDepartment" }}>
                  <Select
                    getOptionLabel={getLabel}
                    getSelectionLabel={getLabel}
                    items={$departments.sort((a, b) =>
                      a.code >= b.code ? 1 : -1
                    )}
                    iconClasses="mr-3"
                    isClearable={false}
                    invalid={$form.fields.selectedDepartment.dirty && !$form.fields.selectedDepartment.valid}
                    showChevron={true}
                    hideSelectedOnFocus={true}
                    optionIdentifier="id"
                    placeholder="Tapez le numéro de votre département"
                    bind:selectedValue={selectedDepartment}
                    containerStyles="font-weight: 600;" />
                </div>
                <ErrorContainer field={$form.fields.selectedDepartment} />
              </div>
            </div> -->
            <!-- <div class="w-full flex flex-wrap justify-center mb-5 mt-2">
              <button
                type="button"
                class:hidden={sponsorShow}
                class="btn-link"
                on:click={() => (sponsorShow = true)}>
                J'ai un code parrain
              </button>
              {#if sponsorShow}
                <div class="form-control w-full">
                  <label for="code">Code parrain</label>
                  <input id="code" type="code" bind:value={user.sponsoringCode} />
                </div>
              {/if}
            </div> -->
            <div class="mt-4">
              <label class="cursor-pointer">
                <InputCheckbox
                  checked={acceptCgv}
                  onClick={() => (acceptCgv = !acceptCgv)} />
                Je reconnais avoir lu et compris
                <a href="https://www.sheaft.com/legals" target="_blank">
                  les conditions générales de vente et d'utilisation
                </a>
                et je les accepte
              </label>
            </div>
            <div class="mt-2">
              <label class="cursor-pointer">
                <InputCheckbox
                  checked={acceptMangoCgv}
                  onClick={() => (acceptMangoCgv = !acceptMangoCgv)} />
                Je reconnais avoir lu et compris
                <a href="{config.content + '/resources/legals/Mangopay_Terms-FR.pdf'}" target="_blank">
                  les conditions générales d'utilisation de MangoPay,
                </a>
                notre tiers de paiement, et je les accepte
              </label>
            </div>

            <!-- <div class="flex flex-wrap justify-center">
              <div>
                <label
                  for="anonymous"
                  class="block uppercase tracking-wide text-gray-700 text-xs
                  font-bold mb-2 cursor-pointer">
                  <InputCheckbox
                    checked={!user.anonymous}
                    onClick={() => (user.anonymous = !user.anonymous)} />
                  <label for="checkbox">
                    Je souhaite afficher mon prénom et mon image de profil dans
                    les classements Sheaft (j'apparaîtrai en "Anonyme" dans le cas
                    échéant)
                  </label>
                </label>
              </div>
            </div> -->
          </fieldset>
        </form>
        <div class="flex w-full justify-center mt-6">
          <div>
            <button
              on:click={() => handleCancel()}
              aria-label="Retour"
              class="form-button uppercase text-sm cursor-pointer rounded-full
              px-6 py-2 flex items-center justify-center m-auto">
              Retour
            </button>
          </div>
          <div>
            <button
              class:disabled={!$form.valid || !acceptCgv || !acceptMangoCgv}
              disabled={!acceptCgv || !acceptMangoCgv}
              on:click={() => form.validateAndSubmit(handleSubmit)}
              aria-label="Valider"
              class="form-button uppercase text-sm cursor-pointer text-white
              shadow rounded-full px-6 py-2 flex items-center justify-center
              m-auto bg-primary">
              Terminer
            </button>
          </div>
        </div>
      </div>
    {/if}
    {#if isLoading}
      <Loader />
    {/if}
    {#if isRegistering}
      <Loader text="Validation de votre compte en cours..." />
    {/if}
  </div>
</TransitionWrapper>

<style>
  img {
    height: 80px;
    width: 100%;
  }
  .themed {
    display: contents;
    --cursor: text;
    --padding: 22px 16px;
    --borderFocusColor: #a0aec0;
    --borderHoverColor: #a0aec0;
    --border: 1px solid #cbd5e0;
    --placeholderColor: #a0aec0;
    --inputPadding: 1rem;
    --inputColor: #205164;
  }
</style>
