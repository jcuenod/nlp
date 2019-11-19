import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'


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
const InfoSnackbar = ({ message, open, onClose }) => {
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
						{message}
					</span>
				</span >
			}
			action={
				<IconButton
					key="close"
					aria-label="close"
					color="inherit"
					className={classes.close}
					onClick={onClose}
				>
					<CloseIcon />
				</IconButton>}
		/>
	)
}
export default InfoSnackbar