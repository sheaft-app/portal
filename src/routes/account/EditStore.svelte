<script>
	import { UPDATE_STORE } from "./mutations.js";
	import { GET_STORE_DETAILS } from "./queries.js";
	import { form, bindClass } from '../../../vendors/svelte-forms/src/index';
	import ErrorContainer from "./../../components/ErrorContainer.svelte";
	import ProfileForm from "./ProfileForm.svelte";

	export let errorsHandler, userId;

	let store = {
		firstName: null,
		lastName: null,
		email: null
	};
	
	const storeForm = form(() => ({
    firstName: { value: store.firstName, validators: ['required'], enabled: true },
    lastName: { value: store.lastName, validators: ['required'], enabled: true },
    email: { value: store.email, validators: ['required', 'email'], enabled: true },
	}), {
    initCheck: false
	});
</script>

<ProfileForm
	bind:user={store}
	form={storeForm}
	updateQuery={UPDATE_STORE}
	getQuery={GET_STORE_DETAILS}
	{errorsHandler}
	{userId}>
</ProfileForm>