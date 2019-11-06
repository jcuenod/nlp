import React from 'react'

import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'

import NetDisplay from './NetDisplay'
import WlcDisplay from './WlcDisplay'

import { generateReference } from '../util/ReferenceHelper'

const textMapToTableCells = text => {
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
			console.log(index)
			versesByVersion[index].displayElements.push(<WlcDisplay key={v.rid} text={v.wlc} />)
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

const SearchResults = ({ results, count }) => count === 0 ? <NoResults /> :
	<div>
		<h1>Found {count} Results</h1>
		<Table>
			<TableBody>
				{results.map((r, i) =>
					<TableRow key={i}>
						<TableCell>{generateReference(r.verses, true)}</TableCell>
						{textMapToTableCells(r.text).map(v =>
							<TableCell key={v.key}>
								{v.displayElements}
							</TableCell>
						)}
					</TableRow>
				)}
			</TableBody>
		</Table>
	</div>

export default SearchResults