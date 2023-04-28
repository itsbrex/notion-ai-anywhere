import { ArrowUpCircleIcon } from "@heroicons/react/20/solid"
import {
  CheckIcon,
  PencilIcon,
  PencilSquareIcon
} from "@heroicons/react/24/outline"
import classNames from "classnames"
import { useCallback, useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"

import { useStorage } from "@plasmohq/storage/hook"

import { stopPropagation, storage } from "~lib"
import {
  getMainAbsolutePositionAtCursor,
  getMainPositionBySpacerIndex,
  isDocs
} from "~lib/docs"
import { ConstEnum, ISelectionOption, selectionMenuList } from "~lib/enums"
import { initLang, useLang } from "~lib/hooks/useLang"
import { sendNotionPostToBackground } from "~lib/notion"
import { showToast } from "~lib/toast"
import type { INotionSpace, IPostNotionProgress } from "~lib/types/notion"

import BtnIcon from "../icons/notion-icon.png"
import { AskMenuList } from "./ask-option-list"
import HandleResultMenu from "./handle-result-menu"

initLang()

interface IContentPanelProps {
  show: boolean
  position?: {
    x: number
    y: number
    w: number
  }
  selectionText: string
  onClose: () => void
  setSelectionText: (text: string) => void
}

export const ContentPanel = (props: IContentPanelProps) => {
  const { show, selectionText, onClose, setSelectionText } = props
  const [notionSpace] = useStorage<INotionSpace | undefined>({
    key: ConstEnum.USED_NOTION_SPACE,
    instance: storage
  })
  const [isNotionLogin] = useStorage({
    key: ConstEnum.NOTION_IS_LOGIN,
    instance: storage
  })

  const [recentAsk, setRecentAsk] = useStorage<ISelectionOption[]>({
    key: ConstEnum.RECENT_ASK,
    instance: storage
  })

  const [darkMode] = useStorage({
    key: ConstEnum.DARK_MODE,
    instance: storage
  })

  const [query, setQuery] = useState("")

  const [result, setResult] = useState("")

  const [promptType, setPromptType] = useState("")

  const [sending, setSending] = useState(false)

  const [editSelection, setEditSelection] = useState(false)

  const { t } = useLang()

  const send = async (p?: string) => {
    if (sending) {
      showToast(t("MessageProcessing"))
      return
    }
    if (!isNotionLogin) {
      // notion not login

      return
    }
    if (!notionSpace) {
      // not select notion space

      return
    }

    if (query) {
      const recentAskTemp = recentAsk || []
      const index = recentAskTemp.findIndex((item) => item.value === query)
      if (index > -1) {
        recentAskTemp.splice(index, 1)
      }
      recentAskTemp.unshift({ value: query, label: query })
      setRecentAsk(recentAskTemp.slice(0, 5))
    }

    let resultTemp = ""
    setPromptType(p || promptType || query)
    setResult("")
    setSending(true)

    try {
      await sendNotionPostToBackground({
        prompt: query,
        context: selectionText,
        promptType: p || promptType,
        onProgress: (e: IPostNotionProgress) => {
          resultTemp += e.value.completion
          if (!e.done) {
            setResult(resultTemp)
          } else {
            setSending(false)
          }
        }
      })
    } catch (error) {
      console.log(error, "error")
      showToast(t("MessageProcessing"))
    }

    setSending(false)
  }

  useEffect(() => {
    if (!show) {
      clear()
    }
  }, [show])

  const clear = () => {
    setQuery("")
    setResult("")
    setSending(false)
    setPromptType("")
  }

  const handleClose = () => {
    // if (query || result) {

    //   return;
    // }
    clear()
    onClose()
  }

  const handleKeyup = useCallback(
    (e: KeyboardEvent) => {
      if (show && e.key === "Escape") {
        handleClose()
      }
    },
    [show]
  )

  useEffect(() => {
    document.addEventListener("keyup", handleKeyup)
    return () => {
      document.removeEventListener("keyup", handleKeyup)
    }
  }, [handleKeyup])

  return (
    <>
      <div className="relative w-full">
        <img
          className="pointer-events-none absolute top-3.5 left-4 h-5 w-5 text-gray-400"
          src={BtnIcon}></img>
        <input
          value={query}
          type="text"
          className="box-border w-full h-12 pl-12 pr-12 rounded-none input input-bordered"
          style={{
            outline: "none",
            borderLeft: "none",
            borderRight: "none",
            borderTop: "none"
          }}
          placeholder={t("AskInputPlaceholder") as string}
          onChange={(event) => {
            setQuery(event.target.value)
            if (event.target.value.trim() === "") {
              setPromptType("")
            }
          }}
          onKeyDown={(event) => {
            event.stopPropagation()
            if (event.key === "Enter") {
              send()
            }
            if (event.key === "Escape") {
              handleClose()
            }
          }}
        />
        <ArrowUpCircleIcon
          onClick={() => send()}
          className={classNames(
            "cursor-pointer absolute top-3.5 right-4 h-5 w-5",
            query ? "text-violet-300" : "text-gray-400"
          )}
        />
      </div>

      <div
        className="flex pb-6 overflow-y-hidden"
        style={{
          height: "calc(100% - 48px)"
        }}>
        <div
          className="h-full overflow-auto "
          style={{
            // minWidth: "300px"
            width: "260px"
          }}>
          {recentAsk && recentAsk.length > 0 && (
            <AskMenuList
              list={[
                {
                  label: t("RecentAsk"),
                  list: recentAsk.map((item) => ({
                    icon: PencilIcon,
                    ...item
                  }))
                }
              ]}
              onOptionClick={(option) => {
                setQuery(option.value)
                // send(option.value)
              }}
            />
          )}
          <AskMenuList
            list={selectionMenuList}
            onOptionClick={(option) => {
              if (option.description) {
                setPromptType(option.value)
                setQuery(t(option.description) as string)
              } else {
                send(option.value)
              }
            }}
          />
        </div>

        <div className="relative flex-1 h-full p-5 overflow-y-scroll border-l border-gray-200 border-opacity-20">
          {(result || sending) && (
            <div className="w-full mb-6 indicator">
              <div className="w-full border card">
                <div className="w-full p-10 card-body">
                  <div>
                    <span
                      className="absolute font-sans text-5xl text-violet-300 left-2 top-3"
                      style={{
                        fontFamily: "arial"
                      }}>
                      
                    </span>
                    {/* {selectionText} */}
                    {result ? (
                      <div className="overflow-x-scroll text-xs break-words">
                        <ReactMarkdown>{result}</ReactMarkdown>
                      </div>
                    ) : (
                      <span className="w-full text-center chat-typing">
                        <span className="chat-typing-dot"></span>
                        <span className="chat-typing-dot"></span>
                        <span className="chat-typing-dot"></span>
                      </span>
                    )}
                    <span
                      className="absolute bottom-0 font-sans text-5xl text-violet-300 right-2"
                      style={{
                        fontFamily: "arial"
                      }}>
                      
                    </span>
                  </div>
                </div>
              </div>
              <HandleResultMenu
                result={result}
                handleClose={handleClose}></HandleResultMenu>
              <div className="absolute w-full text-xs text-center text-gray-200 bottom-1">
                {t("Result")}
              </div>
            </div>
          )}

          <div className="w-full indicator">
            {/* <span className="indicator-item badge badge-primary">
                    Modify
                  </span> */}
            <div className="w-full border card">
              <div className="relative w-full p-10 text-xs break-words card-body">
                <div>
                  <span
                    className="absolute font-sans text-5xl text-violet-300 left-2 top-3"
                    style={{
                      fontFamily: "arial"
                    }}>
                    
                  </span>

                  {editSelection ? (
                    <div className="relative w-full">
                      <textarea
                        style={{
                          minHeight: "250px"
                        }}
                        value={selectionText}
                        onChange={(e) => {
                          setSelectionText(e.target.value)
                        }}
                        onBlur={() => {
                          setEditSelection(false)
                        }}
                        className="w-full text-xs textarea textarea-bordered"
                        placeholder={
                          t("Write selection text") as string
                        }></textarea>
                      <CheckIcon
                        className="absolute w-6 h-6 cursor-pointer bottom-3 right-3 text-violet-300 "
                        onClick={() => {
                          setEditSelection(false)
                        }}></CheckIcon>
                    </div>
                  ) : selectionText ? (
                    <ReactMarkdown>{selectionText}</ReactMarkdown>
                  ) : (
                    <div className="flex items-center justify-center w-full text-center text-gray-300">
                      {t("No Selection Text")}
                    </div>
                  )}

                  <span
                    className="absolute bottom-0 font-sans text-5xl text-violet-300 right-2"
                    style={{
                      fontFamily: "arial"
                    }}>
                    
                  </span>
                </div>
                <div
                  className="absolute top-0 right-0 p-2 cursor-pointer"
                  onClick={() => {
                    setEditSelection(true)
                  }}>
                  <PencilSquareIcon className="w-5 h-5 text-violet-300"></PencilSquareIcon>
                </div>
              </div>
            </div>
            <div className="absolute w-full text-xs text-center text-gray-200 bottom-1">
              {t("SelectionText")}
            </div>
          </div>
        </div>
      </div>

      {(!isNotionLogin || !notionSpace) && (
        <div className="absolute top-0 left-0 z-10 flex items-center justify-center w-full h-full p-12 text-3xl text-center text-white bg-black bg-opacity-80">
          {!isNotionLogin
            ? t("NotionNotLoginDescPanel")
            : !notionSpace
            ? t("NotionNotSelectSpace")
            : ""}
        </div>
      )}
    </>
  )
}

// export default ContentPanel

export const ModalPanel = (props: IContentPanelProps) => {
  const { show, onClose } = props
  const [darkMode] = useStorage({
    key: ConstEnum.DARK_MODE,
    instance: storage
  })

  return (
    <div
      data-theme={darkMode ? "dark" : "light"}
      className="fixed flex text-sm notion-ai-anywhere-panel "
      onMouseUp={stopPropagation}
      onMouseDown={stopPropagation}
      onKeyDown={stopPropagation}
      onKeyUp={stopPropagation}>
      {/* Put this part before </body> tag */}
      <input
        type="checkbox"
        checked={show}
        id="my-modal-6"
        className="modal-toggle"
      />
      <div
        className="pt-24 modal modal-middle"
        onClick={() => {
          onClose()
        }}>
        <div
          className="p-0 modal-box"
          style={{
            width: "1000px",
            maxWidth: "1000px",
            height: "500px"
          }}
          onClick={(e) => {
            e.stopPropagation()
          }}>
          <ContentPanel {...props}></ContentPanel>
        </div>
      </div>
    </div>
  )
}

export const DropdownPanel = (props: IContentPanelProps) => {
  const {
    show,
    position = {
      x: 0,
      y: 300,
      w: window.innerWidth
    }
  } = props

  return (
    <div
      // data-theme={darkMode ? "dark" : "light"}
      // className={classNames("dropdown dropdown-bottom dropdown-end")}
      style={{
        position: "fixed",
        left: position.x + "px",
        top: position.y + "px",
        width: position.w + "px"
      }}>
      <div
        className="absolute w-11/12 overflow-hidden shadow bg-base-100 rounded-box"
        style={{
          visibility: show ? "visible" : "hidden",
          opacity: show ? 1 : 0,
          top: 0,
          height: "400px",
          left: "50%",
          transform: "translateX(-50%)",
          WebkitTransform: "translateX(-50%)",
          maxWidth: "1000px"
        }}>
        <ContentPanel {...props}></ContentPanel>
      </div>
    </div>
  )
}

enum PanelEnum {
  DropdownPanel = "DropdownPanel",
  ModalPanel = "ModalPanel"
}

const getPosition = () => {
  try {
    if (isDocs()) {
      const position = getMainPositionBySpacerIndex()

      const rect = document
        .getElementById("vodka-zoom-outer")
        ?.getBoundingClientRect() || { left: 0, top: 300, width: 0 }

      let top = (rect?.top || 0) + (position?.y || 0)
      if (!position || !rect) {
        // 尝试获取 cursor 位置
        const p = getMainAbsolutePositionAtCursor()

        if (p) {
          top = p.top + rect.top + p.height + 20
          // return
        } else {
          return null
        }
      }

      if (!top) {
        return null
      }

      let cur = 0
      if (top + 400 > window.innerHeight) {
        const editorScrollContainer = document.getElementById(
          "vodka-appview-editor"
        )
        if (editorScrollContainer) {
          cur = 450 - window.innerHeight + top
          editorScrollContainer.scrollTop =
            editorScrollContainer.scrollTop + cur
          top = top - cur
        }
        // return getPosition()
      }

      return {
        x: rect.left,
        y: top || 300,
        w: rect.width
      }
    }

    // Common web
    const selection = window.getSelection()
    if (selection) {
      const str = selection?.toString().trim()
      if (!str) {
        return null
      }

      const range = selection.getRangeAt(0)
      const rects = range.getClientRects()

      const lastRect = rects[rects.length - 1]
      let top = lastRect.top + lastRect.height + 5

      if (top + 400 > window.innerHeight) {
        top = lastRect.top - lastRect.height - 5 - 400
        // return getPosition()
      }

      return {
        x: 0,
        y: top,
        w: window.innerWidth
      }
    }

    return null
  } catch (error) {
    return null
  }
  // Docs
}

/**
 * 自动选择是 modal 还是选区，position 通过 selection 位置获取
 * @param
 * @returns
 */
export default function AutoPanel(props: IContentPanelProps) {
  const { show, ...rest } = props

  const [position, setPosition] = useState({ x: 0, y: 0, w: 0 })

  const [showPanel, setShowPanel] = useState(false)

  const [panelType, setPanelType] = useState(PanelEnum.DropdownPanel)

  const handleShowPanel = useCallback((type = PanelEnum.DropdownPanel) => {
    setPanelType(type)
    setTimeout(() => {
      setShowPanel(true)
    }, 0)
  }, [])

  useEffect(() => {
    if (show) {
      let position = getPosition()

      if (!position) {
        handleShowPanel(PanelEnum.ModalPanel)
        return
      }

      if (!position) {
        handleShowPanel(PanelEnum.ModalPanel)
        return
      }

      setPosition(position)
      handleShowPanel(PanelEnum.DropdownPanel)
    } else {
      setShowPanel(false)
    }
  }, [show])

  return (
    <>
      {panelType === PanelEnum.ModalPanel && (
        <ModalPanel {...rest} show={showPanel} />
      )}
      {panelType === PanelEnum.DropdownPanel && (
        <DropdownPanel {...rest} show={showPanel} position={position} />
      )}
    </>
  )
}
