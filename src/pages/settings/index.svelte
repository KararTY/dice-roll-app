<script type="ts">
  import { url } from "@roxi/routify";
  import { onMount } from "svelte";
  import { shell, path, fs } from "@tauri-apps/api";

  import Instances from "./instances.svelte";
  import Charts from "./charts.svelte";

  import type { ChartsSettingsType, InstanceSettingsType } from "../../global";
  import { Settings } from "../../Helpers";
  import { settings, temporarySettings } from "../../store";
  import { BaseDirectory } from "@tauri-apps/api/fs";

  async function saveSettings() {
    const instances = [];

    const instancesForms = Object.entries(document.forms).filter((arr) =>
      arr[1].id.startsWith("instance")
    );
    for (let index = 0; index < instancesForms.length; index++) {
      const [_, form] = instancesForms[index];

      const instanceSettings: InstanceSettingsType = {};
      for (let index2 = 0; index2 < form.elements.length; index2++) {
        const input = form.elements[index2] as HTMLInputElement;

        if (["text", "select-one"].includes(input.type)) {
          instanceSettings[input.name] = input.value;
        } else if (input.type === "number") {
          if (input.name === "drop") {
            const rollsTimes = Number(form.elements["rollsTimes"].value);
            const drop = Number(input.value);
            instanceSettings[input.name] =
              drop >= rollsTimes ? rollsTimes - 1 : drop;
          } else {
            instanceSettings[input.name] = Number(input.value);
          }
        }
      }

      instances.push(instanceSettings);
    }

    const chartsForm = document.forms["chartsSettings"] as HTMLFormElement;

    const charts: ChartsSettingsType = {};
    for (let index = 0; index < chartsForm.elements.length; index++) {
      const input = chartsForm.elements[index] as HTMLInputElement;

      if (!input.name) continue;

      const input2 = document.getElementById(
        input.name + "Alpha"
      ) as HTMLInputElement;

      if (input.type === "color") {
        charts[input.name] = [input.value, Number(input2.value)];
      }
    }

    $settings = new Settings({
      instances,
      charts,
    });

    $temporarySettings.instances = $settings.instances;

    await saveSettingsToFile();

    console.log("Saved!");
    return;
  }

  async function saveSettingsToFile() {
    await fs.writeFile(
      {
        path: "settings.json",
        contents: JSON.stringify($settings, null, 2),
      },
      { dir: BaseDirectory.App }
    );
  }

  async function resetSettingsToDefault() {
    $settings = new Settings();
    $temporarySettings = { ...$settings };

    await saveSettingsToFile();

    console.log("Resetting settings to default!");
    return;
  }

  onMount(() => {
    $temporarySettings = { ...$settings };
  });
</script>

<div class="flex flex-col h-screen">
  <nav class="flex flex-col items-center justify-center m-8 p-8">
    <h1 class="text-3xl">Settings</h1>
  </nav>
  <main class="p-4 flex-grow bg-white overflow-y-scroll">
    <a href={$url("/app")} class="mono button bg-button p-4 mb-2">GO BACK</a>
    <div class="flex flex-row gap-4">
      <Instances />
      <Charts />
    </div>
  </main>
  <footer class="mono flex gap-4 items-stretch p-4">
    <button
      class="flex-1 bg-button p-4 rounded-md flex items-center justify-center"
      on:click={saveSettings}>SAVE</button
    >
    <button
      class="flex-1 bg-button p-4 rounded-md flex items-center justify-center"
      on:click={resetSettingsToDefault}>RESET TO DEFAULT</button
    >
    <p class="flex-1">
      <label for="directory">Settings directory</label>
      {#await path.appDir()}
        <p>Waiting for directory...</p>
      {:then dir}
        <input
          on:click={function () {
            this.select();
          }}
          type="text"
          class="input"
          id="directory"
          value={dir}
          on:keydown={(ev) => ev.preventDefault()}
        />
      {/await}
    </p>
  </footer>
</div>
