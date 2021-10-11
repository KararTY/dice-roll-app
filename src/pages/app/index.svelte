<script type="ts">
  import { goto } from "@roxi/routify";

  import History from "./history.svelte";
  import Result from "./result.svelte";
  import Charts from "./charts.svelte";

  import type { Instance, InstanceSettingsType } from "../../global";
  import {
    DiceSides,
    getTotals,
    returnSmallest,
    getFormulaString,
  } from "../../Helpers";
  import {
    historyArray,
    currentInstances,
    randomChance,
    Chance,
    settings,
  } from "../../store";

  let currentView = "result";

  function openSettings() {
    $goto("/settings");
    return;
  }

  function showResult() {
    currentView = "result";
  }

  function showCharts() {
    currentView = "charts";
  }

  function createInstances() {
    const instances = [];

    for (let index = 0; index < $settings.instances.length; index++) {
      const instanceSettings = $settings.instances[index];

      instances.push(loopDice(instanceSettings));
    }

    $currentInstances = instances;

    if (instances.length > 0) {
      addToHistoryArray(instances);
    }
  }

  function loopDice({
    times,
    rollsTimes,
    amountOfDice,
    diceSides,
    drop,
    seed,
  }: InstanceSettingsType) {
    let instance: Instance = {
      timestamps: {
        start: new Date(),
        end: null,
      },
      diceSides,
      rollsTimes,
      drop,
      seed,
      res: [],
    };

    // Random
    let chance = randomChance;

    // Seeded
    if (seed) {
      chance = new Chance(seed);
    }

    for (let index = 0; index < times; index++) {
      const { rolls, dropped } = rollDice(
        rollsTimes,
        amountOfDice,
        diceSides,
        drop,
        chance
      );
      instance.res.push({
        rolls,
        dropped,
      });
    }

    instance.timestamps.end = new Date();

    return instance;
  }

  function rollDice(
    rollsTimes: number,
    amountOfDice: number,
    diceSides: DiceSides,
    drop: number,
    chance: Chance.Chance
  ) {
    // Mutated.
    const rolls: Array<number[]> = [];

    for (let index = 0; index < rollsTimes; index++) {
      rolls.push(rollNDN(amountOfDice, diceSides, chance)); // Push NdN
    }

    // Drop n lowest.
    // Mutates rolls.
    const dropped = dropNLowest(drop, rolls);

    return {
      rolls,
      dropped,
    };
  }

  function rollNDN(times: number, diceSides: DiceSides, chance: Chance.Chance) {
    const res = [];

    for (let index = 0; index < times; index++) {
      res.push(chance[diceSides]());
    }

    return res;
  }

  function dropNLowest(times: number, rolls: Array<number[]>) {
    const dropped: Array<number[]> = [];
    const totals = getTotals(rolls);

    for (let index = 0; index < times; index++) {
      const smallest = returnSmallest(totals);

      const pos = totals.findIndex((total) => total === smallest);

      dropped.push(...rolls.splice(pos, 1));
      totals.splice(pos, 1);
    }

    return dropped;
  }

  function addToHistoryArray(instance: Instance[]) {
    $historyArray = [...$historyArray, instance].sort((a, b) => {
      return b[0].timestamps.end.getTime() - a[0].timestamps.end.getTime();
    });
  }
</script>

<div class="h-screen flex flex-col">
  <nav class="flex flex-col items-center justify-center m-8 p-8">
    {#if $currentInstances.length > 0}
      <h1 class="text-3xl">
        {$currentInstances
          .map((instance) => `[${getFormulaString(instance)}]`)
          .join(" vs ")}
      </h1>
    {:else}
      <h1 class="text-3xl">Tap on "Roll Dice" to get started!</h1>
    {/if}
  </nav>
  <main class="flex-grow flex flex-row overflow-hidden bg-white">
    <div class="flex-1 flex flex-row">
      <div class="flex-1 flex flex-col">
        <nav class="pt-4 px-4">
          <div class="flex flex-row items-center gap-2">
            <p class="text-xl flex-grow w-full">
              {currentView.substr(0, 1).toUpperCase() + currentView.substr(1)}
            </p>
            <button
              class={(currentView === "result" ? "is-active " : "") +
                "mono button bg-button p-1"}
              on:click={showResult}>RESULT</button
            >
            <button
              class={(currentView === "charts" ? "is-active " : "") +
                "mono button bg-button p-1"}
              on:click={showCharts}>CHARTS</button
            >
          </div>
        </nav>
        {#if currentView === "result"}
          <Result />
        {:else if currentView === "charts"}
          <Charts />
        {/if}
      </div>
      <History />
    </div>
  </main>
  <footer class="mono flex gap-4 items-stretch m-4">
    <button class="button bg-button p-4" on:click={createInstances}
      >ROLL DICE</button
    >
    <button class="button bg-button p-4" on:click={openSettings}
      >SETTINGS</button
    >
  </footer>
</div>
