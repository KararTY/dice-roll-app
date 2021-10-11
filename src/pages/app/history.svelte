<script type="ts">
  import { getFormulaString, getTotals } from "../../Helpers";
  import { currentInstances, historyArray } from "../../store";

  function clearHistory() {
    $historyArray = [];
  }

  function loadFromHistory(index: number) {
    $currentInstances = $historyArray[index];
  }
</script>

<div class="flex flex-col max-w-sm w-96">
  <nav class="flex flex-row items-center gap-2 pt-4 px-4">
    <p class="text-xl flex-grow w-full">History</p>
    <button class="mono button bg-button p-1" on:click={clearHistory}
      >CLEAR</button
    >
  </nav>
  <div class="flex-1 overflow-y-auto p-4">
    <div class="flex flex-col align-stretch gap-2">
      {#each $historyArray as instances, index}
        <button
          class="button bg-button p-4"
          on:click={() => loadFromHistory(index)}
          >{instances
            .map((instance) => `[${getFormulaString(instance, true)}]`)
            .join(" vs ")}</button
        >
      {/each}
    </div>
  </div>
</div>
