import React from 'react'

import IconButton from '@material-ui/core/IconButton'
import Popover from '@material-ui/core/Popover'
import Button from '@material-ui/core/Button'
import KeyboardIcon from '@material-ui/icons/Keyboard'

const keyboardLayout = [
	["א", "ב", "ג", "ד", "ה", "ו", "ז", "ח"],
	["ט", "י", "כ", "ל", "מ", "נ", "ס", "ע"],
	["פ", "צ", "ק", "ר", "שׁ", "שׂ", "ת"]
]
const HebrewKeyboard = ({ iconButtonClasses, injectChars }) => {
	const [anchorEl, setAnchorEl] = React.useState(null)
	const open = Boolean(anchorEl)
	const handleClick = event => {
		setAnchorEl(event.currentTarget);
	}
	const handleClose = () => {
		setAnchorEl(null);
	}
	return [
		<IconButton
			key="ico"
			onClick={handleClick}
			className={iconButtonClasses}
			aria-label="hebrew keyboard"
			color="primary">
			<KeyboardIcon />
		</IconButton>,
		<Popover
			key="pop"
			anchorOrigin={{
				vertical: 'bottom',
				horizontal: 'right',
			}}
			transformOrigin={{
				vertical: 'top',
				horizontal: 'right',
			}}
			anchorEl={anchorEl}
			keepMounted
			open={open}
			onClose={handleClose}>
			<div style={{ display: "flex", flexDirection: "column" }}>
				{keyboardLayout.map((row, i) => (
					<div key={i} style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
						{row.map(letter => (
							<Button
								key={letter}
								variant="outlined"
								style={{ margin: "0.2em", fontFamily: "SBL Biblit", fontSize: "x-large" }}
								onClick={() => injectChars(letter)}>{letter}</Button>
						))}
					</div>
				))}
			</div>
		</Popover>
	]
}
export default HebrewKeyboard