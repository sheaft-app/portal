<script>
	import Icon from "svelte-awesome";
	import { faEye } from "@fortawesome/free-solid-svg-icons";

	export let producer;
</script>

<div
	style="margin-bottom:1px;"
	class="cursor-pointer rounded hover:bg-gray-100 transition duration-200
  ease-in-out focus:outline-none"
	on:click
>
	<div class="shadow-md h-full bg-white">
		<div
			class="relative pb-5/6 overflow-hidden rounded-t-md lg:block
      hidden"
		>
			<div
				style="height: 150px; background-color: #fbfbfb;"
				class="transition duration-200 ease-in-out w-full rounded-t-md relative"
			>
				<img
					class="h-32 w-32 rounded-full p-1 border
          border-gray-800 border-solid m-auto absolute"
					style="top: calc(50% - 64px);left: calc(50% - 64px);"
					src={producer.picture}
					alt="Photo du producteur"
				/>
			</div>
		</div>
		<div class="relative lg:block flex p-3 lg:p-0">
			<div class="block lg:hidden w-1/4 text-xs">
				<img
					class="h-16 w-16 rounded-full p-1 border
            border-gray-800 border-solid m-auto absolute"
					src={producer.picture}
					alt="Photo du producteur"
				/>
			</div>
			<div class="bg-white rounded-lg p-0 pl-3 lg:p-4 w-full">
				<div class="flex justify-between">
					<h4
						class="font-semibold text-base lg:text-lg leading-tight
            mb-1 mt-3 mr-3"
					>
						{producer.name}
					</h4>
					<p class="flex items-center">
						<Icon data={faEye} class="mr-2" />{producer.observationsCount}
					</p>
				</div>
			</div>
		</div>
	</div>
</div>
