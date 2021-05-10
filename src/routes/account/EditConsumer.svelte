<script>
	import { UPDATE_CONSUMER } from "./mutations.js";
	import { GET_CONSUMER_DETAILS } from "./queries.js";
	import { form } from '../../../vendors/svelte-forms/src/index';
	import ProfileForm from "./ProfileForm.svelte";

	export let errorsHandler;

	let consumer = {
		id: null,
		firstName: null,
		lastName: null,
		email: null,
		facebook: null,
		instagram: null,
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
	{errorsHandler}>
	<h3 class="font-semibold uppercase mb-0 mt-5">Vos réseaux sociaux</h3>
	<span class="bg-primary h-1 w-20 mt-2 mb-6 block"></span>
	<div class="form-control">
		<div class="w-full md:w-2/2 flex justify-between">
			<svg style="width: 30px;" class="mr-5" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
					 fill="#1877F2"><title>Facebook</title>
				<path
					d="M23.9981 11.9991C23.9981 5.37216 18.626 0 11.9991 0C5.37216 0 0 5.37216 0 11.9991C0 17.9882 4.38789 22.9522 10.1242 23.8524V15.4676H7.07758V11.9991H10.1242V9.35553C10.1242 6.34826 11.9156 4.68714 14.6564 4.68714C15.9692 4.68714 17.3424 4.92149 17.3424 4.92149V7.87439H15.8294C14.3388 7.87439 13.8739 8.79933 13.8739 9.74824V11.9991H17.2018L16.6698 15.4676H13.8739V23.8524C19.6103 22.9522 23.9981 17.9882 23.9981 11.9991Z"/>
			</svg>
			<input
				bind:value={consumer.facebook}
				id="grid-line5"
				type="url"
				placeholder="Adresse vers votre page Facebook"/>
		</div>
	</div>
	<div class="form-control">
		<div class="w-full md:w-2/2 flex justify-between">
			<svg style="width: 30px;" class="mr-5" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
					 fill="#E4405F"><title>Instagram</title>
				<path
					d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
			</svg>
			<input
				bind:value={consumer.instagram}
				id="grid-line6"
				type="url"
				placeholder="Adresse vers votre page Instagram"/>
		</div>
	</div>
</ProfileForm>
