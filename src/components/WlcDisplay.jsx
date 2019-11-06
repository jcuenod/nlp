import React from 'react'

const temperatures = [
    "inherit",
    "rgb(0, 69, 120)",
    "rgb(234, 67, 0)"
]
const getColor = ({ temperature }) =>
    temperature ? temperatures[temperature] : "inherit"

export default ({ text }) =>
    <span className="hebrew">
        {text.map(words =>
            words.map(wbit => [
                <span key={wbit.wid} style={{ color: getColor(wbit) }}>{wbit.word}</span>,
                wbit.trailer
            ])
        )}
    </span>
