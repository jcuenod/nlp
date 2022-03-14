import ReferenceParser from 'referenceparser'
const rp = new ReferenceParser()

const nlpUrl = queryString => `https://pb-cognitivei-services.cognitiveservices.azure.com/luis/prediction/v3.0/apps/622a740f-abea-4b08-9906-367d0f8462c0/slots/staging/predict?show-all-intents=true&log=true&subscription-key=4ecdbe4f38594032b87f8a0e59b7b578&query=${queryString}`
const parabibleUrl = endpoint => `https://parabible.com/api/${endpoint}`


const finals = {
	"ך": "כ",
	"ם": "מ",
	"ן": "נ",
	"ץ": "צ",
	"ף": "פ"
}
const transformFinals = text =>
	Object.keys(finals).includes(text.slice(-1)) ? text.slice(0, -1) + finals[text.slice(-1)] : text

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
	"part_of_speech": "sp",
	"lexeme": "tricons",
	"stem": "vs",
	"tense": "vt",
	"number": "nu",
	"gender": "gn",
	"masc": "m",
	"fem": "f",
	"person": "ps",
	"3": "p3",
	"2": "p2",
	"1": "p1",
	"state": "st",
	"construct": "c",
	"absolute": "a",
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

	// if ("corpora" in entities) {
	// 	entities.syntaxRange[0][0]
	// 	constraints.push({ key: "Corpora", value: entities.syntaxRange[0][0] })
	// }

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
				if (e === "composite_png") {
					return
				}
				if (e === "lexeme") {
					term.push({ key: "tricons", value: transformFinals(t["lexeme"][0]) })
				}
				else {
					term.push({ key: convert(e), value: convert(t[e][0][0]) })
				}
			})
			if (Object.keys(t).includes("composite_png")) {
				const composite_png = t["composite_png"][0][0]
				term.push({ key: "ps", value: `p${composite_png.substring(0, 1)}` })
				if (composite_png.substring(1, 2) !== "c") {
					term.push({ key: "gn", value: composite_png.substring(1, 2) })
				}
				term.push({ key: "nu", value: composite_png.substring(2, 3) === "s" ? "sg" : "pl" })
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

const getResults = ({ terms, constraints, texts }) => new Promise((resolve, reject) => {
	const searchQuery = {}

	const constraintsKeys = constraints.map(c => c.key)
	if (constraintsKeys.includes("Corpus")) {
		let corpusConstraint = constraints[constraintsKeys.indexOf("Corpus")].value
		//TODO: must handle multiple corpora constraints
		if (corpusConstraint.toLowerCase() in knownCorpora) {
			searchQuery["search_filter"] = knownCorpora[corpusConstraint.toLowerCase()]
		}
		else {
			searchQuery["search_filter"] = [corpusConstraint]
		}
	}
	if (constraintsKeys.includes("Corpora")) {
		searchQuery["search_filter"] = []
		constraints[constraintsKeys.indexOf("Corpora")].value.forEach(c => {
			if (c.toLowerCase() in knownCorpora) {
				searchQuery["search_filter"].push(...knownCorpora[c.toLowerCase()])
			}
			else {
				searchQuery["search_filter"].push(c)
			}
		})
	}
	//TODO: handle these types of corpus constraints:
	// 	// must handle multiple corpus constraints
	//  // must handle corpus range constraints (and multiple of them...)

	if (constraintsKeys.includes("Syntax Range")) {
		searchQuery["search_range"] = constraints[constraintsKeys.indexOf("Syntax Range")].value.toLowerCase()
	}
	searchQuery["texts"] = texts

	searchQuery["query"] = []
	terms.forEach((t, i) => {
		searchQuery["query"].push({
			uid: i,
			inverted: false,
			data: t.reduce((a, v) => {
				a[v.key] = v.value
				return a
			}, {})
		})
	})
	console.log(searchQuery)

	fetch(parabibleUrl("term-search"), {
		method: "POST",
		headers: new Headers({
			'Content-Type': 'application/json; charset=utf-8'
		}),
		body: JSON.stringify(searchQuery)
	}).then(r => r.json()).then(response => {
		console.log(response)
		resolve(response)
	})
})



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

export default { parseQuery, getResults, getWordInfo, getTermsAndConstraintsFromSearchIntent, getChapter }
