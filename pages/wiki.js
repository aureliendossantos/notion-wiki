import { Client } from "@notionhq/client"

export default function Movies({ categories, pages, results }) {
    return (
        <>
            {categories.map(category => (
                <>
                    <h2>{category.title}</h2>
                    {category.description ? category.description : null}
                    <ul>
                        {pages
                            .filter(page => page.category == category.id)
                            .sort((a,b) => new Date(a.edited_time) - new Date(b.edited_time))
                            .map(page => (
                                <li><a href={page.url}>{page.title}</a></li>
                            )
                        )}
                    </ul>
                </>
            ))}
            <pre>{JSON.stringify(results, null, 2)}</pre>
        </>
    )
}

export async function getStaticProps() {
    const notion = new Client({
        auth: process.env.NOTION_SECRET
    })

    let resultsC = []
    let dataC = await notion.databases.query({
        database_id: process.env.CATEGORIES_DATABASE_ID
    })
    resultsC = [...dataC.results]
    while (dataC.has_more) {
        dataC = await notion.databases.query({
            database_id: process.env.CATEGORIES_DATABASE_ID,
            start_cursor: dataC.next_cursor
        })
        resultsC = [...resultsC, ...dataC.results]
    }
    const categories = resultsC.map(page => ({
        id: page.id,
        title: page.properties.Nom.title[0].plain_text,
        description: page.properties.Description.rich_text[0] ? page.properties.Description.rich_text[0].plain_text : null
    }))

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
        url: page.url,
        category: page.properties.Catégorie.relation[0].id,
        edited_time: page.last_edited_time
    }))

    return {
        props: {
            categories,
            pages,
            results,
        }
    }
}
