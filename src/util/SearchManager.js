const nlpUrl = queryString => `https://api.wit.ai/message?q=${queryString}`
const parabibleUrl = `https://parabible.com/api/term-search`

const knownCorpora = {
	"pentateuch": ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy"],
	"former prophets": ["Joshua", "Judges", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings"],
	"historical books": ["Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther"],
	"wisdom": ["Job", "Proverbs", "Ecclesiastes"],
	"prophets": ["Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habbakuk", "Zephaniah", "Haggai", "Zechariah", "Malachi"],
	"major prophets": ["Isaiah", "Jeremiah", "Ezekiel"],
	"minor prophets": ["Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habbakuk", "Zephaniah", "Haggai", "Zechariah", "Malachi"],
	"Old Testament": []
}
const conversions = {
	"part_of_speech": "sp",
	"root": "tricons",
	"stem": "vs",
	"tense": "vt",
	"nu": "nu",
	"gender": "gn",
	"person": "ps",
	"masc": "m",
	"fem": "f",
	"3": "p3",
	"2": "p2",
	"1": "p1",
}
const convert = v => v in conversions ? conversions[v] : v

const parseQuery = searchText => new Promise((resolve, reject) => {
	const url = nlpUrl(searchText)
	console.log(searchText, url)
	fetch(url, {
		headers: new Headers({
			'Authorization': 'Bearer EKHGH2LBZ744Y4QD2FIQ7VUJH45I5NUC',
			'Content-Type': 'application/json'
		})
	}).then(r => r.json()).then(results => {
		if (results.entities.intent[0].value === "search") {
			resolve(results)
		}
	})
})

const getResults = ({ terms, constraints }) => new Promise((resolve, reject) => {
	const searchQuery = {}

	const constraintsKeys = constraints.map(c => c.key)
	if (constraintsKeys.includes("Corpus")) {
		let corpusConstraint = constraints[constraintsKeys.indexOf("Corpus")].value
		//TODO: must handle multiple corpora constraints
		if (corpusConstraint in knownCorpora) {
			searchQuery["search_filter"] = knownCorpora[corpusConstraint]
		}
		else {
			searchQuery["search_filter"] = [corpusConstraint]
		}
	}
	if (constraintsKeys.includes("Corpora")) {
		searchQuery["search_filter"] = []
		constraints[constraintsKeys.indexOf("Corpora")].value.forEach(c => {
			if (c in knownCorpora) {
				searchQuery["search_filter"].push(...knownCorpora[c])
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
	searchQuery["texts"] = ["net", "wlc"]

	searchQuery["query"] = []
	terms.forEach((t, i) => {
		searchQuery["query"].push({
			uid: i,
			inverted: false,
			data: t.reduce((a, v) => {
				a[convert(v.key)] = convert(v.value)
				return a
			}, {})
		})
	})
	console.log(searchQuery)

	fetch(parabibleUrl, {
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
export default { parseQuery, getResults }