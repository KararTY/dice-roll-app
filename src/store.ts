import Ch from "chance"

import type { Instance } from "./global"

import type { Writable } from "svelte/store"
import { writable } from "svelte/store"
import { ErrorInstance, Settings } from "./Helpers"

export const historyArray: Writable<Array<(Instance | ErrorInstance)[]>> = writable([])

export const currentInstances: Writable<(Instance | ErrorInstance)[] | undefined> = writable([])

export const settings: Writable<Settings> = writable(new Settings())
export const isInPercentage: Writable<boolean> = writable(false)

export const temporarySettings: Writable<Settings> = writable(new Settings())

export const randomChance = new Ch()
export const Chance = Ch
