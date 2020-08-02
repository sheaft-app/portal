<script>
  import { areDatesEquivalent } from './lib/helpers';
  import { fly, fade } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let days;
  export let selected;
  export let highlighted;
  export let shouldShakeDate;
  export let direction;
</script>

<div 
  class="scal-week" 
  in:fly|local={{ x: direction * 50, duration: 180, delay: 90 }}
  out:fade|local={{ duration: 180 }}
>
  {#each days as day}
    <div 
      class="scal-day" 
      class:scal-outside-month={!day.partOfMonth}
      class:scal-is-today={day.isToday}
      class:scal-is-disabled={!day.selectable}
    >
      <button 
        class="scal-day--label" 
        class:scal-selected={areDatesEquivalent(day.date, selected)}
        class:scal-highlighted={areDatesEquivalent(day.date, highlighted)}
        class:scal-shake-date={shouldShakeDate && areDatesEquivalent(day.date, shouldShakeDate)}
        class:scal-disabled={!day.selectable}
        type="button"
        on:click={() => dispatch('dateSelected', day.date)}
      >
        {day.date.getDate()}
      </button>
    </div>
  {/each}
</div>

<style>
  .scal-week { 
    padding: 0;
    margin: 0;
    display: -webkit-box;
    display: -moz-box;
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    flex-flow: row;
    -webkit-flex-flow: row;
    justify-content: space-around;
    -ms-grid-column: 1;
    grid-column: 1; 
  }
  .scal-week:nth-child(6n + 1) { 
    -ms-grid-row: 1; 
    grid-row: 1; 
  }
  .scal-week:nth-child(6n + 2) { 
    -ms-grid-row: 2; 
    grid-row: 2; 
  }
  .scal-week:nth-child(6n + 3) { 
    -ms-grid-row: 3; 
    grid-row: 3; 
  }
  .scal-week:nth-child(6n + 4) { 
    -ms-grid-row: 4; 
    grid-row: 4; 
  }
  .scal-week:nth-child(6n + 5) { 
    -ms-grid-row: 5; 
    grid-row: 5; 
  }
  .scal-week:nth-child(6n + 6) { 
    -ms-grid-row: 6; 
    grid-row: 6; 
  }
  .scal-day { 
    margin: 2px;
    color: var(--day-text-color);
    font-weight: bold;
    text-align: center;
    font-size: 16px;
    flex: 1 0 auto;
    height: auto;
    display: flex; 
    flex-basis: 0;
  }
  .scal-day.scal-outside-month, 
  .scal-day.scal-is-disabled { 
    opacity: 0.35;
  }
  .scal-day:before { 
    content: '';
    float: left;
    padding-top: 100%;
  }
  .scal-day--label { 
    color: var(--day-text-color);
    display: flex;
    justify-content: center;
    flex-direction: column;
    width: 100%;
    position: relative;
    border: 1px solid #fff;
    border-radius: 50%; 
    margin: 10%;
    padding: 0;
    align-items: center;
    background: var(--day-background-color);
    cursor: pointer;
    transition: all 100ms linear;
    font-weight: normal;
  }
  .scal-day--label.scal-disabled { 
    cursor: default;
  }
  @media (min-width: 480px) { 
    .scal-day--label.scal-highlighted,
    .scal-day--label:not(.scal-disabled):hover { 
      background: var(--day-highlighted-background-color);
      border-color: var(--day-highlighted-background-color);
      color: var(--day-highlighted-text-color);
    }
  }
  .scal-day--label.scal-shake-date { 
    animation: shake 0.4s 1 linear;
  }
  .scal-day--label.scal-selected:hover,
  .scal-day--label.scal-selected,
  .scal-day--label:active:not(.scal-disabled) { 
    background-color: var(--highlight-color);
    border-color: var(--highlight-color);
    color: #fff;
  }
  .scal-day.scal-is-today .scal-day--label, 
  .scal-day.scal-is-today .scal-day--label:hover { 
    opacity: 1; 
    background: none;
    border-color: var(--highlight-color);
    color: #000;
  }

  @keyframes shake {
    0% { transform: translate(7px); }
    20% { transform: translate(-7px); }
    40% { transform: translate(3px); }
    60% { transform: translate(-3px); }
    80% { transform: translate(1px); }
    100% { transform: translate(0px); }
  }
</style>
