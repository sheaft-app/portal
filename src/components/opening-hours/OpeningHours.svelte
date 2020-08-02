<script>
  import { onMount } from "svelte";
  import LetterCheckbox from "../controls/LetterCheckbox.svelte";
  import TimePicker from "../controls/TimePicker.svelte";
  import DayOfWeekKind from "../../enums/DayOfWeekKind";

  export let opening;

  let days = [DayOfWeekKind.Monday, 
  DayOfWeekKind.Tuesday, 
  DayOfWeekKind.Wednesday, 
  DayOfWeekKind.Thursday, 
  DayOfWeekKind.Friday, 
  DayOfWeekKind.Saturday, 
  DayOfWeekKind.Sunday].map((day) => day = { ...day, checked: false });

  onMount(() => {
    days.map((d, i) => {
      if (opening.days.includes(d.Value)) {
        d.checked = true;
      }
    });

    days = days;
    opening.days = days;
  })
</script>

<div class="flex flex-wrap items-center my-2">
  <form class="inline-flex w-full">
    {#each days as day, index}
      <label
        style="display: flex;"
        class="items-center p-2 cursor-pointer hover:bg-gray-100">
        <LetterCheckbox 
        checked={day.checked}
        onClick={() => day.checked = !day.checked}
        sign={day.Label.charAt(0)} />
      </label>
    {/each}
  </form>
  <div class="inline-flex items-center mb-2 sm:mb-0">
    <span class="ml-2 mr-2 hidden sm:block">de</span>
    <span class="ml-2 mr-2 block sm:hidden w-24">Début : </span>
    <TimePicker bind:time={opening.start} />
  </div>
  <div class="inline-flex items-center">
    <span class="ml-2 mr-2 hidden sm:block">à</span>
    <span class="ml-2 mr-2 block sm:hidden w-24">Fin : </span>
    <TimePicker bind:time={opening.end} />
  </div>
</div>