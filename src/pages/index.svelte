<script type="ts">
  import { url } from "@roxi/routify";
  import { app, fs, path } from "@tauri-apps/api";
  import { onMount } from "svelte";

  import { Settings } from "../Helpers";
  import { configPath, settings } from "../store";

  // Create configDir
  async function createConfigDirectory() {
    const configDir = await path.configDir();
    const appName = await app.getName();
    const configPathStr = configDir + path.sep + appName;

    try {
      await fs.createDir(configPathStr);
    } catch (error) {
      console.error(error);
    }

    $configPath = configPathStr;
  }

  async function loadSettings() {
    try {
      const settingsStr = await fs.readTextFile(
        $configPath + path.sep + "settings.json"
      );

      $settings = new Settings(JSON.parse(settingsStr));
    } catch (error) {
      console.error(error);
      $settings = new Settings();
    }
  }

  onMount(async () => {
    await createConfigDirectory();

    await loadSettings();
  });
</script>

<div class="flex flex-col h-screen">
  <nav class="flex flex-col items-center justify-center m-8 p-8">
    <h1 class="text-3xl">Heinonen's Dice</h1>
    <h2 class="text-xl">Version 1.0.0</h2>
  </nav>
  <main class="p-4 flex-grow bg-white w-full h-full">
    <div class="flex gap-4 items-stretch w-full h-full">
      <a class="mono button text-3xl bg-button" href={$url("/app")}>START</a>
      <a class="mono button text-3xl bg-button" href={$url("/settings")}
        >SETTINGS</a
      >
    </div>
  </main>
  <footer class="mono p-8 flex flex-col items-center">
    <p>Copyright 2021 - Made by Karar Al-Remahy</p>
  </footer>
</div>
