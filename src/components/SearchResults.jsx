import React from 'react'

import Link from '@material-ui/core/Link'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import Typography from '@material-ui/core/Typography'

import NetDisplay from './NetDisplay'
import WlcDisplay from './WlcDisplay'
import LxxDisplay from './LxxDisplay'

import { ParallelModuleView } from './ParallelModuleView'
import { generateReference, generateUrl } from '../util/ReferenceHelper'

const referenceStyle = {
	flex: 0,
	flexBasis: "10%",
	fontFamily: "Open Sans",
	fontSize: "small",
	fontWeight: "bold",
	textTransform: "uppercase",
	verticalAlign: "middle",
	padding: "2px 2px",
	borderRadius: "50%",
}


// const textMapToTableCells = (text, lookupWord, displayTexts) => {
// 	const versesByVersion = []
// 	const getIndexOrCreate = key => {
// 		const versions = versesByVersion.map(v => v.key)
// 		if (versions.includes(key)) {
// 			return versions.indexOf(key)
// 		}
// 		else {
// 			versesByVersion.push({ key, displayElements: [] })
// 			return versesByVersion.length - 1
// 		}
// 	}
// 	text.forEach((v) => {
// 		if ("wlc" in v && displayTexts.includes("wlc")) {
// 			const index = getIndexOrCreate("wlc")
// 			versesByVersion[index].displayElements.push(<WlcDisplay lookupWord={lookupWord} key={v.rid} text={v.wlc} />)
// 		}
// 		if ("net" in v && displayTexts.includes("net")) {
// 			const index = getIndexOrCreate("net")
// 			versesByVersion[index].displayElements.push(<NetDisplay key={v.rid} text={v.net} />)
// 		}
// 		if ("lxx" in v && displayTexts.includes("lxx")) {
// 			const index = getIndexOrCreate("lxx")
// 			versesByVersion[index].displayElements.push(<LxxDisplay lookupWord={lookupWord} key={v.rid} text={v.lxx} />)
// 		}
// 	})
// 	return versesByVersion
// }

const NoResults = () =>
	<div><h1>No Results Found...</h1></div>


const SearchResults = ({ results, count, lookupWord, displayTexts }) => count === 0 ? <NoResults /> :
	<div>
		<Typography variant="subtitle1">
			Found {count ?? ""} Results
		</Typography>

		<div style={{ textAlign: "initial" }}>
			{results.map((item, i) => {
				const hotWords = Object.keys(item)
					.filter(k => /w\d+_wids/.test(k))
					.map(k => ({
						module_id: item[k.replace("_wids", "_module_id")],
						wids: item[k],
					}))
				return item.parallel_text.map(row => {
					const firstRid = row.modules.reduce((acc, m) => acc || m.rid, false)
					return <div style={{ display: "flex" }}>
						<div style={referenceStyle}>
							{generateReference([firstRid], true)}
						</div>
						<ParallelModuleView
							key={row.parallel_id}
							modulesToDisplay={[7, 4]}
							modules={row.modules}
							ridContext={firstRid}
							hotWords={hotWords}
							warmWords={item.warm_wids}
						/>
					</div>
				})
			})}
		</div>
	</div>

export default SearchResults
