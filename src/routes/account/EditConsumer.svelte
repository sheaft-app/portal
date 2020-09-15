<script>
	import { UPDATE_CONSUMER } from "./mutations.js";
	import { GET_CONSUMER_DETAILS } from "./queries.js";
	import { form, bindClass } from '../../../vendors/svelte-forms/src/index';
	import ErrorContainer from "./../../components/ErrorContainer.svelte";
	import ProfileForm from "./ProfileForm.svelte";

	export let errorsHandler, userId;

	let consumer = {
		firstName: null,
		lastName: null,
		email: null
	};
	
	const consumerForm = form(() => ({
    firstName: { value: consumer.firstName, validators: ['required'], enabled: true },
    lastName: { value: consumer.lastName, validators: ['required'], enabled: true },
    email: { value: consumer.email, validators: ['required', 'email'], enabled: true },
	}), {
    initCheck: false
	});
</script>

<ProfileForm
	bind:user={consumer}
	form={consumerForm}
	updateQuery={UPDATE_CONSUMER}
	getQuery={GET_CONSUMER_DETAILS}
	{errorsHandler}
	{userId}>
</ProfileForm>