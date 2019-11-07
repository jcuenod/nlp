import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'

import * as abbreviations from '../data/abbreviations'

const o = (obj, prop) => {
	if (obj.hasOwnProperty(prop)) {
		return obj[prop] ? obj[prop] : ""
	}
	return ""
}

const detailsToShow = details => {
	if (Object.keys(details).length === 0)
		return "click on a word"
	const primaryData = []
	let secondaryData = []
	primaryData.push(o(details, "voc_utf8"), o(details, "gloss"))
	//It's a hebrew word - Greek words have "pos" for part of speech
	if (o(details, "sp") == "verb") {
		if (o(details, "vt") == "ptca" || o(details, "vt") == "ptcp") {
			secondaryData = [o(details, "vs"), o(details, "vt"), o(details, "gn") + o(details, "nu")]
		}
		else if (o(details, "vt") == "infa" || o(details, "vt") == "infc") {
			secondaryData = [o(details, "vs"), o(details, "vt")]
		}
		else {
			secondaryData = [o(details, "vs"), o(details, "vt"), o(details, "ps")[1] + o(details, "gn") + o(details, "nu")[0]]
		}
	}
	else {
		secondaryData = [o(details, "gn"), o(details, "nu")]
	}
	const finalSecondaryData = secondaryData.reduce((a, v) => {
		if (v)
			a.push(v)
		return a
	}, [])

	const content = [...primaryData.map(d => <b>{d}</b>), "·", ...(finalSecondaryData.length ? finalSecondaryData : [abbreviations.termToEnglish.sp[details.sp]])]
	return content.map(c => <span>{c} </span>)
}

const useStyles = makeStyles(theme => ({
	close: {
		padding: theme.spacing(0.5),
	},
	icon: {
		fontSize: 20,
		opacity: 0.9,
		marginRight: theme.spacing(1)
	},
	message: {
		display: 'flex',
		alignItems: 'center',
	}
}))
const WordDetailsSnackbar = ({ wordDetails, open, onClose }) => {
	const classes = useStyles()
	return (
		<Snackbar
			anchorOrigin={{
				vertical: 'bottom',
				horizontal: 'center',
			}}
			open={open}
			autoHideDuration={6000}
			onClose={onClose}
			ContentProps={{
				'aria-describedby': 'message-id',
			}}
			message={
				<span id="client-snackbar" className={classes.message}>
					<span id="message-id">
						{detailsToShow(wordDetails)}
					</span>
				</span >
			}
			action={
				[
					<Button key="more" variant="outlined" color="secondary" size="small" onClick={onClose}>
						MORE
		  			</Button>,
					<IconButton
						key="close"
						aria-label="close"
						color="inherit"
						className={classes.close}
						onClick={onClose}
					>
						<CloseIcon />
					</IconButton>,
				]}
		/>
	)
}
export default WordDetailsSnackbar