<script>
	import Icon from "svelte-awesome";
	import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";

	export let TopItemHandleClick = undefined,
		isWaiting = false;
</script>

<div
	class:disabled={isWaiting}
	disabled={isWaiting}
	on:click={TopItemHandleClick}
	class="cursor-pointer py-2 px-1 border-b border-gray-400 border-solid hover:bg-gray-200 flex items-center"
	style="color: #FF4081;"
>
	<Icon data={faMapMarkerAlt} class="mr-5 ml-3" />
	<div>
		<p class="text-semibold">Utiliser ma localisation</p>
	</div>
</div>
