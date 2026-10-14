import { type SchemaTypeDefinition } from 'sanity'

import { areaPage } from './areaPage'
import { areaTemplate } from './areaTemplate'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [areaTemplate, areaPage],
}
