import { Client } from "@notionhq/client"
import slugify from "slugify"
import getChildren from '/functions/getChildren'

export default async function getPage(slug) {
    const notion = new Client({
        auth: process.env.NOTION_SECRET
    })

    let results = []
    let data = await notion.databases.query({
        database_id: process.env.PAGES_DATABASE_ID
    })
    results = [...data.results]
    while (data.has_more) {
        data = await notion.databases.query({
            database_id: process.env.PAGES_DATABASE_ID,
            start_cursor: data.next_cursor
        })
        results = [...results, ...data.results]
    }

    const page = data.results.find(result => {
        return slugify(result.properties.Nom.title[0].plain_text, {remove: /[*+~.()'"!:@]/g}) === slug
    })

    const pageChildren = await getChildren(page.id)
    async function recursivelyGetChildren(blocks) {
        const result = await Promise.all(blocks.map(async (block) => {
            if (block.has_children) {
                const children = await getChildren(block.id)
                const recursiveChildren = await recursivelyGetChildren(children)
                return {
                    ...block,
                    children: recursiveChildren
                }
            } else {
                return block
            }
        }))
        return result
    }
    const blocks = await recursivelyGetChildren(pageChildren)
    return { page, blocks }
}
