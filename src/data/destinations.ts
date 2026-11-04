import type { Destination } from '../types/mission'

import destinationsJson from './destinations.json'

export type DestinationCatalog = {
  countries: Destination[]
  places: Destination[]
}

export const destinations = destinationsJson as DestinationCatalog
