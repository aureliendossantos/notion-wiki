import { Client } from "@notionhq/client"

export default async function getCategories() {
    const notion = new Client({
        auth: process.env.NOTION_SECRET
    })
    let results = []
    let data = await notion.databases.query({
        database_id: process.env.CATEGORIES_DATABASE_ID
    })
    results = [...data.results]
    while (data.has_more) {
        data = await notion.databases.query({
            database_id: process.env.CATEGORIES_DATABASE_ID,
            start_cursor: data.next_cursor
        })
        results = [...results, ...data.results]
    }
    const categories = results.map(page => ({
        id: page.id,
        title: page.properties.Nom.title[0].plain_text,
        description: page.properties.Description.rich_text[0] ? page.properties.Description.rich_text[0].plain_text : null
    }))
    return categories
}
