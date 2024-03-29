import { useRouter } from 'next/router'
import Link from "next/link"
import slugify from "slugify"
import useSWR, { SWRConfig } from "swr"

import { Client } from '@notionhq/client'
import PageRender from "/components/PageRender"
import getPage from '/functions/getPage'

const fetcher = (...args) => fetch(...args).then(res => res.json())

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
    const { page, blocks } = await getPage(slug)

    return {
        props: {
            page,
            blocks
        },
        revalidate: 60
    }
}