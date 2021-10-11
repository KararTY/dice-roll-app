/// <reference types="svelte" />

import type { DiceSides } from "./Helpers";

export interface Res {
  rolls: Array<number[]> // x10 ndn
  dropped: Array<number[]> // l n
}

export interface Base {
  diceSides?: DiceSides
  rollsTimes?: number
  drop?: number
  seed?: number | string
}

export interface Instance extends Base {
  timestamps: {
    start: Date
    end: Date
  }
  res: Res[] // x1000
}

export interface InstanceSettingsType extends Base {
  times?: number
  amountOfDice?: number
}

export interface ChartsSettingsType {
  backgroundColor?: [string, number]
  barColor?: [string, number]
  fontColor?: [string, number]
}

export interface Settings {
  instances: InstanceSettingsType[]
  charts: ChartsSettingsType
}
