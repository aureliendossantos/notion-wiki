import Link from "next/link"
import slugify from "slugify"
import useSWR, { SWRConfig } from "swr"
import getCategories from "/functions/getCategories"
import getPages from "/functions/getPages"

const fetcher = (...args) => fetch(...args).then(res => res.json())

export default function Home({ categories, fallback }) {
    return <>
        <SWRConfig value={{ fallback }}>
            {categories.map(category => (
                <Category category={category} key={category.id} />
            ))}
        </SWRConfig>
        {process.env.NODE_ENV == "development" ?
            <pre>{JSON.stringify(fallback, null, 2)}</pre>
        : null}
    </>
}

function Category({ category }) {
    const { data } = useSWR('/api/pages', fetcher)
    return <>
        <h2>{category.title}</h2>
        {category.description ? category.description : null}
        <ul>
            {data ? data
                .filter(page => page.category == category.id)
                .sort((a,b) => new Date(a.edited_time) - new Date(b.edited_time))
                .map(page => {
                    const slug = slugify(page.title, {remove: /[*+~.()'"!:@]/g})
                    return <Link key={slug} href={`/${slug}`}>
                        <li><a href={`/${slug}`}>{page.title}</a></li>
                    </Link>
                }
            ) : null}
        </ul>
    </>
}

export async function getStaticProps() {
    const categories = await getCategories()
    const pages = await getPages()

    return {
        props: {
            categories,
            fallback: {
                'api/pages': pages
            }
        },
        revalidate: 60
    }
}
