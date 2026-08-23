import {get} from "fwtoolkit"
import {searchApiResultPubmedTemplate} from "./templates"

// Function to replace accented characters with non-accented equivalents
const stripAccents = str => {
    const accents = {
        À: "A",
        Á: "A",
        Â: "A",
        Ã: "A",
        Ä: "A",
        Å: "A",
        Ç: "C",
        È: "E",
        É: "E",
        Ê: "E",
        Ë: "E",
        Ì: "I",
        Í: "I",
        Î: "I",
        Ï: "I",
        Ñ: "N",
        Ò: "O",
        Ó: "O",
        Ô: "O",
        Õ: "O",
        Ö: "O",
        Ù: "U",
        Ú: "U",
        Û: "U",
        Ü: "U",
        à: "a",
        á: "a",
        â: "a",
        ã: "a",
        ä: "a",
        å: "a",
        ç: "c",
        è: "e",
        é: "e",
        ê: "e",
        ë: "e",
        ì: "i",
        í: "i",
        î: "i",
        ï: "i",
        ñ: "n",
        ò: "o",
        ó: "o",
        ô: "o",
        õ: "o",
        ö: "o",
        ß: "ss",
        ù: "u",
        ú: "u",
        û: "u",
        ü: "u",
        ý: "y"
    }
    return str.replace(/[^\x00-\x7F]/g, c => accents[c] || "")
}

export class PubmedSearcher {
    constructor(importer) {
        this.importer = importer
        this.id = "pubmed"
        this.name = "Pubmed (EuroPMC)"
    }

    bind() {
        document
            .querySelectorAll("#bibimport-search-result-pubmed .api-import")
            .forEach(resultEl => {
                const pmid = resultEl.dataset.pmid
                resultEl.addEventListener("click", () => this.getBibtex(pmid))
            })
    }

    lookup(searchTerm) {
        const searchUrl = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(searchTerm)}&format=json&pageSize=5&resultType=core`
        return get(`/api/citation_api_import/proxy/${searchUrl}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }
                return response.json()
            })
            .then(data => {
                const results = data.resultList?.result || []
                if (!results.length) {
                    const searchEl = document.getElementById(
                        "bibimport-search-result-pubmed"
                    )
                    if (searchEl) {
                        searchEl.innerHTML = ""
                    }
                    return
                }

                const items = results
                    .map(result => {
                        const pmid = result.pmid || ""
                        const authors = (result.authorList?.author || [])
                            .map(author => {
                                if (author.fullName) {
                                    return stripAccents(author.fullName)
                                }
                                if (author.lastName && author.initials) {
                                    return stripAccents(
                                        `${author.lastName} ${author.initials}`
                                    )
                                }
                                return ""
                            })
                            .filter(name => name)
                        const authorText = authors.join(", ")
                        const title = result.title
                            ? stripAccents(result.title.replace(/\.$/, ""))
                            : ""
                        // Extract journal title from journalInfo
                        const journalInfo = result.journalInfo?.journal || {}
                        const journalTitle =
                            journalInfo.title ||
                            journalInfo.isoabbreviation ||
                            journalInfo.medlineAbbreviation ||
                            ""
                        const published = result.pubYear || ""
                        return {
                            pmid,
                            authors: authorText,
                            published,
                            title,
                            journalTitle
                        }
                    })
                    .filter(item => item.pmid)

                const searchEl = document.getElementById(
                    "bibimport-search-result-pubmed"
                )
                if (!searchEl) {
                    return
                }
                searchEl.innerHTML = items.length
                    ? searchApiResultPubmedTemplate({items})
                    : ""
                this.bind()
            })
            .catch(error => {
                console.error("PubMed search error:", error)
                const searchEl = document.getElementById(
                    "bibimport-search-result-pubmed"
                )
                if (searchEl) {
                    searchEl.innerHTML = ""
                }
            })
    }

    getBibtex(pmid) {
        this.importer.dialog.close()
        // Use search endpoint with PMID - search by the number directly
        const searchUrl = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${pmid}&format=json&resultType=core&pageSize=1`
        get(`/api/citation_api_import/proxy/${searchUrl}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }
                return response.json()
            })
            .then(data => {
                const result = data.resultList?.result?.[0]
                if (!result || !result.pmid) {
                    throw new Error("No article found")
                }
                const article = result

                const authors = (article.authorList?.author || [])
                    .map(author => {
                        if (author.fullName) {
                            return stripAccents(author.fullName)
                        }
                        if (author.lastName && author.initials) {
                            return `${stripAccents(author.lastName)}, ${stripAccents(author.initials)}`
                        }
                        return null
                    })
                    .filter(author => author)
                const authorStr = authors.join(" and ")
                const title = article.title
                    ? stripAccents(article.title.replace(/\.$/, ""))
                    : ""
                // Extract journal title from journalInfo
                const journalInfo = article.journalInfo?.journal || {}
                const journalTitle =
                    journalInfo.title ||
                    journalInfo.isoabbreviation ||
                    journalInfo.medlineAbbreviation ||
                    ""
                const published = article.pubYear || ""
                const volume = article.volume || ""
                const issue = article.issue || ""
                const pages = article.pageInfo || ""

                let formattedPages = pages
                if (pages.includes("-")) {
                    const [start, end] = pages.split("-")
                    if (end.length < start.length) {
                        const commonPart = start.slice(
                            0,
                            start.length - end.length
                        )
                        formattedPages = `${start}--${commonPart}${end}`
                    } else {
                        formattedPages = `${start}--${end}`
                    }
                }

                let bibtex = `@article{pmid${pmid},\n`
                bibtex += `  author = {${authorStr}},\n`
                bibtex += `  title = {${title}},\n`
                bibtex += `  journal = {${stripAccents(journalTitle)}},\n`
                bibtex += `  year = {${published}}`
                if (volume) {
                    bibtex += `,\n  volume = {${volume}}`
                }
                if (issue) {
                    bibtex += `,\n  number = {${issue}}`
                }
                if (formattedPages) {
                    bibtex += `,\n  pages = {${formattedPages}}`
                }
                bibtex += "\n}"

                return this.importer.importBibtex(bibtex)
            })
            .catch(error => console.error("Error fetching BibTeX:", error))
    }
}
