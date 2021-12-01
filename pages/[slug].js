import Link from "next/link"
import slugify from "slugify"

import { Client } from '@notionhq/client'

import { NotionAPI } from 'notion-client'
import { NotionRenderer } from 'react-notion-x'

export default function Page({ page_blockmap }) {
    return (
        <>
            <NotionRenderer recordMap={page_blockmap} fullPage={true} />
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
        fallback: false
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

    const notionAlt = new NotionAPI()
    const page_blockmap = await notionAlt.getPage(page.id)

    return {
        props: {
            page_blockmap
        },
        revalidate: 60
    }
}