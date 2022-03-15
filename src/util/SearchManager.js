import ReferenceParser from 'referenceparser'
const rp = new ReferenceParser()

const nlpUrl = queryString => `https://pb-cognitivei-services.cognitiveservices.azure.com/luis/prediction/v3.0/apps/622a740f-abea-4b08-9906-367d0f8462c0/slots/staging/predict?show-all-intents=true&log=true&subscription-key=4ecdbe4f38594032b87f8a0e59b7b578&query=${queryString}`
const parabibleUrl = endpoint => `https://parabible.com/api/${endpoint}`

const b64encode = str => {
	// first we use encodeURIComponent to get percent-encoded UTF-8,
	// then we convert the percent encodings into raw bytes which
	// can be fed into btoa. Then we reencode for use as in a url.
	return encodeURIComponent(btoa(
		encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) =>
			String.fromCharCode(`0x${p1}`)
		)
	))
}

const getTermSearchResultCount = ({
	terms,
	treeNodeType = "clause",
	corpusFilter: possibleCorpusFilter
}) => new Promise(async (resolve, reject) => {
	const searchTerms = []
	terms.forEach((t, i) => {
		searchTerms.push({
			uid: i,
			inverted: false,
			data: t.reduce((a, v) => {
				a[v.key] = v.value
				return a
			}, {})
		})
	})
	const corpusFilter = possibleCorpusFilter ? { corpusFilter: possibleCorpusFilter } : {}
	const jsonQuery = JSON.stringify({
		searchTerms,
		treeNodeType,
		"moduleIds": [7, 4],
		...corpusFilter
	})
	console.log(jsonQuery)
	const query = `/termSearchCount?q=${b64encode(jsonQuery)}`
	console.log(query)
	// const urlEncoded = encodeURIComponent(b64EncodeUnicode(JSON.stringify(query)))
	const response = await fetch(
		"http://dev.parabible.com/api/v2" + query
	)
	const results = await response.json()
	console.log("COUNT", results)
	resolve(results.data)
})

const getTermSearchResults = ({
	pageNumber = 0,
	pageSize = 100,
	terms,
	treeNodeType = "clause",
	corpusFilter: possibleCorpusFilter
}) => new Promise(async (resolve, reject) => {
	// if (!atLeastOneTermNotInverted()) {
	// 	reject("No positive search terms")
	// }
	const searchTerms = []
	terms.forEach((t, i) => {
		searchTerms.push({
			uid: i,
			inverted: false,
			data: t.reduce((a, v) => {
				a[v.key] = v.value.normalize("NFC")
				return a
			}, {})
		})
	})

	// We don't want to send the corpus filter if its empty
	const corpusFilter = possibleCorpusFilter ? { corpusFilter: possibleCorpusFilter } : {}
	const jsonQuery = JSON.stringify({
		pageNumber,
		pageSize,
		searchTerms,
		treeNodeType,
		"moduleIds": [7, 4],
		"orderingVersificationSchemaId": 4,
		...corpusFilter
	})
	console.log(jsonQuery)
	const query = `/termSearch?q=${b64encode(jsonQuery)}`
	console.log(query)
	// const urlEncoded = encodeURIComponent(b64EncodeUnicode(JSON.stringify(query)))
	const response = await fetch(
		"http://dev.parabible.com/api/v2" + query
	)
	const results = await response.json()
	console.log("RESULTS", results)
	resolve(results.data)
})

const finals = {
	"ך": "כ",
	"ם": "מ",
	"ן": "נ",
	"ץ": "צ",
	"ף": "פ"
}
const transformFinals = text => text
// Object.keys(finals).includes(text.slice(-1)) ? text.slice(0, -1) + finals[text.slice(-1)] : text

const knownCorpora = {
	"pentateuch": ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy"],
	"former prophets": ["Joshua", "Judges", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings"],
	"historical books": ["Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther"],
	"wisdom": ["Job", "Proverbs", "Ecclesiastes"],
	"prophets": ["Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habbakuk", "Zephaniah", "Haggai", "Zechariah", "Malachi"],
	"major prophets": ["Isaiah", "Jeremiah", "Ezekiel"],
	"minor prophets": ["Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habbakuk", "Zephaniah", "Haggai", "Zechariah", "Malachi"],
	"old testament": []
}
const conversions = {
	"lexeme": "consonantal_root",
	"m": "masc",
	"f": "fem",
}
const convert = v => v in conversions ? conversions[v] : v

const corporaKeys = Object.keys(knownCorpora)
const bookOrCorpusFromText = t =>
	corporaKeys.includes(t.toLowerCase()) ? t.toLowerCase() : rp.parse(t).book

const getTermsAndConstraintsFromSearchIntent = entities => {
	const constraints = []
	if ("syntaxRange" in entities) {
		constraints.push({ key: "Syntax Range", value: entities.syntaxRange[0][0] })
	}

	if ("corpora" in entities) {
		constraints.push({ key: "Corpora", value: entities.corpora[0].replace(/ and /g, ", ").replace(/ or /g, ", ").replace(/, ,/g, ",") })
	}

	// if (entities.hasOwnProperty("or")) {
	// 	if (entities.or.length > 1) {
	// 		constraints.push({ key: "Corpora", value: entities.or.map(v => bookOrCorpusFromText(v.value)) })
	// 	}
	// 	else {
	// 		constraints.push({ key: "Corpus", value: bookOrCorpusFromText(entities.or[0].value) })
	// 	}
	// }
	// if (entities.hasOwnProperty("from") && entities.hasOwnProperty("to")) {
	// 	const fbook = rp.parse(entities.from[0].value).book
	// 	const tbook = rp.parse(entities.to[0].value).book
	// 	constraints.push({
	// 		key: "Corpus Range",
	// 		value: { "from": fbook, "to": tbook }
	// 	})
	// }

	const terms = []
	if ("searchTerm" in entities) {
		entities.searchTerm.forEach(t => {
			const term = []
			Object.keys(t).forEach(e => {
				console.log(e === "png_composite")
				if (e === "png_composite") {
					// don't include this in the term, we need to parse it out
					return
				}
				else if (e === "lexeme") {
					term.push({ key: "consonantal_root", value: transformFinals(t["lexeme"][0]) })
				}
				else {
					term.push({ key: convert(e), value: convert(t[e][0][0]) })
				}
			})
			if (Object.keys(t).includes("png_composite")) {
				const png_composite = t["png_composite"][0][0]
				term.push({ key: "person", value: png_composite.substring(0, 1) })
				if (png_composite.substring(1, 2) !== "c") {
					term.push({ key: "gender", value: convert(png_composite.substring(1, 2)) })
				}
				term.push({ key: "number", value: png_composite.substring(2, 3) === "s" ? "sg" : "pl" })
			}
			terms.push(term)
		})
	}
	console.log("TERMS:", terms)
	return { constraints, terms }
}



const parseQuery = searchText => new Promise((resolve, reject) => {
	const url = nlpUrl(searchText)
	console.log(searchText, url)
	fetch(url, {
		headers: new Headers({
			// 'Authorization': 'Bearer EKHGH2LBZ744Y4QD2FIQ7VUJH45I5NUC',
			'Content-Type': 'application/json'
		})
	}).then(r => r.json()).then(results => {
		console.log(results)
		resolve(results)
	})
})

// const getResults = ({ terms, constraints, texts }) => new Promise((resolve, reject) => {
// 	const searchQuery = {}

// 	const constraintsKeys = constraints.map(c => c.key)
// 	if (constraintsKeys.includes("Corpus")) {
// 		let corpusConstraint = constraints[constraintsKeys.indexOf("Corpus")].value
// 		//TODO: must handle multiple corpora constraints
// 		if (corpusConstraint.toLowerCase() in knownCorpora) {
// 			searchQuery["search_filter"] = knownCorpora[corpusConstraint.toLowerCase()]
// 		}
// 		else {
// 			searchQuery["search_filter"] = [corpusConstraint]
// 		}
// 	}
// 	if (constraintsKeys.includes("Corpora")) {
// 		searchQuery["search_filter"] = []
// 		constraints[constraintsKeys.indexOf("Corpora")].value.forEach(c => {
// 			if (c.toLowerCase() in knownCorpora) {
// 				searchQuery["search_filter"].push(...knownCorpora[c.toLowerCase()])
// 			}
// 			else {
// 				searchQuery["search_filter"].push(c)
// 			}
// 		})
// 	}
// 	//TODO: handle these types of corpus constraints:
// 	// 	// must handle multiple corpus constraints
// 	//  // must handle corpus range constraints (and multiple of them...)

// 	if (constraintsKeys.includes("Syntax Range")) {
// 		searchQuery["search_range"] = constraints[constraintsKeys.indexOf("Syntax Range")].value.toLowerCase()
// 	}
// 	searchQuery["texts"] = texts

// 	searchQuery["query"] = []
// 	terms.forEach((t, i) => {
// 		searchQuery["query"].push({
// 			uid: i,
// 			inverted: false,
// 			data: t.reduce((a, v) => {
// 				a[v.key] = v.value
// 				return a
// 			}, {})
// 		})
// 	})
// 	console.log(searchQuery)

// 	fetch(parabibleUrl("term-search"), {
// 		method: "POST",
// 		headers: new Headers({
// 			'Content-Type': 'application/json; charset=utf-8'
// 		}),
// 		body: JSON.stringify(searchQuery)
// 	}).then(r => r.json()).then(response => {
// 		console.log(response)
// 		resolve(response)
// 	})
// })



const getWordInfo = wid => new Promise((resolve, reject) => {
	fetch(parabibleUrl("word-lookup"), {
		method: "POST",
		headers: new Headers({
			'Content-Type': 'application/json; charset=utf-8'
		}),
		body: JSON.stringify({ wid })
	}).then(r => r.json()).then(response => {
		resolve(response)
	})
})



const getChapter = (unparsedReference, texts) => new Promise((resolve, reject) => {
	const reference = rp.parse(unparsedReference)
	fetch(parabibleUrl("chapter-text"), {
		method: "POST",
		headers: new Headers({
			'Content-Type': 'application/json; charset=utf-8'
		}),
		body: JSON.stringify({
			reference,
			texts
		})
	}).then(r => r.json()).then(response => {
		resolve(response)
	})
})

export default { parseQuery, getTermSearchResults, getTermSearchResultCount, getWordInfo, getTermsAndConstraintsFromSearchIntent, getChapter }
