<script type="ts">
  import { url } from "@roxi/routify";
  import { fs } from "@tauri-apps/api";
  import { BaseDirectory } from "@tauri-apps/api/fs";
  import { onMount } from "svelte";

  import { Settings } from "../Helpers";
  import { settings } from "../store";

  // Create configDir
  async function createConfigDirectory() {
    try {
      await fs.createDir("", { dir: BaseDirectory.App });
    } catch (error) {
      console.error(error);
    }
  }

  async function loadSettings() {
    try {
      const settingsStr = await fs.readTextFile("settings.json", { dir: BaseDirectory.App });

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
