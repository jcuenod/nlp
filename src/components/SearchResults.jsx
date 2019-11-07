import React from 'react'

import Link from '@material-ui/core/Link'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import Typography from '@material-ui/core/Typography'

import NetDisplay from './NetDisplay'
import WlcDisplay from './WlcDisplay'

import { generateReference, generateUrl } from '../util/ReferenceHelper'

const textMapToTableCells = (text, lookupWord) => {
	const versesByVersion = []
	const getIndexOrCreate = key => {
		const versions = versesByVersion.map(v => v.key)
		if (versions.includes(key)) {
			return versions.indexOf(key)
		}
		else {
			versesByVersion.push({ key, displayElements: [] })
			return versesByVersion.length - 1
		}
	}
	text.forEach((v) => {
		if ("wlc" in v) {
			const index = getIndexOrCreate("wlc")
			versesByVersion[index].displayElements.push(<WlcDisplay lookupWord={lookupWord} key={v.rid} text={v.wlc} />)
		}
		if ("net" in v) {
			const index = getIndexOrCreate("net")
			versesByVersion[index].displayElements.push(<NetDisplay key={v.rid} text={v.net} />)
		}
		if ("lxx" in v) {
			const index = getIndexOrCreate("lxx")
			versesByVersion[index].displayElements.push(<LxxDisplay key={v.rid} text={v.lxx} />)
		}
	})
	return versesByVersion
}

const NoResults = () =>
	<div><h1>No Results Found...</h1></div>


const SearchResults = ({ results, count, lookupWord }) => count === 0 ? <NoResults /> :
	<div>
		<Typography variant="subtitle1">
			Found {count} Results
		</Typography>
		{count > 500 && <Typography variant="subtitle2">
			(displaying 500)
		</Typography>}
		<Table>
			<TableBody>
				{results.map((r, i) =>
					<TableRow key={i}>
						<TableCell>
							<Link href={"https://parabible.com" + generateUrl(r.verses[0])}
								target="_blank">
								{generateReference(r.verses, true)}
							</Link>
						</TableCell>
						{textMapToTableCells(r.text, lookupWord).map(v =>
							<TableCell key={v.key} style={v.key === "wlc" ? { textAlign: "right" } : null}>
								{v.displayElements}
							</TableCell>
						)}
					</TableRow>
				)}
			</TableBody>
		</Table>
	</div>

export default SearchResults