export const APP_LANDSCAPE_STAGE_ID = 'app-landscape-stage'

export function getAppPortalRoot(): HTMLElement {
  return document.getElementById(APP_LANDSCAPE_STAGE_ID) ?? document.body
}