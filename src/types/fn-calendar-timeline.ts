export interface FortniteCalendarTimelineData {
  channels: Channels
  cacheIntervalMins: number
  currentTime: string
}

export interface Channels {
  tk: Tk
}

// Timeline Keychain
export interface Tk {
  states: TkState[]
  cacheExpire: string
}

export interface TkState {
  validFrom: string
  activeEvents: any[]
  state: TkInnerState
}

export interface TkInnerState {
  k: string[]
}
