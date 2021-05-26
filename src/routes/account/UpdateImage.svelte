<script>
	import {faCheck} from "@fortawesome/free-solid-svg-icons";
	import ImgEncoder from "svelte-image-encoder";
  	import GetAuthInstance from "./../../services/SheaftAuth";
	import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
	import SheaftErrors from "./../../services/SheaftErrors";
	import {config} from "../../configs/config";
	import { getContext } from "svelte";

	export let id, mutation, close, onClose, initialSrc = config.content + "/pictures/users/profile.svg";

	const errorsHandler = new SheaftErrors();
  	const authInstance = GetAuthInstance();
	const { mutate } = getContext("api");

	let src = initialSrc;

	let url;
	let quality = 1;
	let imageChosen = false;
	let realTime = false;
	let isLoading = false;
	let originalPicture = null;

	$: valid = initialSrc !== src;

	// let reader = new FileReader();
	// reader.onloadend = function () {
	// 	originalPicture = reader.result;
	// }

	function loadFile(e) {
		let file = e.target.files[0];
		src = URL.createObjectURL(file);
		//reader.readAsDataURL(file);
	}

	const handleSubmit = async () => {
		isLoading = true;
		await mutate({
			mutation,
			variables: {id: authInstance.user.id, picture: url },
			errorsHandler,
			success: (res) => handleClose(res),
			errorNotification: "Impossible de mettre à jour votre photo de profil."
		});
		isLoading = false;
	};

	const handleClose = async res => {
		close();
		return await onClose(res);
	};
</script>

<ActionConfirm
	{errorsHandler}
	title="Modifier la photo"
	icon={faCheck}
	{valid}
	isLoading={isLoading}
	submit={handleSubmit}
	submitText="Modifier"
	closeText="Annuler"
	{close}>
	<form>
		<div class="pt-5 m-auto text-center">
			<ImgEncoder
				{src}
				bind:imageChosen
				{quality}
				bind:url
				{realTime}
				width={128}
				height={128}
				crossOrigin="anonymous"
				classes="profile-image"/>
			<input
				on:change={loadFile}
				type="file"
				hidden
				id="avatar"
				name="avatar"
				accept="image/png, image/jpeg"/>
			<div class="mt-5 mb-5 m-auto text-center">
				<label
					class="btn px-3 py-2 btn-accent cursor-pointer justify-center"
					for="avatar">
					Choisir une nouvelle photo
				</label>
			</div>
		</div>
	</form>
</ActionConfirm>

<style lang="scss">
	:global(.profile-image) {
		@apply shadow-md;
		@apply rounded-full;
		@apply cursor-move;
		margin: auto;
	}
</style>
