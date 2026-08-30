export interface ChatSidebarState {
  isDesktop: boolean
  desktopExpanded: boolean
  mobileOpen: boolean
}

export type ChatSidebarAction =
  | { type: "viewport-changed"; isDesktop: boolean }
  | { type: "toggle" }
  | { type: "open" }
  | { type: "close" }
  | { type: "new-chat" }

export interface ChatSidebarPresentation {
  desktopExpanded: boolean
  mobileOpen: boolean
  visible: boolean
}

export function createSidebarState(): ChatSidebarState {
  return {
    isDesktop: false,
    desktopExpanded: false,
    mobileOpen: false,
  }
}

export function reduceSidebarState(
  state: ChatSidebarState,
  action: ChatSidebarAction,
): ChatSidebarState {
  switch (action.type) {
    case "viewport-changed":
      return {
        ...state,
        isDesktop: action.isDesktop,
        mobileOpen: false,
      }
    case "toggle":
      return state.isDesktop
        ? { ...state, desktopExpanded: !state.desktopExpanded }
        : { ...state, mobileOpen: !state.mobileOpen }
    case "open":
      return state.isDesktop
        ? { ...state, desktopExpanded: true }
        : { ...state, mobileOpen: true }
    case "close":
      return state.isDesktop
        ? { ...state, desktopExpanded: false }
        : { ...state, mobileOpen: false }
    case "new-chat":
      return state.isDesktop ? state : { ...state, mobileOpen: false }
  }
}

export function getSidebarPresentation(
  state: ChatSidebarState,
): ChatSidebarPresentation {
  return {
    desktopExpanded: state.desktopExpanded,
    mobileOpen: state.mobileOpen,
    visible: state.isDesktop || state.mobileOpen,
  }
}
