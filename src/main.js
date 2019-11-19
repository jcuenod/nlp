import ReactDOM from 'react-dom'
import React from 'react'

import IconButton from '@material-ui/core/IconButton';
import LinearProgress from '@material-ui/core/LinearProgress'
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import ClearIcon from '@material-ui/icons/Clear';

import SearchAppBar from './components/SearchAppBar'
import SearchDetailCard from './components/SearchDetailCard'
import SearchResults from './components/SearchResults'
import ChapterText from './components/ChapterText'
import InfoSnackbar from './components/InfoSnackbar'
import WordDetailsSnackbar from './components/WordDetailsSnackbar'
import WordDetailsDialog from './components/WordDetailsDialog'

import SearchManager from './util/SearchManager'

if (!localStorage.getItem("search_history")) {
	localStorage.setItem("search_history", JSON.stringify([
		"find זכר in the hiphil in the pentateuch",
		"find the prep ב with כל in the same phrase",
		"find עשׂה as a participle with שׁמים and ארץ in the same clause",
		"find ירא as a plural in isa, jer, ezek and wisdom",
		// "find 3ms verbs in the piel stem with the root זכר and fem nouns in the same clause from gen 2 to isaiah 17 or jer"
	]))
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
			displayTexts: ["wlc", "net"],
			focusedContent: false,
			searchInput: "",
			searchTerms: [],
			searchConstraints: [],
			searchResults: [],
			searchResultCount: -1,
			chapterLocation: "",
			chapterText: [],
			showWordDetailsSnackbar: false,
			showWordDetailsDialog: false,
			wordDetails: {},
			showInfoSnackbar: false,
			infoSnackbarMessage: "",
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
	parseQuery(e) {
		if ("preventDefault" in e) {
			e.preventDefault()
		}
		this.setState({ busyParsingQuery: true })
		SearchManager.parseQuery(this.state.searchInput).then(results => {

			const switch_value = results.entities.intent[0].value
			if (switch_value === "search") {
				const { terms, constraints } = SearchManager.getTermsAndConstraintsFromSearchIntent(results)
				this.setState({
					searchTerms: terms,
					searchConstraints: constraints,
					busyParsingQuery: false,
					busyQueryingParabible: true
				})
				this.addToHistory(this.state.searchInput)
				SearchManager.getResults({ terms, constraints, texts: this.state.displayTexts }).then(response => {
					console.log("results:", response.truncated ? response.truncated : response.results.length)
					this.setState({
						searchResultCount: response.truncated ? response.truncated : response.results.length,
						searchResults: response.results,
						busyQueryingParabible: false,
						focusedContent: "search"
					})
				})
			}
			else if (switch_value === "add_text") {
				const texts = new Set(this.state.displayTexts)
				let text_to_add = results.entities.display_text[0].value
				if (text_to_add === "bhs") text_to_add = "wlc"
				texts.add(text_to_add)
				this.setState({
					displayTexts: Array.from(texts),
					busyParsingQuery: false,
					showInfoSnackbar: true,
					infoSnackbarMessage: "Showing " + text_to_add
				})
			}
			else if (switch_value === "remove_text") {
				const texts = new Set(this.state.displayTexts)
				let text_to_hide = results.entities.display_text[0].value
				if (text_to_hide === "bhs") text_to_hide = "wlc"
				texts.delete(text_to_hide)
				this.setState({
					displayTexts: Array.from(texts),
					busyParsingQuery: false,
					showInfoSnackbar: true,
					infoSnackbarMessage: "Hiding " + text_to_hide
				})
			}
			else if (switch_value === "navigate") {
				let unparsedReference = ""
				try {
					unparsedReference = results.entities.reference[0].value
				}
				catch (e) {
					console.error(results)
					console.error("Failed to get reference from navigate intent (cf. results above)")
					return
				}
				SearchManager.getChapter(unparsedReference, this.state.displayTexts).then(results => {
					this.setState({
						chapterLocation: results.reference.book + " " + results.reference.chapter,
						chapterText: results.text,
						focusedContent: "chapter",
						busyParsingQuery: false
					})
				})
			}

		})
	}
	lookupWord(e) {
		SearchManager.getWordInfo(+e._targetInst.key).then(response => {
			console.log(response)
			this.setState({
				wordDetails: response,
				showWordDetailsSnackbar: true
			})
		})
	}
	handleCloseWordDetailsSnackbar() {
		this.setState({ showWordDetailsSnackbar: false })
	}
	handleMoreDetails() {
		this.setState({
			showWordDetailsSnackbar: false,
			showWordDetailsDialog: true
		})
	}
	handleCloseWordDetailsDialog() {
		this.setState({ showWordDetailsDialog: false })
	}
	handleInfoSnackbar() {
		this.setState({ showInfoSnackbar: false })
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

		let contentDisplay = null
		if (this.state.busyQueryingParabible) {
			contentDisplay = <LinearProgress style={{ width: "50%", marginTop: "1em" }} />
		}
		else if (this.state.focusedContent === "chapter") {
			contentDisplay = <ChapterText
				lookupWord={this.lookupWord.bind(this)}
				location={this.state.chapterLocation}
				text={this.state.chapterText}
				displayTexts={this.state.displayTexts} />
		}
		else if (this.state.focusedContent === "search" && this.state.searchResultCount > -1) {
			contentDisplay = <SearchResults
				lookupWord={this.lookupWord.bind(this)}
				results={this.state.searchResults}
				count={this.state.searchResultCount}
				displayTexts={this.state.displayTexts} />
		}
		const wordDetails = this.state.wordDetails.results ? this.state.wordDetails.results : {}
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
						history={uniqueRecentHistory}
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
						{contentDisplay}
					</div>
				</div>
				<div style={{ position: "absolute", top: "1em", right: "1em" }}>
					<IconButton onClick={this.handleClear.bind(this)} aria-label="clear">
						<ClearIcon />
					</IconButton>
				</div>
				<InfoSnackbar
					open={this.state.showInfoSnackbar}
					onClose={this.handleInfoSnackbar.bind(this)}
					message={this.state.infoSnackbarMessage} />
				<WordDetailsSnackbar
					open={this.state.showWordDetailsSnackbar}
					onClose={this.handleCloseWordDetailsSnackbar.bind(this)}
					onMore={this.handleMoreDetails.bind(this)}
					wordDetails={wordDetails} />
				<WordDetailsDialog
					open={this.state.showWordDetailsDialog}
					onClose={this.handleCloseWordDetailsDialog.bind(this)}
					wordDetails={wordDetails} />
			</ThemeProvider>
		)
	}
}

ReactDOM.render(<App />, document.querySelector("#app"))
