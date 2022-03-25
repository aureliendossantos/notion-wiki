import { useRouter } from 'next/router'
import Link from "next/link"
import slugify from "slugify"

import { Client } from '@notionhq/client'
import PageRender from "/components/PageRender"
import getChildren from '/functions/getChildren'

export default function Page({ page, blocks }) {
    const router = useRouter()
    if (router.isFallback) {
        return <h1>Chargement...</h1>
    }
    return (
        <>
            <h1>{page.properties.Nom.title[0].plain_text}</h1>
            {page.properties.Description.rich_text[0] ?
                <p>{page.properties.Description.rich_text[0].plain_text}</p>
                : null
            }
            <PageRender blocks={blocks} />
            {process.env.NODE_ENV == "development" ?
                <>
                    <hr/>
                    <h1>Source</h1>
                    <pre>{JSON.stringify(blocks, null, 2)}</pre>
                </>
            : null
            }
        </>
    )
}

export async function getStaticPaths() {
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

    const paths = data.results.map(page => {
        return {
            params: {
                slug: slugify(page.properties.Nom.title[0].plain_text, {remove: /[*+~.()'"!:@]/g})
            }
        }
    })

    return {
        paths,
        fallback: true
    }
}

export async function getStaticProps({ params: { slug } }) {

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
    const blocks = await Promise.all(pageChildren.map(async (block) => {
        if (block.has_children) {
            const children = await getChildren(block.id)
            return {
                ...block,
                children: children
            }
        } else {
            return block
        }
    }))

    return {
        props: {
            page,
            blocks
        },
        revalidate: 60
    }
}