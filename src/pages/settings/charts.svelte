<script type="ts">
  import { temporarySettings } from "../../store";

  function settingsNameString(key: string) {
    return key
      .split(/(?=[A-Z])/)
      .map((str) => str.substr(0, 1).toUpperCase() + str.substr(1))
      .join(" ");
  }
</script>

<div class="flex-1">
  <h1 class="text-2xl">Charts</h1>
  <hr class="border-2 rounded my-4 bg-hr" />
  <form id="chartsSettings">
    {#each Object.entries($temporarySettings.charts) as [key, value]}
      <div class="flex flex-row">
        <p class="flex-1">
          <label for="names">{settingsNameString(key)}</label>
          <input type="color" class="input" name={key} value={value[0]} />
        </p>
        <p class="flex-shrink w-20">
          <label for={key + "Alpha"}>Alpha</label>
          <input
            type="number"
            class="input"
            id={key + "Alpha"}
            step="0.01"
            min="0"
            max="1"
            value={value[1]}
          />
        </p>
      </div>
    {/each}
  </form>
</div>
