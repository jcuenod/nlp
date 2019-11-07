import React from 'react'

import Paper from '@material-ui/core/Paper'
import Divider from '@material-ui/core/Divider'
import IconButton from '@material-ui/core/IconButton'
import InputBase from '@material-ui/core/InputBase'
import SearchIcon from '@material-ui/icons/Search'
import { makeStyles } from '@material-ui/core/styles'

import HebrewKeyboard from './HebrewKeyboard'
import HistoryMenu from './HistoryMenu'

const useStyles = makeStyles(theme => ({
    root: {
        padding: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        maxWidth: "900px",
        width: "90%"
    },
    input: {
        marginLeft: theme.spacing(1),
        flex: 1,
    },
    divider: {
        height: 28,
        margin: 4,
    },
}));

const SearchAppBar = ({ value, history, onChange, injectChars, setSearchInput, parseQuery }) => {
    const classes = useStyles()
    return (
        <div style={{ display: "flex", justifyContent: "center" }}>
            <Paper component="form" className={classes.root} onSubmit={parseQuery}>
                <HistoryMenu history={history} setSearchInput={setSearchInput} iconButtonClasses={classes.iconButton} />
                <InputBase
                    onChange={onChange}
                    autoFocus={true}
                    className={classes.input}
                    placeholder="What do you want to do?"
                    inputProps={{ 'aria-label': 'What do you want to do?' }}
                    value={value}
                />
                <IconButton type="submit" className={classes.iconButton} aria-label="search">
                    <SearchIcon />
                </IconButton>
                <Divider className={classes.divider} orientation="vertical" />
                <HebrewKeyboard iconButtonClasses={classes.iconButton} injectChars={injectChars} />
            </Paper>
        </div >
    )
}
export default SearchAppBar