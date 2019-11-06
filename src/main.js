import ReactDOM from 'react-dom'
import React from 'react'

import IconButton from '@material-ui/core/IconButton';
import LinearProgress from '@material-ui/core/LinearProgress'
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import ClearIcon from '@material-ui/icons/Clear';
import ReferenceParser from 'referenceparser'
const rp = new ReferenceParser()

import SearchAppBar from './components/SearchAppBar'
import SearchDetailCard from './components/SearchDetailCard'
import SearchResults from './components/SearchResults'

import SearchManager from './util/SearchManager'

if (!localStorage.getItem("search_history")) {
	localStorage.setItem("search_history", JSON.stringify([
		"find זכר in obadiah",
		"find the prep ב with כל in the same phrase",
		"find 3ms verbs in the piel stem with the root זכר and fem nouns in the same clause from gen 2 to isaiah 17 or jer"
	]))
}


const getTermsAndConstraintsFromSearchIntent = results => {
	const constraints = []
	if (results.entities.hasOwnProperty("syntax_range")) {
		constraints.push({ key: "Syntax Range", value: results.entities.syntax_range[0].value })
	}
	if (results.entities.hasOwnProperty("or")) {
		if (results.entities.or.length > 1) {
			constraints.push({ key: "Corpora", value: results.entities.or.map(v => rp.parse(v.value).book) })
		}
		else {
			constraints.push({ key: "Corpus", value: rp.parse(results.entities.or[0].value).book })
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
				term.push({ key: e, value: t.entities[e][0].value })
			})
			if (Object.keys(t.entities).includes("composite_pgn")) {
				const composite_pgn = t.entities["composite_pgn"][0].value
				term.push({ key: "person", value: composite_pgn.substring(0, 1) })
				term.push({ key: "gender", value: composite_pgn.substring(1, 2) === "m" ? "masc" : "fem" })
				term.push({ key: "number", value: composite_pgn.substring(2, 3) === "s" ? "sg" : "pl" })
			}
			terms.push(term)
		})
	}
	return { constraints, terms }
}

const theme = createMuiTheme({
	palette: {
		type: 'light',
	},
})
class App extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			busyParsingQuery: false,
			busyQueryingParabible: false,
			searchInput: "",
			searchTerms: [],
			searchConstraints: [],
			searchResults: [],
			searchResultCount: -1,
			history: JSON.parse(localStorage.getItem("search_history"))
		}
	}
	addToHistory(query) {
		const history = this.state.history.slice(0)
		history.push(query)
		localStorage.setItem("search_history", JSON.stringify(history))
		this.setState({ history })
	}
	setSearchInput(newValue) {
		this.setState({ searchInput: newValue })
		// this.runSearch()
	}
	updateSearchInput(e) {
		this.setState({ searchInput: e.target.value })
	}
	injectCharactersToSearchInput(char) {
		this.setState({ searchInput: this.state.searchInput + char })
	}
	parseQuery() {
		this.setState({ busyParsingQuery: true })
		SearchManager.parseQuery(this.state.searchInput).then(results => {
			const switch_value = results.entities.intent[0].value
			if (switch_value === "search") {
				const { terms, constraints } = getTermsAndConstraintsFromSearchIntent(results)
				this.setState({
					searchTerms: terms,
					searchConstraints: constraints,
					busyParsingQuery: false,
					busyQueryingParabible: true
				})
				this.addToHistory(this.state.searchInput)
				SearchManager.getResults({ terms, constraints }).then(response => {
					console.log("results:", response.results.truncated ? response.results.truncated : response.results.length)
					this.setState({
						searchResultCount: response.results.truncated ? response.results.truncated : response.results.length,
						searchResults: response.results,
						busyQueryingParabible: false
					})
				})
			}
			else if (switch_value === "add_text") {
				const texts = this.state.displayTexts.slice(0)
				texts.push(results.entities.display_text[0].value)
				this.setState({ displayTexts: texts })
			}
			else if (switch_value === "remove_text") {
				const texts = this.state.displayTexts.slice(0)
				const doomedIndex = texts.findIndex(results.entities.display_text[0].value)
				texts.splice(doomedIndex, 1)
				this.setState({ displayTexts: texts })
			}
			else if (switch_value === "navigate") {
				const texts = this.state.displayTexts.slice(0)
				const doomedIndex = texts.findIndex(results.entities.display_text[0].value)
				texts.splice(doomedIndex, 1)
				this.setState({ displayTexts: texts })
			}
		})
	}
	handleClear() {
		this.setState({
			searchInput: "",
			searchTerms: [],
			searchResults: [],
			searchResultCount: -1,
			searchConstraints: []
		})
	}
	render() {
		const recentHistory = this.state.history.reverse()
		const uniqueRecentHistory = recentHistory.filter((item, pos) => recentHistory.indexOf(item) === pos)
		const uniqueRecentHistorySlice = uniqueRecentHistory.slice(0, 10)

		let queryParsingInformation = null
		if (this.state.busyParsingQuery) {
			queryParsingInformation = <LinearProgress style={{ width: "50%", marginTop: "1em" }} />
		}
		else if (this.state.searchTerms.length > 0) {
			queryParsingInformation = this.state.searchTerms.map((s, i) => <SearchDetailCard key={i} heading={"Search Term"} values={s} />)
			if (this.state.searchConstraints.length > 0) {
				queryParsingInformation.push(<SearchDetailCard heading={"Constraints"} values={this.state.searchConstraints} />)
			}
		}

		let resultsDisplay = null
		if (this.state.busyQueryingParabible) {
			resultsDisplay = <LinearProgress style={{ width: "50%", marginTop: "1em" }} />
		}
		else if (this.state.searchResultCount > -1) {
			resultsDisplay = <SearchResults results={this.state.searchResults} count={this.state.searchResultCount} />
		}
		return (
			<ThemeProvider theme={theme}>
				<div style={{
					textAlign: "center",
					position: "absolute",
					left: 0,
					right: 0,
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					marginTop: "1em"
				}}>
					<SearchAppBar
						value={this.state.searchInput}
						history={uniqueRecentHistorySlice}
						onChange={this.updateSearchInput.bind(this)}
						injectChars={this.injectCharactersToSearchInput.bind(this)}
						setSearchInput={this.setSearchInput.bind(this)}
						parseQuery={this.parseQuery.bind(this)}
					/>
					<div style={{
						display: "flex",
						justifyContent: "center",
						padding: "1em"
					}}>
						{queryParsingInformation}
					</div>
					<div style={{
						display: "flex",
						justifyContent: "center",
						padding: "2em"
					}}>
						{resultsDisplay}
					</div>
				</div>
				<div style={{ position: "absolute", top: "1em", right: "1em" }}>
					<IconButton onClick={this.handleClear.bind(this)} aria-label="clear">
						<ClearIcon />
					</IconButton>
				</div>
			</ThemeProvider>
		)
	}
}

ReactDOM.render(<App />, document.querySelector("#app"))