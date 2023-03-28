import cssText from "data-text:~styles/main.css"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useState } from "react"
import Tesseract, { createWorker } from "tesseract.js"

import { sendToBackground } from "@plasmohq/messaging"
import { useMessage } from "@plasmohq/messaging/hook"
import { useStorage } from "@plasmohq/storage/hook"

// import "~base.css"

import ContentEnter from "~common/components/content-enter"
import ContentPanel from "~common/components/content-panel"
import { IPosition, getSelectionText, storage } from "~lib"
import { ConstEnum } from "~lib/enums"
import { setToastContainerEle } from "~lib/toast"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: false
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

const PlasmoOverlay = () => {
  const [isPanelShow, setIsPanelShow] = useState(false)
  // const [position, setPosition] = useState<IPosition>()
  const [selectionText, setSelectionText] = useState<string>("")

  useMessage<
    {
      selectionText: string
    },
    any
  >(async (req, res) => {
    console.log("show-panel1")
    if (req.name === "show-panel") {
      console.log("show-panel", req.body)
      if (req.body?.selectionText) {
        setSelectionText(req.body?.selectionText)
      }
      setIsPanelShow(true)
      // const t = getSelectionText()
      // if (t) {
      //   setSelectionText(t)
      //   setIsPanelShow(true)
      // }
    }
  })

  const [darkMode] = useStorage({
    key: ConstEnum.DARK_MODE,
    instance: storage
  })

  // console.log(ocr, "ocr")

  console.log(darkMode, "darkMode1")

  return (
    <div
      style={{
        zIndex: 999999
      }}
      data-theme={darkMode ? "dark" : "light"}>
      <div
        id={ConstEnum.TOAST_CONTAINER}
        className="fixed"
        style={{
          zIndex: 1001
        }}
        ref={(ref) => {
          setToastContainerEle(ref)
        }}></div>
      <ContentEnter
        isPanelShow={isPanelShow}
        showPanel={({
          // position,
          selectionText
        }: {
          position: IPosition
          selectionText: string
        }) => {
          // setPosition(position)
          setSelectionText(selectionText)
          setIsPanelShow(true)
        }}></ContentEnter>
      <ContentPanel
        show={isPanelShow}
        selectionText={selectionText}
        // position={position}
        onClose={() => {
          setIsPanelShow(false)
          // setPosition(undefined)
        }}></ContentPanel>
    </div>
  )
}

console.info("Notion AI anywhere content loaded")
export default PlasmoOverlay
