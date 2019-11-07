import React from 'react'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableRow'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'

import * as abbreviations from '../data/abbreviations'
const finals = {
	"כ": "ך",
	"מ": "ם",
	"נ": "ן",
	"צ": "ץ",
	"פ": "ף"
}
const transformFinals = text =>
	Object.keys(finals).includes(text.slice(-1)) ? text.slice(0, -1) + finals[text.slice(-1)] : text

const keyToDisplay = [
	"voc_utf8",
	"gloss",
	"sdbh",
	"sp",
	"vs",
	"vt",
	"ps",
	"gn",
	"nu",
	"prs_gn",
	"prs_nu",
	"prs_ps",
	"st",
	"accent",
	"accent_quality",
	"is_definite",
	"lxxlexeme",
	"g_cons_utf8"
]

const toTitleCase = str =>
	str.split(' ')
		.map(w => w[0].toUpperCase() + w.substr(1).toLowerCase())
		.join(' ')

const toString = value => {
	if (typeof value === "string") {
		return toTitleCase(value)
	}
	else if (Array.isArray(value)) {
		return toTitleCase(value.join(", "))
	}
	else if (typeof value === "object") {
		if ("from" in value && "to" in value) {
			return toTitleCase(value.from) + " to " + toTitleCase(value.to)
		}
	}
	console.error(value)
	throw "Don't know how to handle value that we just printed..."
}
const hebrewKeys = ["g_cons_utf8", "g_word_utf8", "voc_utf8", "tricons", "g_prs_utf8", "g_uvf_utf8"]
const abbr = v => {
	const { key, value } = v

	if (hebrewKeys.includes(key)) {
		return {
			key: abbreviations.termToEnglish.categories[key],
			value: <span style={{ fontFamily: "SBL Biblit", fontSize: "large" }}>{transformFinals(value)}</span>
		}
	}

	if (key in abbreviations.termToEnglish.categories) {
		return {
			key: abbreviations.termToEnglish.categories[key],
			value: key in abbreviations.termToEnglish && value in abbreviations.termToEnglish[key] ? abbreviations.termToEnglish[key][value] : value
		}
	}
	else {
		return { key, value }
	}
}

const abbrKeys = Object.keys(abbreviations.termToEnglish.categories)
const WordDetailsDialog = ({ open, onClose, wordDetails }) =>
	<Dialog
		open={open}
		onClose={onClose}
		scroll={'paper'}
		aria-labelledby="scroll-dialog-title"
		aria-describedby="scroll-dialog-description"
	>
		<DialogTitle id="scroll-dialog-title">Word Details</DialogTitle>
		<DialogContent dividers={true}>
			<DialogContentText
				id="scroll-dialog-description"
			>
				<Table size="small">
					<TableBody>
						{keyToDisplay.filter(k => k in wordDetails).map(k => {
							const { key, value } = abbr({ key: k, value: wordDetails[k] })
							return < TableRow >
								<TableCell style={{ fontSize: "small", border: "none" }}>{key}</TableCell>
								<TableCell style={{ fontWeight: "bold", border: "none" }}>{value}</TableCell>
							</TableRow>
						})}
					</TableBody>
				</Table>
			</DialogContentText>
		</DialogContent>
		<DialogActions>
			<Button onClick={onClose} color="primary">
				Close
			</Button>
		</DialogActions>
	</Dialog >
export default WordDetailsDialog