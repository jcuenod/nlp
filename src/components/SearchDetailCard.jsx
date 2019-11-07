import React from 'react'

import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import Typography from '@material-ui/core/Typography';

const toTitleCase = str =>
	str.split(' ')
		.map(w => w[0].toUpperCase() + w.substr(1).toLowerCase())
		.join(' ')
		
const toString = value => {
	if (typeof value === "string") {
		return value
	}
	else if (Array.isArray(value)) {
		return value.join(", ")
	}
	else if (typeof value === "object") {
		if ("from" in value && "to" in value) {
			return value.from + " to " + value.to
		}
	}
	console.error(value)
	throw "Don't know how to handle value that we just printed..."
}

const SearchDetailCard = ({ heading, values }) =>
	<Card style={{ display: "inline-block", margin: "0.5em" }}>
		<CardContent>
			<Typography gutterBottom>
				{heading}
			</Typography>
			<Table size="small">
				<TableBody align="right">
					{values.map(({ key, value }) =>
						<TableRow key={`${key}-${value}`}>
							<TableCell style={{ fontSize: "small", border: "none" }}>{key}</TableCell>
							<TableCell style={{ fontWeight: "bold", border: "none" }}>{toString(value)}</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</CardContent>
	</Card>

export default SearchDetailCard