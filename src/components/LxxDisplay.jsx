import React from 'react'

export default ({ text, lookupWord }) =>
    <span className="greek">
        {Object.keys(text).map(ref =>
            text[ref].map(word => [
				<span key={word.wid} onClick={lookupWord}>{word.text}</span>,
				" "
            ])
        )}
    </span >
