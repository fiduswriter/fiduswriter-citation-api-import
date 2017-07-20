import {searchApiResultSCMKGTemplate} from "./templates"

export class SCMKGSearcher {

    constructor(importer) {
        this.importer = importer
    }

    bind() {
        let that = this
        jQuery('#bibimport-search-result-scmkg .api-import').on('click', function () {
            let title = jQuery(this).attr('title')
	    let authors = jQuery(this).attr('authors')
            let pages = jQuery(this).attr('pages')
	    let year = jQuery(this).attr('year')
            that.makeBibtex(title, authors, pages, year)
        })
    }


    makeAuthorPapersSparqlQuery(authorName) {

	let sparqlQuery = "SELECT%20?paperTitle%20?year%20?pages%20?authorName%20(group_concat(distinct%20?authorName2;separator=%22;%22)%20as%20?authorNames)%20WHERE%20{%20?paper%20%3Chttp://www.w3.org/1999/02/22-rdf-syntax-ns%23type%3E%20%3Chttp://xmlns.com/foaf/0.1/Document%3E%20.%20?paper%20%3Chttp://purl.org/dc/elements/1.1/creator%3E%20?author%20.%20?author%20%3Chttp://www.w3.org/2000/01/rdf-schema%23label%3E%20?authorName%20.%20?paper%20%3Chttp://purl.org/dc/elements/1.1/title%3E%20?paperTitle%20.%20?paper%20%3Chttp://purl.org/dc/terms/issued%3E%20?year%20.%20?paper%20%3Chttp://swrc.ontoware.org/ontology%23pages%3E%20?pages%20.%20filter(%20regex(?authorName,%20%22"+ authorName +" %22%20,%20%22i%22%20))%20.%20?paper%20%3Chttp://purl.org/dc/elements/1.1/creator%3E%20?author2%20.%20?author2%20%3Chttp://www.w3.org/2000/01/rdf-schema%23label%3E%20?authorName2%20.%20}%20group%20by%20?paperTitle%20?year%20?pages%20?authorName%20limit%2020"

	return sparqlQuery
    }

    lookup(authorName) {
        let sparqlQuery = this.makeAuthorPapersSparqlQuery(authorName)
	let completeQuery = 'http://butterbur10.iai.uni-bonn.de/SCMKG/query?query='+ sparqlQuery 
        return new Promise(resolve => {
                jQuery.ajax({
                    data: {
                        'format': 'json',
                        'q': authorName,
                        'do': 'overall',
                    },
                    dataType: "text",
                    url: completeQuery,
                    success: result => {
                    if (result === '')
        {
            resolve()
            return
        }
        let json = JSON.parse(result)
        let items = json['results']['bindings']
        jQuery("#bibimport-search-result-scmkg").empty()
        if (items.length) {
            jQuery("#bibimport-search-result-scmkg").html('<h3>SCM-KG</h3>')
        }
        jQuery('#bibimport-search-result-scmkg').append(
            searchApiResultSCMKGTemplate({items})
        )
        this.bind()
        resolve()
    }

    })
    })
    }


    makeBibtex(title, authors, pages, year) {
        let bibStr = ''
        bibStr = bibStr.concat(
            `@inproceedings{scmkg,`,
            `title={${title}},`,
            `year={${year}},`,
            `author={${authors}},`,
            `pages={${pages}}`,
            `}`
        )
        this.importer.importBibtex(bibStr)

    }
}
