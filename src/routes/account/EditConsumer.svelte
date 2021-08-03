<script>
	import { UPDATE_CONSUMER } from "./mutations.js";
	import { GET_CONSUMER_DETAILS } from "./queries.js";
	import ProfileForm from "./ProfileForm.svelte";
	import { initialValues, validators, normalizeConsumer } from "./consumerForm";

	export let errorsHandler;

	let consumer = { ...initialValues };
</script>

<ProfileForm
	bind:user={consumer}
	{validators}
	normalizer={normalizeConsumer}
	{initialValues}
	updateQuery={UPDATE_CONSUMER}
	getQuery={GET_CONSUMER_DETAILS}
	{errorsHandler}
/>
