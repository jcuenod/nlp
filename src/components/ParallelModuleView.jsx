import React, { useEffect, useState } from 'react'

const ridToVerse = rid => rid % 1000
const ridWithoutVerse = rid => Math.floor(rid / 1000)
const ridToChapter = rid => ridWithoutVerse(rid) % 1000
const ridToChapterReference = rid => ridToChapter(rid) + ":" + ridToVerse(rid)

const verseNumberStyle = {
    fontFamily: "Open Sans",
    fontSize: "8px",
    fontWeight: "bold",
    color: "#d70000",
    verticalAlign: "middle",
    padding: "1px 3px 1px 2px",
    borderRadius: "10px",
}

const inlineViewStyles = {
    display: "inline",
}
const parallelViewStyles = {
    flex: 1,
    flexBasis: "45%",
}
const languageStyles = {
    "english": {
        direction: "ltr",
        padding: "7px 5px 0px 5px",
        fontSize: "medium",
    },
    "hebrew": {
        direction: "rtl",
        padding: "0 5px 7px 5px",
        fontSize: "x-large",
        fontFamily: "SBL Biblit",
    },
    "greek": {
        direction: "ltr",
        padding: "5px 5px 2px 5px",
        fontSize: "large",
        fontFamily: "SBL Biblit",
    },
}

const isHebrew = (str) => /[\u0590-\u05FF]/.test(str)
const isGreek = (str) => /[\u0370-\u03FF]/.test(str)
const languageFromString = str => {
    if (isHebrew(str)) {
        return "hebrew"
    }
    if (isGreek(str)) {
        return "greek"
    }
    return "english"
}
const languageFromWords = (words) =>
    languageFromString(words.map(w => w.text + w.trailer).join(""))


const getColor = ({ wid, moduleId, hotWordSet, warmWordSet }) => {
    // if ( moduleId === activeWid.moduleId) {
    // return { "color": "#0078d7" }
    // }
    // else
    if (hotWordSet.has(wid)) {
        return { "color": "#d70000" }
    }
    else if (warmWordSet.has(wid)) {
        return { "color": "#ffc000" }
    }

    return {}
}

const highlightStyles = {
    "background": { color: "#fff", background: "rgb(215,0,0)" },
    "border": { border: "1px solid rgb(215,0,0)" },
}
const VerseNumber = ({ highlight, children }) =>
    <span style={{ ...verseNumberStyle, ...highlight in highlightStyles ? highlightStyles[highlight] : {} }}>
        {children}
    </span>

const ridForRidContext = ({ rid, ridContext }) => {
    if (Math.floor(rid / 1000) === Math.floor(ridContext / 1000)) {
        // Same chapter (whether or not verse matches)
        return <VerseNumber highlight={rid !== ridContext ? "background" : ""}>{ridToVerse(rid)}</VerseNumber>
    }
    else if (Math.floor(rid / 1000000) === Math.floor(ridContext / 1000000)) {
        // Same book different chapter
        return <VerseNumber highlight={"border"}>{ridToChapter(rid)}:{ridToVerse(rid)}</VerseNumber>
    }
    else {
        return <span title={"Different book, chapter and verse! " + rid}>!</span>
    }
}

const WordArrayView = ({ words, moduleId, rid, ridContext, hotWords, warmWords, inline }) => {
    const hotWordSet = new Set([].concat(...hotWords))
    const warmWordSet = new Set(warmWords)
    return (
        <div style={{ ...(inline ? inlineViewStyles : parallelViewStyles), ...languageStyles[languageFromWords(words)] }}>
            {ridForRidContext({ rid, ridContext })}
            &nbsp;
            {words.map(w =>
                [
                    <span
                        key={w.wid}
                        className="wbit"
                        style={{ cursor: "pointer", ...getColor({ wid: w.wid, moduleId, hotWordSet, warmWordSet }) }}
                        onClick={() => {
                            // TODO: on word click
                        }}>
                        {w.text}
                    </span>,
                    // Prepend u2060 (zero width nbsp)
                    //so punctuation doesn't end up on next line
                    "⁠" + w.trailer
                ]
            )}
        </div>
    )
}
const HtmlStringView = ({ htmlString, rid, ridContext, inline }) =>
    <div style={{ ...(inline ? inlineViewStyles : parallelViewStyles), ...languageStyles[languageFromString(htmlString)] }}>
        {ridForRidContext({ rid, ridContext })}
        &nbsp;
        <span
            dangerouslySetInnerHTML={{ __html: htmlString }}
        />
    </div>


const ParallelModuleView = ({ modulesToDisplay, ridContext, modules, hotWords = [], warmWords = [], termsToHighlight = [] }) =>
    !Array.isArray(modulesToDisplay) || modulesToDisplay.length === 0
        ? <div>Error: No modulesToDisplay passed into ModuleView</div>
        : modulesToDisplay.map(moduleId => {
            const module = modules.find(m => m.module_id === moduleId)
            const wordsToHighlight = warmWords || termsToHighlight.filter(t => t.wid)
            if (!module) {
                console.log("module not returned", moduleId)
                return <div style={parallelViewStyles} />
            }
            else if ("text_as_word_array" in module) {
                const moduleHotWords = hotWords
                    .filter(h => h.module_id === moduleId)
                    .map(h => h.wids)
                return <WordArrayView
                    key={moduleId}
                    words={module.text_as_word_array}
                    moduleId={moduleId}
                    rid={module.rid}
                    ridContext={ridContext}
                    hotWords={moduleHotWords}
                    warmWords={warmWords}
                    inline={false} />
            }
            else if ("text_as_html_string" in module) {
                return <HtmlStringView
                    key={moduleId}
                    rid={module.rid}
                    ridContext={ridContext}
                    htmlString={module.text_as_html_string}
                    inline={false} />
            }
            console.log("module empty", moduleId)
            return <div style={{ display: "flex" }} />
        })

export { ParallelModuleView }
