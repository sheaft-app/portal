<script>
    import Loader from "../Loader.svelte";
    import { onMount } from "svelte";
    import OpeningHours from "./OpeningHours.svelte";
    import Guid from "./../../helpers/Guid";
    import { denormalizeOpeningHours } from "./../../helpers/app";

    export let openings = [];
    let isLoading = true;

    const addOpeningHour = () => {
     openings = [
        ...openings,
        {
            id: Guid.NewGuid(),
            days: [],
            start: {
                hours: 0,
                minutes: 0
            },
            end: {
                hours: 0,
                minutes: 0
            }
        }
      ]
    };

    const removeOpeningHour = (id) => {
      openings.filter((o) => o.id === id);
    }

    onMount(async () => {
      openings = denormalizeOpeningHours(openings);
      isLoading = false;
    });
</script>

{#if isLoading}
    <Loader />
{:else}
    {#each openings as opening, index (opening.id)}
        {#if index >= 1}
            <hr class="my-5" />
        {/if}
        <OpeningHours bind:opening={opening} />
        <div class="flex justify-end">
            <button type="button" 
            on:click={() => openings = openings.filter((o) => o.id !== opening.id)}
            class="text-accent text-sm">Retirer cet horaire</button>
        </div>
    {/each}
    <div>
        <button type="button" class="btn px-3 py-2 btn-accent my-2" on:click={addOpeningHour}>+ Ajouter un horaire</button>
    </div>
{/if}