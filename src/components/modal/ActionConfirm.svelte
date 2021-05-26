<script>
	import Icon from "svelte-awesome";
	import {faCircleNotch} from "@fortawesome/free-solid-svg-icons";
	import ErrorCard from "../ErrorCard.svelte";
	import {onMount} from "svelte";

	export let title,
		level,
		submit,
		close,
		submitText = "Confirmer",
		closeText = "Annuler",
		valid = true,
		icon = null,
		isLoading = false,
		errorsHandler = null;

	const renderColorWithLevel = level => {
		switch (level) {
			case "success":
				return "green";
			case "info":
				return "blue";
			case "warning":
				return "orange";
			case "danger":
				return "red";
			default:
				return "primary";
		}
	};

	async function handleSubmit(event) {
		event.preventDefault();
		await submit();
	}

	async function handleClose() {
		await close();
	}
</script>

<div>
	<div class="mt-3 text-center sm:mt-0 sm:text-left">
		<h3
			class="text-lg leading-6 font-medium {level ? `bg-${renderColorWithLevel(level)}-500` : 'bg-primary'} py-3 px-6 -mx-6 -mt-5 md:-mt-2 md:rounded-t-lg text-white">{title}</h3>

		<div class="mt-4">
			{#if errorsHandler}
				<ErrorCard {errorsHandler}/>
			{/if}
			<slot/>
		</div>
	</div>
</div>
<div class="bg-gray-50 px-2 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
  <span class="flex w-full rounded-md shadow-sm sm:ml-3 sm:w-auto">
    <button
			on:click={handleSubmit}
			type="submit"
			disabled={isLoading || !valid}
			aria-label={submitText}
			class="{isLoading || !valid ? 'disabled' : level ? `bg-${renderColorWithLevel(level)}-500` : 'bg-primary'}
      inline-flex justify-center w-full rounded-md border border-transparent
      px-4 py-2 text-base leading-6 font-medium text-white shadow-sm
      focus:outline-none transition ease-in-out duration-150 sm:text-sm
      sm:leading-5">
      {#if isLoading}
        <Icon data={faCircleNotch} spin class="inline"/>
				{submitText}
      {:else}{submitText}{/if}
    </button>
  </span>
	<span class="mt-3 flex w-full rounded-md shadow-sm sm:mt-0 sm:w-auto">
    <button
			on:click={handleClose}
			type="button"
			aria-label={closeText}
			class="inline-flex justify-center w-full rounded-md border border-gray-400
      px-4 py-2 bg-white text-base leading-6 font-medium shadow-sm
      focus:outline-none focus:border-blue-300
      focus:shadow-outline transition ease-in-out duration-150 sm:text-sm
      sm:leading-5">
      {closeText}
    </button>
  </span>
</div>

<style lang="scss">
	button {
		display: block;

		&.disabled {
			background-color: #e0e0e0;
		}

		&.warning {
			@apply bg-orange-500;

			&:hover {
				@apply bg-orange-400;
			}

			&:focus {
				@apply bg-orange-500;
			}
		}

		&.danger {
			@apply bg-red-600;

			&:hover {
				@apply bg-red-500;
			}

			&:focus {
				@apply bg-red-600;
			}
		}

		&.success {
			@apply bg-green-400;

			&:hover {
				@apply bg-green-500;
			}

			&:focus {
				@apply bg-green-500;
			}
		}
	}
</style>
