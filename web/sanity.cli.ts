/**
 * Settings for the Sanity CLI (npx sanity ...). Run CLI commands with the env file loaded:
 *   node --env-file=.env.local node_modules/sanity/bin/sanity <command>
 */
import { defineCliConfig } from 'sanity/cli'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET

export default defineCliConfig({ api: { projectId, dataset } })
