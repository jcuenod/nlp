import ReferenceParser from 'referenceparser'
const rp = new ReferenceParser()

const nlpUrl = queryString => `https://api.wit.ai/message?q=${queryString}`
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
	"root": "tricons",
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

const getTermsAndConstraintsFromSearchIntent = results => {
	const constraints = []
	if (results.entities.hasOwnProperty("syntax_range")) {
		constraints.push({ key: "Syntax Range", value: results.entities.syntax_range[0].value })
	}
	if (results.entities.hasOwnProperty("or")) {
		if (results.entities.or.length > 1) {
			constraints.push({ key: "Corpora", value: results.entities.or.map(v => bookOrCorpusFromText(v.value)) })
		}
		else {
			constraints.push({ key: "Corpus", value: bookOrCorpusFromText(results.entities.or[0].value) })
		}
	}
	if (results.entities.hasOwnProperty("from") && results.entities.hasOwnProperty("to")) {
		const fbook = rp.parse(results.entities.from[0].value).book
		const tbook = rp.parse(results.entities.to[0].value).book
		constraints.push({
			key: "Corpus Range",
			value: { "from": fbook, "to": tbook }
		})
	}

	const terms = []
	if (results.entities.hasOwnProperty("search_term")) {
		results.entities.search_term.forEach(t => {
			const term = []
			Object.keys(t.entities).forEach(e => {
				if (e === "composite_pgn") {
					return
				}
				if (e === "root") {
					term.push({ key: "tricons", value: transformFinals(t.entities["root"][0].value) })
				}
				else {
					term.push({ key: convert(e), value: convert(t.entities[e][0].value) })
				}
			})
			if (Object.keys(t.entities).includes("composite_pgn")) {
				const composite_pgn = t.entities["composite_pgn"][0].value
				term.push({ key: "ps", value: `p${composite_pgn.substring(0, 1)}` })
				if (composite_pgn.substring(1, 2) !== "c") {
					term.push({ key: "gn", value: composite_pgn.substring(1, 2) })
				}
				term.push({ key: "nu", value: composite_pgn.substring(2, 3) === "s" ? "sg" : "pl" })
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
			'Authorization': 'Bearer EKHGH2LBZ744Y4QD2FIQ7VUJH45I5NUC',
			'Content-Type': 'application/json'
		})
	}).then(r => r.json()).then(results => {
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