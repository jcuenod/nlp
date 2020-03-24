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

import { generateReference, generateUrl } from '../util/ReferenceHelper'
import { display } from '@material-ui/system'

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
            versesByVersion[index].displayElements.push(<LxxDisplay lookupWord={lookupWord} key={v.rid} text={v.lxx} />)
        }
    })
    return versesByVersion
}

const NoResults = () =>
    <div><h1>No verses to display...</h1></div>

const findAllVersions = text =>
    Array.from(text.reduce((a, v) => {
        Object.keys(v).forEach(k => {
            if (k === "rid") return
            a.add(k)
        })
        return a
    }, new Set()))

const SingleText = ({ text, lookupWord, version }) =>
    <div style={{
        maxWidth: "800px",
        textAlign: "left",
        lineHeight: "1.6"
    }}>
        {text.map(verse =>
            <span key={verse.rid}>
                {(version === "wlc") ?
                    [<span key={"vno" + verse.rid} className="verse_number">‏{verse.rid % 1000} </span>,
                    <WlcDisplay lookupWord={lookupWord} key={verse.rid} text={verse.wlc} />]
                    : (version === "net") ?
                        <NetDisplay key={verse.rid} text={verse.net} />
                        : (version === "lxx") ?
                            <LxxDisplay lookupWord={lookupWord} key={verse.rid} text={verse.lxx} />
                            : null}
            </span>
        )}
    </div>
const MultipleText = ({ text, lookupWord, displayTexts }) =>
    <Table>
        <TableBody>
            {text.map((r, i) =>
                <TableRow key={i}>
                    <TableCell>
                        <div className="verse">
                            {r.rid % 1000}
                        </div>
                    </TableCell>
                    {Object.keys(r).filter(k => displayTexts.includes(k)).map(k =>
                        <TableCell key={k} style={k === "wlc" ? { textAlign: "right" } : null}>

                            {(k === "wlc") ?
                                <WlcDisplay lookupWord={lookupWord} key={r.rid} text={r.wlc} />
                                : (k === "net") ?
                                    <NetDisplay key={r.rid} text={r.net} />
                                    : (k === "lxx") ?
                                        <LxxDisplay lookupWord={lookupWord} key={r.rid} text={r.lxx} />
                                        : null}

                        </TableCell>
                    )}
                </TableRow>
            )}
        </TableBody>
    </Table>

const SearchResults = ({ location, text, lookupWord, displayTexts }) => {
    if (text.length === 0) {
        return <NoResults />
    }

    const versions = findAllVersions(text).filter(k => displayTexts.includes(k))
    let content = null
    if (versions.length > 1) {
        content = <MultipleText text={text} displayTexts={displayTexts} lookupWord={lookupWord} />
    }
    else {
        content = <SingleText text={text} version={versions[0]} lookupWord={lookupWord} />
    }
    return <div>
        <Typography variant="subtitle1">
            {location}
        </Typography>
        {content}
    </div>
}

export default SearchResults
