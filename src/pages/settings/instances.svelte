<script type="ts">
  import type { InstanceSettingsType } from "../../global";
  import { DiceSides, InstanceSettings } from "../../Helpers";
  import { temporarySettings } from "../../store";

  function removeInstance(ev: MouseEvent) {
    const el = ev.currentTarget as HTMLButtonElement;

    const index = Number(el.dataset["instanceIndex"]);

    $temporarySettings.instances.splice(index, 1);
    $temporarySettings = $temporarySettings;
  }

  function addNewInstance() {
    $temporarySettings.instances = [
      ...$temporarySettings.instances,
      new InstanceSettings(),
    ];
  }

  function getInstanceSettingsString(instance: InstanceSettingsType) {
    let strRes = `x${instance.times}(x`;
    strRes += `${instance.rollsTimes} `;
    strRes += `${instance.amountOfDice}${instance.diceSides}`;

    if (instance.drop && instance.drop > 0) {
      strRes += ` drop ${instance.drop})`;
    } else {
      strRes += ")";
    }

    if (instance.seed) {
      strRes += " (Seeded)";
    }

    return strRes;
  }
</script>

<div class="flex-1">
  <h1 class="text-2xl">Instances (x{$temporarySettings.instances.length})</h1>
  {#each $temporarySettings.instances as instance, index}
    <hr class="border-2 rounded my-4 bg-hr" />
    <nav class="flex flex-row items-center gap-2">
      <p class="text-xl flex-grow w-full">
        <strong>Instance #{index + 1}:</strong>
        <span>{getInstanceSettingsString(instance)}</span>
      </p>
      <button
        class="mono bg-button button p-1"
        on:click={removeInstance}
        data-instance-index={index.toString()}>REMOVE</button
      >
    </nav>
    <form id={"instance" + index.toString()}>
      <label for="names">Times</label>
      <small>(How many instances to simulate.)</small>
      <input
        type="number"
        class="input"
        name="times"
        min="1"
        value={instance.times}
      />
      <br />
      <label for="rollsTimes">Rolls times</label>
      <small>(How many times to throw the dice for a total.)</small>
      <input
        type="number"
        class="input"
        name="rollsTimes"
        min="1"
        value={instance.rollsTimes}
      />
      <br />
      <label for="amountOfDice">Amount of dice</label>
      <small>(How many dice to throw.)</small>
      <input
        type="number"
        class="input"
        name="amountOfDice"
        min="1"
        value={instance.amountOfDice}
      />
      <br />
      <label for="diceSides">Dice sides</label>
      <small>(Which dice to throw.)</small>
      <select class="input" name="diceSides">
        {#each Object.keys(DiceSides) as diceSide}
          {#if diceSide === instance.diceSides}
            <option value={diceSide} selected>{diceSide}</option>
          {:else}
            <option value={diceSide}>{diceSide}</option>
          {/if}
        {/each}
      </select>
      <br />
      <label for="drop">Drop</label>
      <small
        >(How many of the lowest roll total to drop, it must be lower than
        "Rolls times".)</small
      >
      <input
        type="number"
        class="input"
        name="drop"
        min="0"
        value={instance.drop}
      />
      <br />
      <label for="seed">Seed</label>
      <small>(Leave empty for random seed.)</small>
      <input
        type="text"
        class="input"
        name="seed"
        value={instance.seed || ""}
      />
    </form>
  {/each}
  <hr class="border-2 rounded my-4 bg-hr" />
  <div class="flex">
    <button class="mono bg-button button p-4 my-2" on:click={addNewInstance}
      >CREATE INSTANCE</button
    >
  </div>
</div>
