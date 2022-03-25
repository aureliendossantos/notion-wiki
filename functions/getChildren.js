import { Client } from "@notionhq/client"

export default async function getChildren(blockId) {
    const notion = new Client({
        auth: process.env.NOTION_SECRET
    })
    let results = []
    let data = await notion.blocks.children.list({
        block_id: blockId
    })
    results = [...data.results]
    while (data.has_more) {
        data = await notion.blocks.children.list({
            block_id: blockId,
            start_cursor: data.next_cursor
        })
        results = [...results, ...data.results]
    }
    return results
}
