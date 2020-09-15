<script>
	import { UPDATE_PRODUCER } from "./mutations.js";
	import { GET_PRODUCER_DETAILS } from "./queries.js";
	import { form, bindClass } from '../../../vendors/svelte-forms/src/index';
	import ErrorContainer from "./../../components/ErrorContainer.svelte";
	import ProfileForm from "./ProfileForm.svelte";

	export let errorsHandler, userId;

	let producer = {
		firstName: null,
		lastName: null,
		email: null
	};
	
	const producerForm = form(() => ({
    firstName: { value: producer.firstName, validators: ['required'], enabled: true },
    lastName: { value: producer.lastName, validators: ['required'], enabled: true },
    email: { value: producer.email, validators: ['required', 'email'], enabled: true }
	}), {
    initCheck: false
	});
</script>

<ProfileForm
	bind:user={producer}
	form={producerForm}
	updateQuery={UPDATE_PRODUCER}
	getQuery={GET_PRODUCER_DETAILS}
	{errorsHandler}
	{userId}>
</ProfileForm>