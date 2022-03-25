import Link from "next/link"
import slugify from "slugify"
import useSWR, { SWRConfig } from "swr"
import getCategories from "/functions/getCategories"
import getPages from "/functions/getPages"

const fetcher = (...args) => fetch(...args).then(res => res.json())

export default function Home({ categories, results, fallback }) {
    return (
        <SWRConfig value={{ fallback }}>
            {categories.map(category => (
                <Category category={category} key={category.id} />
            ))}
            {process.env.NODE_ENV == "development" ?
                <pre>{JSON.stringify(results, null, 2)}</pre>
            : null}
        </SWRConfig>
    )
}

function Category({ category }) {
    const { data: pages } = useSWR('/api/pages', fetcher)
    return <>
        <h2>{category.title}</h2>
        {category.description ? category.description : null}
        <ul>
            {pages ? pages
                .filter(page => page.category == category.id)
                .sort((a,b) => new Date(a.edited_time) - new Date(b.edited_time))
                .map(page => {
                    const slug = slugify(page.title, {remove: /[*+~.()'"!:@]/g})
                    return <Link key={slug} href={`/${slug}`}>
                        <li><a href={`/${slug}`}>{page.title}</a></li>
                    </Link>
                }
            ) : null }
        </ul>
    </>
}

export async function getStaticProps() {
    const categories = await getCategories()
    const { pages, results } = await getPages()

    return {
        props: {
            categories,
            results,
            fallback: {
                'api/pages': pages
            }
        },
        revalidate: 60
    }
}
