import {searchApiResultSCMKGTemplate} from "./templates"

export class SCMKGSearcher {

    constructor(importer) {
        this.importer = importer
    }

    bind() {
        let that = this
        jQuery('#bibimport-search-result-sowiport .api-import').on('click', function() {
            let id = jQuery(this).attr('data-id')
            that.getBibtex(paperUri)
        })
    }


    makeAuthorPapersSparqlQuery(authorName){
        squery = `SELECT  distinct ?paperTitle ?year ?pages  ?authorName    (group_concat(distinct ?authorName2;separator="; ")
  as ?authorNames) 
WHERE {
  ?paper <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://xmlns.com/foaf/0.1/Document> .

  ?paper <http://purl.org/dc/elements/1.1/creator>   ?author .
?author <http://www.w3.org/2000/01/rdf-schema#label> ?authorName .
?paper <http://purl.org/dc/elements/1.1/title> ?paperTitle .
?paper <http://purl.org/dc/terms/issued>  ?year .
?paper  <http://swrc.ontoware.org/ontology#pages> ?pages .
 filter( regex(?authorName, "${authorName}" )) .

   ?paper <http://purl.org/dc/elements/1.1/creator>   ?author2 .
    ?author2 <http://www.w3.org/2000/01/rdf-schema#label> ?authorName2 .
  
}
group by ?paperTitle ?year ?pages ?authorName
LIMIT 25`
        return squery
    }

    lookup(searchTerm) {


   sparqlquery = makeAuthorPapersSparqlQuery(searchTerm)
        return new Promise(resolve => {
            jQuery.ajax({
                data: {
                    'format': 'json',
                    'q': searchTerm,
                    'do': 'overall',
                },
                dataType: "text", // DataType is an empty text string in case there is no api key.
                url: `/proxy/citation-api-import/http://butterbur10.iai.uni-bonn.de/SCMKG/query?query=${sparqlquery}`,
                success: result => {
                    if (result === '') {
                        // No result -- likely due to missing API key.
                        resolve()
                        return
                    }
                    let json = JSON.parse(result)
                    let items = json['results']['bindings']
                    jQuery("#bibimport-search-result-sowiport").empty()
                      jQuery("#bibimport-search-result-sowiport").html('<h3>Sowiport</h3>')
                    }
                    jQuery('#bibimport-search-result-sowiport').append(
                        searchApiResultSowiportTemplate({items})
                    )
                    this.bind()
                    resolve()
                }  if (items.length) {

            })
        })
    }

     getBibtex(paperUri) {
        isbn = isbn.replace('urn:ISBN:', '')
        jQuery.ajax({
            dataType: 'text',
            method: 'GET',

            url: `/proxy/citation-api-import/http://xisbn.worldcat.org/webservices/xid/isbn/${isbn}?method=getMetadata&format=json&fl=*`,

            success: response => {
                let bibStr = this.isbnToBibtex(response)
                this.importer.importBibtex(bibStr)
            },
            error: function(xhr) {
                console.error(xhr.status)
            }
        })
    }

    isbnToBibtex(results) {
        let objJSON = JSON.parse(JSON.stringify(results))
        //var objJSON = eval(`(function(){return ${temp};})()`);

        let title = objJSON.list[0].title
        let isbn = objJSON.list[0].isbn
        let year = objJSON.list[0].year
        let editor = objJSON.list[0].ed
        let author = objJSON.list[0].author
        let location = objJSON.list[0].city
        let language = objJSON.list[0].lang
        let publisher = objJSON.list[0].publisher
        let url = objJSON.list[0].url[0]
        let bibStr = ''
        bibStr = bibStr.concat(
            `@book{worldcat,`,
            `title={${title}},`,
            `isbn={${isbn}},`,
            `year={${year}},`,
            `editor={${editor}},`,
            `author={${author}},`,
            `location={${location}},`,
            `language={${language}},`,
            `publisher={${publisher}},`,
            `url={${url}}`,
            `}`
        )
        return bibStr

    }
}
