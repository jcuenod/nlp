import React from 'react'

import Popover from '@material-ui/core/Popover';
import IconButton from '@material-ui/core/IconButton';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import HistoryIcon from '@material-ui/icons/History';

const ITEM_HEIGHT = 48

const HistoryMenu = ({ history, iconButtonClasses, setSearchInput }) => {
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
            aria-label="menu">
            <HistoryIcon />
        </IconButton>,
        <Popover
            key="pop"
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
            }}
            anchorEl={anchorEl}
            keepMounted
            open={open}
            onClose={handleClose}
            PaperProps={{
                style: {
                    maxHeight: ITEM_HEIGHT * 9.5,
                    maxWidth: "90%",
                },
            }}>
            <MenuList>
                {history.map(option => (
                    <MenuItem
                        key={option}
                        style={{ fontSize: "small", textOverflow: "fade(10px)" }}
                        onClick={(e) => {
                            setSearchInput(e.target.textContent)
                            handleClose()
                        }}>
                        {option}
                    </MenuItem>
                ))}
            </MenuList>
        </Popover>
    ]
}
export default HistoryMenu