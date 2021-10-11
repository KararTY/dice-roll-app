import type { ChartsSettingsType, Instance, InstanceSettingsType } from "./global";

export function getTotals(arr: Array<number[]>) {
  return arr.map((arr) => reduceTotal(arr));
}

export function reduceTotal(arr: number[]) {
  return arr.reduce((acc, curr) => acc + curr, 0);
}

export function returnSmallest(numbers: Number[]) {
  return Math.min.apply(null, numbers) as number;
}

export function getAllRolls(instance: Instance) {
  let resRolls: number[] = [];

  for (let index = 0; index < instance.res.length; index++) {
    const rolls = instance.res[index].rolls;

    resRolls.push(...rolls.flat())
  }

  return resRolls
}

export function getAllTotals(instance: Instance) {
  let totals: number[] = [];

  for (let index = 0; index < instance.res.length; index++) {
    const rolls = instance.res[index].rolls // x10

    totals.push(...getTotals(rolls))
  }

  return totals
}

export function getAverageInInstance(instance: Instance) {
  let totals = getAllTotals(instance)

  return (reduceTotal(totals) / totals.length)
}

export function getFormulaString(instance: Instance, small = false) {
  const exampleRoll = instance.res[0].rolls[0]

  let strRes = `x${instance.res.length}(x`
  strRes += `${instance.rollsTimes} `
  strRes += `${exampleRoll.length}${instance.diceSides}`

  if (instance.drop && instance.drop > 0) {
    strRes += ` ${small ? 'l' : 'drop'} ${instance.drop})`
  } else {
    strRes += ')'
  }

  if (instance.seed) {
    strRes += small ? ' S' : ' (Seeded)'
  }

  return strRes
}

export function getGenerationDurationInMs(instance: Instance) {
  return instance.timestamps.end.getTime() - instance.timestamps.start.getTime()
}

export enum DiceSides {
  d4 = "d4",
  d6 = "d6",
  d8 = "d8",
  d10 = "d10",
  d12 = "d12",
  d20 = "d20",
  d30 = "d30",
  d100 = "d100",
}

export class InstanceSettings {
  public times?: number
  public rollsTimes?: number
  public amountOfDice?: number
  public diceSides?: DiceSides
  public drop?: number
  public seed?: number | string

  constructor(settings?: InstanceSettingsType) {
    this.times = settings?.times || 1000
    this.rollsTimes = settings?.rollsTimes || 10
    this.amountOfDice = settings?.amountOfDice || 3
    this.diceSides = settings?.diceSides || DiceSides.d6
    this.drop = typeof settings?.drop === 'number' ? settings.drop : 2
    this.seed = settings?.seed
  }
}

export class Settings {
  public instances: InstanceSettingsType[]
  public charts: ChartsSettingsType

  constructor(settings?: Settings) {
    // Default settings.
    this.instances = settings?.instances || [
      new InstanceSettings({ seed: '1234' }),
      new InstanceSettings({ drop: 0, rollsTimes: 8, seed: '1234' })
    ]
    this.charts = settings?.charts || {
      backgroundColor: ['#ffffff', 1],
      barColor: ['#000000', 0.1],
      fontColor: ['#000000', 1],
    }
  }
}

export const bgPlugin = (backgroundColor: [string, number]) => {
  return {
    id: "bgPlugin",
    beforeDraw: (chart: any) => {
      const ctx = chart.canvas.getContext("2d");
      ctx.save();
      ctx.globalCompositeOperation = "destination-over";
      ctx.fillStyle = hexToRGBA(...backgroundColor);
      ctx.fillRect(0, 0, chart.width, chart.height);
      ctx.restore();
    }
  }
}

/* quickSelect implementation from https://stackoverflow.com/a/56901151 */
export function quickSelectMedian(arr: number[]) {
  const L = arr.length, halfL = L / 2;
  if (L % 2 == 1) {
    return quickSelect(arr, halfL);
  } else {
    return 0.5 * (quickSelect(arr, halfL - 1) + quickSelect(arr, halfL));
  }
}

export function quickSelect(arr: number[], k: number) {
  // Select the kth element in arr
  // arr: List of numerics
  // k: Index
  // return: The kth element (in numerical order) of arr
  if (arr.length === 1) {
    return arr[0];
  } else {
    const pivot = arr[0];
    const lows = arr.filter((e) => (e < pivot));
    const highs = arr.filter((e) => (e > pivot));
    const pivots = arr.filter((e) => (e == pivot));

    if (k < lows.length) {
      // the pivot is too high
      return quickSelect(lows, k);
    } else if (k < lows.length + pivots.length) {
      // We got lucky and guessed the median
      return pivot;
    } else {
      // the pivot is too low
      return quickSelect(highs, k - lows.length - pivots.length);
    }
  }
}
/* quickSort CC BY-SA 4.0 */

/* hexToRGBA implementation from https://stackoverflow.com/a/53936623 */
const isValidHex = (hex: string) => /^#([A-Fa-f0-9]{3,4}){1,2}$/.test(hex)

const getChunksFromString = (st: string, chunkSize: number) => st.match(new RegExp(`.{${chunkSize}}`, "g"))

const convertHexUnitTo256 = (hexStr: string) => parseInt(hexStr.repeat(2 / hexStr.length), 16)

const getAlphafloat = (a: number, alpha: number) => {
  if (typeof a !== "undefined") { return a / 255 }
  if ((typeof alpha != "number") || alpha < 0 || alpha > 1) {
    return 1
  }
  return alpha
}

export const hexToRGBA = (hex: string, alpha?: number) => {
  if (!isValidHex(hex)) { throw new Error("Invalid HEX") }
  const chunkSize = Math.floor((hex.length - 1) / 3)
  const hexArr = getChunksFromString(hex.slice(1), chunkSize)
  const [r, g, b, a] = hexArr.map(convertHexUnitTo256)
  return `rgba(${r}, ${g}, ${b}, ${getAlphafloat(a, alpha)})`
}
/* hexToRGBA CC BY-SA 4.0 */

/* standardDeviation implementation from https://stackoverflow.com/a/63838108
export const standardDeviation = (arr: any[], usePopulation = false) => {
  const mean = arr.reduce((acc: any, val: any) => acc + val, 0) / arr.length;

  return Math.sqrt(
    arr.reduce((acc: any[], val: number) => acc.concat((val - mean) ** 2), []).reduce((acc: number, val: number) => acc + val, 0) /
    (arr.length - (usePopulation ? 0 : 1))
  );
};
standardDeviation CC BY-SA 4.0 */