<script>
	import { onMount } from "svelte";
	import { faCheck } from "@fortawesome/free-solid-svg-icons";
	import ActionConfirm from "./../components/modal/ActionConfirm.svelte";
	import Cropper from "cropperjs";

	export let close,
		onClose,
		newElementMinWidth = 100,
		newElementMinHeight = 100,
		newElementMaxWidth = 100,
		newElementMaxHeight = 100,
		containerMaxHeight = 600,
		containerMaxWidth = 800,
		imageSmoothing = true,
		src = null;

	let imageChosen = false;
	let reader = new FileReader();
	let cropper = null;

	function loadFile(e) {
		imageChosen = true;
		let file = e.target.files[0];
		src = URL.createObjectURL(file);
		reader.readAsDataURL(file);

		if (!cropper) initCropper();

		cropper.replace(src);
	}

	const handleSubmit = async () => {
		if (!imageChosen) return await handleClose({ success: false, data: null });

		let res = cropper.getCroppedCanvas({
			minWidth: parseInt(newElementMinWidth),
			minHeight: parseInt(newElementMinHeight),
			maxWidth: parseInt(newElementMaxWidth ? newElementMaxWidth : newElementMinWidth),
			maxHeight: parseInt(newElementMaxHeight ? newElementMaxHeight : newElementMinHeight),
			imageSmoothingEnabled: imageSmoothing,
			imageSmoothingQuality: "high",
		});

		res.toBlob((blob) => {
			reader.readAsDataURL(blob);
			reader.onloadend = async () => {
				await handleClose({ success: true, data: reader.result });
			};
		});
	};

	const handleClose = async (res) => {
		close();
		await onClose(res);

		if (cropper) cropper.destroy();
	};

	const initCropper = () => {
		const image = document.getElementById("image");
		cropper = new Cropper(image, {
			viewMode: 0,
			dragMode: "move",
			checkCrossOrigin: false,
			responsive: true,
			rotatable: true,
			scalable: true,
			modal: true,
			minCropBoxHeight: parseInt(newElementMinHeight),
			minCropBoxWidth: parseInt(newElementMinWidth),
		});
	};

	onMount(() => {
		document.getElementById("avatar").click();
	});

</script>

<ActionConfirm
	class="modal"
	title="Nouvelle image"
	icon={faCheck}
	valid={imageChosen}
	submit={handleSubmit}
	submitText="Valider"
	closeText="Annuler"
	close={() => handleClose({ success: false, data: null })}
>
	<form>
		<div class="image-container" style="max-height: {containerMaxHeight}px; max-width:{containerMaxWidth}px;">
			<img id="image" {src} />
		</div>
		<div class="pt-5 m-auto text-center">
			<input on:change={loadFile} type="file" hidden id="avatar" name="avatar" accept="image/png, image/jpeg" />
			<div class="mt-5 mb-5 m-auto text-center">
				<label
					class="bg-accent px-8 py-3 shadow rounded-full text-lg justify-center
          cursor-pointer"
					for="avatar"
				>
					Choisir une nouvelle image
				</label>
			</div>
		</div>
	</form>
</ActionConfirm>

<style lang="scss">
	:global(.product-image) {
		@apply shadow-md;
		@apply cursor-move;
		margin: auto;
	}

	img {
		display: block;
		margin: auto;
		max-width: 100%;
	}

	.modal {
		max-width: 48em !important;
	}

</style>
