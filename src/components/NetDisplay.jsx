import React from 'react'

export default ({ text }) =>
    <span dangerouslySetInnerHTML={{ __html: text }} />
