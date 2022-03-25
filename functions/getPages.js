import { Client } from "@notionhq/client"

export default async function getPages() {
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
    const pages = results.map(page => ({
        id: page.id,
        title: page.properties.Nom.title[0].plain_text,
        category: page.properties.Catégorie.relation[0].id,
        edited_time: page.last_edited_time
    }))
    return { pages, results }
}
