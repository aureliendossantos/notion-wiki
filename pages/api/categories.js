import getCategories from "/functions/getCategories"

export default async function apiIndex(req, res) {
    res.json(await getCategories())
}