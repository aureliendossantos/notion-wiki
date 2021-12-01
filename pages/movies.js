import { Client } from "@notionhq/client"
import igdb from 'igdb-api-node'

export default function Movies({ movies, results, games }) {
    return (
        <>
            <p>La question du jour maintenant : comment query les images pour chaque jeu sans faire une requête par jeu.</p>
            <pre>{JSON.stringify(games, null, 2)}</pre>
            <img src={"https://images.igdb.com/igdb/image/upload/t_cover_big/" + games[0].cover.image_id + ".jpg"}></img>
            {games[0].screenshots.map(screenshot => (
                <img key={screenshot.image_id} src={"https://images.igdb.com/igdb/image/upload/t_thumb/" + screenshot.image_id + ".jpg"}></img>
            ))}
            <p>Longueur : {movies.length}</p>
            {movies.map(item => (
                <>
                    <h3>{item.title}</h3>
                    <h2>{item.number}</h2>
                    {item.comment ? <p>{item.comment}</p> : null}
                    <hr></hr>
                </>
            ))}
            <pre>{JSON.stringify(movies, null, 2)}</pre>
            <pre>{JSON.stringify(results, null, 2)}</pre>
        </>
    )
}

export async function getStaticProps() {
    const notion = new Client({
        auth: process.env.NOTION_SECRET
    })
    const filter = {
        and: [
            {
                property: "Type",
                select: {
                    equals: "Jeu"
                },
            },
            {
                property: "Review",
                number: {
                    is_not_empty: true
                }
            }
        ]
    }
    let results = []
    let data = await notion.databases.query({
        database_id: process.env.DATABASE_ID,
        filter: filter
    })
    results = [...data.results]
    while (data.has_more) {
        data = await notion.databases.query({
            database_id: process.env.DATABASE_ID,
            filter: filter,
            start_cursor: data.next_cursor
        })
        results = [...results, ...data.results]
    }
    const movies = results.map(movie => ({
        id: movie.id,
        title: movie.properties.Nom.title[0].plain_text,
        number: movie.properties.Review.number,
        comment: movie.properties.Commentaire.rich_text[0] ? movie.properties.Commentaire.rich_text[0].plain_text : false
    }))
    // Example using all methods.
    // Client ID endvcc9zajmbbxcak87da2bbsl9qol
    // Client Secret v19tmtosi7akrlsf5ckv6oes8qwy73
    const response = await igdb('endvcc9zajmbbxcak87da2bbsl9qol', 'nth0uk2vmla0ju4v4v890k38x0hl47')
    .search('Grand Theft Auto: Chinatown Wars')
    //.where('id=(1,2,3)')
    .fields('name, screenshots.*, slug, cover.image_id, artworks.*') // same as above
    //.fields('name')
    .limit(1) // limit to 50 results
    .request('/games'); // execute the query and return a response object

    const games = response.data
    return {
        props: {
            movies,
            results,
            games
        }
    }
}
