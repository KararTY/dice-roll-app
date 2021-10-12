<script type="ts">
  import { onDestroy, onMount } from "svelte";
  import Chart from "chart.js/auto";
  import ChartDataLabels from "chartjs-plugin-datalabels";

  Chart.register(ChartDataLabels);

  import { currentInstances, isInPercentage, settings } from "../../store";
  import {
    bgPlugin,
    ErrorInstance,
    getAllRolls,
    getFormulaString,
    hexToRGBA,
    reduceTotal,
  } from "../../Helpers";
  import type { Instance } from "../../global";

  const defaultChartPlugins = (
    fontColor: [string, number],
    instance: Instance
  ) => {
    return {
      title: {
        color: hexToRGBA(...fontColor),
        display: true,
        text: getFormulaString(instance),
      },
      legend: {
        labels: {
          color: hexToRGBA(...fontColor),
        },
      },
      datalabels: {
        clamp: true,
        anchor: "center" as "center",
        align: "end" as "end",
        formatter: function (value: number, context: any) {
          return $isInPercentage
            ? (value < 0.1 ? value.toFixed(5) : value.toFixed(2)) + "%"
            : value;
        },
      },
    };
  };

  let unsubscribe;
  let initialChartData;

  globalThis.chart = {};

  let resizeTimeout: NodeJS.Timeout;
  async function onWindowResize() {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }

    // Delete existing.
    const charts = Object.entries(globalThis.chart || {});

    for (let index = 0; index < charts.length; index++) {
      const [key, _] = charts[index];

      if (!globalThis.chart[key]) {
        continue;
      }

      globalThis.chart[key].destroy();

      const chartElement = document.getElementById(key) as HTMLCanvasElement;

      if (chartElement) {
        chartElement.width = 1;
        chartElement.height = 1;
        chartElement.removeAttribute("style");
      }
    }

    initialChartData = getInitialChartData();

    resizeTimeout = setTimeout(() => {
      for (let index = 0; index < $currentInstances.length; index++) {
        const instance = $currentInstances[index];

        if (!(instance instanceof ErrorInstance)) {
          initializeChart(instance);
          initializeChart2(instance);
        }
      }
    }, 100);
  }

  function getInitialChartData() {
    const chartsRootElement = document.getElementById("charts");

    const { paddingTop, paddingBottom, paddingLeft, paddingRight } =
      getComputedStyle(chartsRootElement);

    const width =
      chartsRootElement.getBoundingClientRect().width -
      (parseFloat(paddingLeft) + parseFloat(paddingRight) * 2 + 1);
    const height =
      chartsRootElement.getBoundingClientRect().height -
      (parseFloat(paddingTop) + parseFloat(paddingBottom));

    return { width, height };
  }

  function initializeChart(instance: Instance) {
    const id = instance.timestamps.end.getTime().toString() + "-diceSides";

    const chartElement = document.getElementById(id) as HTMLCanvasElement;

    chartElement.width = initialChartData.width;
    chartElement.height = initialChartData.height;

    let rollCountsObject = {
      labels: [] as string[],
      data: [] as number[],
    };

    if ($currentInstances) {
      rollCountsObject = getObjectOfRollCounts(instance);
    }

    if ($isInPercentage) {
      rollCountsObject = turnItIntoPercents(rollCountsObject);
    }

    const ctx = chartElement.getContext("2d");

    globalThis.chart[id] = new Chart(ctx, {
      type: "bar",
      data: {
        labels: rollCountsObject.labels,
        datasets: [
          {
            label:
              "# of dice sides" + ($isInPercentage ? " in percentage" : ""),
            data: rollCountsObject.data,
            backgroundColor: hexToRGBA(...$settings.charts.barColor),
          },
        ],
      },
      plugins: [bgPlugin($settings.charts.backgroundColor)],
      options: {
        plugins: defaultChartPlugins($settings.charts.fontColor, instance),
        indexAxis: "y",
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  function initializeChart2(instance: Instance) {
    const id = instance.timestamps.end.getTime().toString() + "-totals";

    const chartElement = document.getElementById(id) as HTMLCanvasElement;

    chartElement.width = initialChartData.width;
    chartElement.height = initialChartData.height;

    let rollCountsObject = {
      labels: [] as string[],
      data: [] as number[],
    };

    if ($currentInstances) {
      rollCountsObject = getObjectOfTotalsCount(instance);
    }

    if ($isInPercentage) {
      rollCountsObject = turnItIntoPercents(rollCountsObject);
    }

    const ctx = chartElement.getContext("2d");

    globalThis.chart[id] = new Chart(ctx, {
      type: "bar",
      data: {
        labels: rollCountsObject.labels,
        datasets: [
          {
            label: "# of totals" + ($isInPercentage ? " in percentage" : ""),
            data: rollCountsObject.data,
            backgroundColor: hexToRGBA(...$settings.charts.barColor),
          },
        ],
      },
      plugins: [bgPlugin($settings.charts.backgroundColor)],
      options: {
        plugins: defaultChartPlugins($settings.charts.fontColor, instance),
        indexAxis: "y",
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  function getObjectOfRollCounts(instance: Instance) {
    const tempArray: Array<{ label: string; value: number }> = [];

    const allRolls = getAllRolls(instance);
    for (let index = 0; index < allRolls.length; index++) {
      const num = allRolls[index];

      const entry = tempArray.find((entry) => entry.label === String(num));

      if (entry) {
        entry.value++;
      } else {
        tempArray.push({
          label: String(num),
          value: 1,
        });
      }
    }

    sortArrayByLabels(tempArray);

    return getRes(tempArray);
  }

  function getObjectOfTotalsCount(instance: Instance) {
    const tempArray: Array<{ label: string; value: number }> = [];

    for (let index = 0; index < instance.res.length; index++) {
      const rolls = instance.res[index].rolls;

      for (let index2 = 0; index2 < rolls.length; index2++) {
        const roll = rolls[index2];

        const total = reduceTotal(roll);

        const entry = tempArray.find((entry) => entry.label === String(total));

        if (entry) {
          entry.value++;
        } else {
          tempArray.push({
            label: String(total),
            value: 1,
          });
        }
      }
    }

    sortArrayByLabels(tempArray);

    return getRes(tempArray);
  }

  function turnItIntoPercents({
    labels,
    data,
  }: {
    labels: string[];
    data: number[];
  }) {
    const totals = reduceTotal(data);
    for (let index = 0; index < labels.length; index++) {
      const val = data[index];

      data[index] = (val / totals) * 100;
    }

    return { labels, data };
  }

  function getRes(tempArray: Array<{ label: string; value: number }>) {
    const res = {
      labels: [] as string[],
      data: [] as number[],
    };

    for (let index = 0; index < tempArray.length; index++) {
      const entry = tempArray[index];
      res.labels.push(entry.label);
      res.data.push(entry.value);
    }

    return res;
  }

  function sortArrayByLabels(
    tempArray: Array<{ label: string; value: number }>
  ) {
    tempArray.sort((a, b) => {
      return Number(a.label) - Number(b.label);
    });
  }

  function showInPercentage() {
    $isInPercentage = !$isInPercentage;

    onWindowResize();
  }

  onMount(() => {
    unsubscribe = currentInstances.subscribe(() => {
      initialChartData = getInitialChartData();
      onWindowResize();
    });
  });

  onDestroy(() => {
    unsubscribe();

    for (let index = 0; index < $currentInstances.length; index++) {
      const instance = $currentInstances[index];

      if (!(instance instanceof ErrorInstance)) {
        globalThis.chart[
          instance.timestamps.end.getTime().toString() + "-diceSides"
        ].destroy();

        globalThis.chart[
          instance.timestamps.end.getTime().toString() + "-totals"
        ].destroy();
      }
    }
  });
</script>

<svelte:window on:resize={onWindowResize} />

<main class="flex-1 overflow-y-scroll mt-1 p-4 pt-3" id="charts">
  <div class="flex">
    <button class="mono bg-button button p-4 my-2" on:click={showInPercentage}
      >SHOW IN {$isInPercentage ? "NUMBERS" : "PERCENTAGE"}</button
    >
  </div>
  {#each $currentInstances as instance, index}
    <div>
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
        <div>
          <canvas
            id={instance.timestamps.end.getTime().toString() + "-diceSides"}
          />
          <canvas
            id={instance.timestamps.end.getTime().toString() + "-totals"}
          />
        </div>
      {/if}
    </div>
  {/each}
</main>
