<script>
	import { onMount } from "svelte";
	import Loader from "./../../components/Loader.svelte";
	import GetAuthInstance from "./../../services/SheaftAuth.js";
	import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
	import Icon from "svelte-awesome";
	import { faCircleNotch, faCheck } from "@fortawesome/free-solid-svg-icons";
	import { bindClass } from '../../../vendors/svelte-forms/src/index';
  import ErrorContainer from "./../../components/ErrorContainer.svelte";
  import { normalizeOpeningHours, denormalizeOpeningHours } from "./../../helpers/app";
  import GetNotificationsInstance from "./../../services/SheaftNotifications.js";
  import Cleave from "cleave.js";
  import "cleave.js/dist/addons/cleave-phone.fr";
  import {loginFreshdesk} from "./../../services/SheaftFreshdesk";

  export let user, form, updateQuery, getQuery, errorsHandler, userId, isLoading = false;

	const graphQLInstance = GetGraphQLInstance();
  const authInstance = GetAuthInstance();
  const notificationsInstance = new GetNotificationsInstance();
  let cleave = null;

  const handleGet = async () => {
		isLoading = true;
		var res = await graphQLInstance.query(getQuery, { id: userId, }, errorsHandler.Uuid);
		isLoading = false;

		if (!res.success) {
			//TODO
			return;
		}

    user = res.data;
    
    if (user.openingHours) {
      if (user.openingHours.length == 0) {
        user.openingHours = denormalizeOpeningHours([
          {
            id: 0,
            days: [],
            start: {
              hours: 0,
              minutes: 0
            },
            end: {
              hours: 0,
              minutes: 0
            }
          }
        ]);
      } else {
        user.openingHours = denormalizeOpeningHours(user.openingHours);
      }
    }
	};

	const handleUpdate = async () => {
		form.validate();

		if ($form.valid) {
      isLoading = true;
      let variables = user;
      
      if (user.openingHours) {
        let openingHours = normalizeOpeningHours(user.openingHours);
        variables = {
          ...user,
          openingHours
        }
      };

			var res = await graphQLInstance.mutate(updateQuery, variables, errorsHandler.Uuid);
			isLoading = false;

			if (!res.success) {
				//TODO
				return;
      }
      
      notificationsInstance.success(
        "Vos modifications ont bien été appliquées."
      );

      await authInstance.loginSilent();
      await loginFreshdesk();
		}
  };

  const initializeCleave = () => {
    cleave = new Cleave('.input-phone', {
      phone: true,
      phoneRegionCode: "fr"
    });
  }
  
	onMount(async () => {
		await handleGet();
	});
</script>

<div class="bg-white shadow px-5 py-3">
  <form class="w-full" on:submit|preventDefault={handleUpdate}>
    <div class="form-control">
      <div class="w-full md:w-1/2 pr-0 md:pr-2 mb-3 md:mb-0">
        <label for="grid-first-name">Prénom *</label>
        <input
          bind:value={user.firstName}
          class:skeleton-box={isLoading}
          disabled={isLoading}
          use:bindClass={{ form, name: "firstName" }}
          id="grid-first-name"
          type="text"
          placeholder="ex : Jean" />
        <ErrorContainer field={$form.fields.firstName} />
      </div>
      <div class="w-full md:w-1/2">
        <label for="grid-last-name">Nom *</label>
        <input
          bind:value={user.lastName}
          class:skeleton-box={isLoading}
          disabled={isLoading}
          use:bindClass={{ form, name: "lastName" }}
          type="text"
          placeholder="ex : Dupont" />
        <ErrorContainer field={$form.fields.lastName} />
      </div>
    </div>
    <div class="form-control">
      <div class="w-full md:w-1/2 pr-0 md:pr-2 mb-3 md:mb-0">
        <label for="grid-email">Email *</label>
        <input
          bind:value={user.email}
          disabled={isLoading}
          class:skeleton-box={isLoading}
          use:bindClass={{ form, name: "email" }}
          id="grid-email"
          type="email"
          placeholder="ex : jean.dupont@test.xyz" />
        <ErrorContainer field={$form.fields.email} />
      </div>
      <div class="w-full md:w-1/2">
        <label for="grid-phone">Téléphone</label>
        <input 
          bind:value={user.phone} 
          disabled={isLoading} 
          class:skeleton-box={isLoading} 
          placeholder="ex : 06 01 02 03 04"
          id="grid-phone" 
          type="tel"
          class="input-phone"
          use:initializeCleave />
      </div>
    </div>
    <slot />
    <p class="text-sm mt-5">* champs requis</p>
    <div class="form-control mt-5">
      <button
        type="submit"
        class:disabled={isLoading || !$form.valid}
        class="btn btn-lg btn-primary w-full md:w-auto justify-center">
        <Icon
          data={isLoading ? faCircleNotch : faCheck}
          class="mr-1 inline"
          spin={isLoading} />
        Valider
      </button>
    </div>
  </form>
</div>