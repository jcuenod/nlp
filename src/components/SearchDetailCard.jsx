import React from 'react'

import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import Typography from '@material-ui/core/Typography';

import abbreviations from '../data/abbreviations'
const finals = {
	"כ": "ך",
	"מ": "ם",
	"נ": "ן",
	"צ": "ץ",
	"פ": "ף"
}
const transformFinals = text =>
	Object.keys(finals).includes(text.slice(-1)) ? text.slice(0, -1) + finals[text.slice(-1)] : text


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
const abbr = v => {
	const { key, value } = v

	if (key === "tricons") {
		return {
			key: "Root",
			value: transformFinals(value)
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

const SearchDetailCard = ({ heading, values }) =>
	<Card style={{ display: "inline-block", margin: "0.5em" }}>
		<CardContent>
			<Typography gutterBottom>
				{heading}
			</Typography>
			<Table size="small">
				<TableBody align="right">
					{values.map(v => {
						const { key, value } = abbr(v)
						return <TableRow key={`${key}-${value}`}>
							<TableCell style={{ fontSize: "small", border: "none" }}>{key}</TableCell>
							<TableCell style={{ fontWeight: "bold", border: "none" }}>{toString(value)}</TableCell>
						</TableRow>
					}
					)}
				</TableBody>
			</Table>
		</CardContent>
	</Card>

export default SearchDetailCard