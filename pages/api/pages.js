import getPages from "/functions/getPages"

export default async function apiIndex(req, res) {
    const { pages } = await getPages()
    res.json(pages)
}