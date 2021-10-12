<script type="ts">
  import {
    ErrorInstance,
    getAllTotals,
    getAverageInInstance,
    getFormulaString,
    getGenerationDurationInMs,
    quickSelectMedian,
  } from "../../Helpers";
  import { currentInstances } from "../../store";
</script>

<main class="flex-1 overflow-y-scroll mt-1 p-4 pt-3">
  {#if $currentInstances.length > 0}
    <div>
      {#each $currentInstances as instance, index}
        <hr class="border-2 rounded my-4 bg-hr" />
        {#if instance instanceof ErrorInstance}
          <p>
            <strong>Instance #{index + 1}:</strong>
            <span>Errored out. Check your settings.</span>
          </p>
          {#each instance.errors as { title, description }}
            <p><strong>{title}: </strong> {description}</p>
          {/each}
        {:else}
          <p>
            <strong>Instance #{index + 1}:</strong>
            <span>{getFormulaString(instance)}</span>
          </p>
          <p>
            <strong>Generation time: </strong>
            <span>{getGenerationDurationInMs(instance)}ms</span>
          </p>
          <p>
            <strong>Average </strong>
            <span>| {getAverageInInstance(instance)}</span>
          </p>
          <p>
            <strong>Median </strong>
            <span>| {quickSelectMedian(getAllTotals(instance))}</span>
          </p>
        {/if}
      {/each}
    </div>
  {:else}
    <hr class="border-2 rounded my-4 bg-hr" />
    <p>Waiting for a roll...</p>
  {/if}
</main>
