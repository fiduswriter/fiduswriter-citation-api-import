import {getJson} from "../common"

import {searchApiResultDataciteTemplate} from "./templates"

export class DataciteSearcher {

    constructor(importer) {
        this.importer = importer
    }

    bind() {
        document.querySelectorAll('#bibimport-search-result-datacite .api-import').forEach(resultEl => {
            let doi = resultEl.dataset.doi
            resultEl.addEventListener('click', () => this.getBibtex(doi))
        })
    }

    lookup(searchTerm) {

        return getJson(
            'https://api.datacite.org/works',
            {query: searchTerm}
        ).then(json => {
            let items = json['data'].map(hit => hit.attributes)
            let searchEl = document.getElementById('bibimport-search-result-datacite')
            if (!searchEl) {
                // window was closed before result was ready.
                return
            }
            if (items.length) {
                searchEl.innerHTML = searchApiResultDataciteTemplate({items})
            } else {
                searchEl.innerHTML = ''
            }
            this.bind()
        })
    }

    getBibtex(doi) {
        fetch(`https://data.datacite.org/application/x-bibtex/${encodeURIComponent(doi)}`, {
            method: "GET"
        }).then(
            response => response.text()
        ).then(
            bibtex => this.importer.importBibtex(bibtex)
        )
    }

}
