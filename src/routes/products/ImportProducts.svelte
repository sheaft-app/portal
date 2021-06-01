<script>
	import { getContext, onMount } from "svelte";
	import Dropzone from "dropzone";
	import Icon from "svelte-awesome";
	import { faUpload, faFile, faCheck } from "@fortawesome/free-solid-svg-icons";
	import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
	import { config } from "./../../configs/config.js";
	import GetNotificationsInstance from "./../../services/SheaftNotifications.js";
	import SheaftErrors from "./../../services/SheaftErrors";
	import { GET_PRODUCTS, UPLOAD_PRODUCTS } from "./queries";

	export let onClose, close;

	const { query } = getContext("api");
	const notificationsInstance = GetNotificationsInstance();
	const errorsHandler = new SheaftErrors();

	let isLoading = false;
	let dropzone;
	let currentFile = null;
	$: hasFiles = false;

	onMount(() => {
		dropzone = new Dropzone("div#dropzone", {
			maxFiles: 1,
			addRemoveLinks: true,
			autoProcessQueue: false,
			dictRemoveFile: "Retirer",
			url: "/file/post",
			previewTemplate: document.querySelector("#preview-template").innerHTML,
			createImageThumbnails: false,
			acceptedFiles: ".xlsx,.xls",
			accept: (file) => {
				currentFile = file;
			},
		});

		dropzone.on("addedfile", (file) => {
			hasFiles = dropzone.files.length > 0;
		});

		dropzone.on("removedfile", (file) => {
			hasFiles = dropzone.files.length > 0;
		});
	});

	const handleSubmit = async () => {
		isLoading = true;

		await query({
			query: UPLOAD_PRODUCTS,
			variables: { file: currentFile },
			errorsHandler,
			success: async (result) => await handleClose({ success: true, data: result }),
			successNotification:
				"Le chargement de votre fichier est en cours, vous pouvez continuer à utiliser notre plateforme en attendant la fin de l'import.",
			errorNotification: "Une erreur est survenue lors du chargement de votre fichier vers notre serveur.",
		});
	};

	const handleClose = async (res) => {
		close();
		if (onClose) await onClose(res);
	};

</script>

<ActionConfirm
	{errorsHandler}
	title="Importer des produits"
	submit={handleSubmit}
	close={() => handleClose({ success: false, data: null })}
	submitText="Importer"
	{isLoading}
	icon={faCheck}
	valid={hasFiles}
	closeText="Fermer"
>
	<p class="py-3">Pour enrichir votre catalogue, il vous suffit de compléter ces quelques étapes:</p>
	<div class="p-4">
		<ul class="list-decimal">
			<li>
				Téléchargez le modèle de catalogue
				<a href={config.content + "/resources/excel/sheaft_catalogue_produits.xlsx"}> en cliquant ici</a>.
			</li>
			<li>Complétez le fichier Excel téléchargé en veillant à bien respecter les colonnes.</li>
		</ul>
	</div>
	<div
		id="dropzone"
		class:text-center={!hasFiles}
		class:flex={!hasFiles}
		class="items-center justify-center cursor-pointer mt-2"
	>
		<div class:hidden={hasFiles} class="drop text-gray-500 m-auto p-3" style="z-index: -1;">
			<Icon data={faUpload} scale="3" class="mb-5 opacity-50 inline" />
			<p>Une fois complété, cliquez dans cette zone pour importer le fichier.</p>
		</div>
	</div>
	<div id="preview-template" style="display: none;">
		<div class="dz-preview dz-file-preview">
			<div class="flex">
				<div class="dz-image">
					<Icon data={faFile} class=" inline" />
				</div>
				<div class="dz-details">
					<div class="dz-filename">
						<span data-dz-name="" />
					</div>
				</div>
			</div>
		</div>
	</div>
</ActionConfirm>

<style lang="scss">
	.drop {
		background-color: #f4fbf4;
		color: #646a64 !important;
	}

	.dz-preview {
		padding: 10px;
		border-bottom: 1px solid #dedede;

		.dz-details {
			.dz-filename {
				max-width: 300px;
				overflow: hidden;
				text-overflow: ellipsis;
			}
		}

		.dz-image {
			margin-right: 10px;
			color: #33d7a3;
		}
	}

</style>
