import React from 'react'

export default ({ text, lookupWord }) =>
    <span className="greek">
        {Object.keys(text).map(ref =>
            text[ref].map(word => [
				<span key={wbit.wid} onClick={lookupWord}>{wbit.word}</span>,
				" "
            ])
        )}
    </span >
