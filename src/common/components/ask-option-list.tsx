import {
  ArrowUturnLeftIcon,
  ChevronRightIcon,
  PencilIcon
} from "@heroicons/react/24/outline"
import classNames from "classnames"
import { useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { storage } from "~lib"
import { ConstEnum, ISelectionOption, ISelectionOptionMap } from "~lib/enums"
import { useLang } from "~lib/hooks/useLang"

interface IAskOptionChildListProps {
  label: string
  list: ISelectionOption[]
  activeOption?: ISelectionOption
  onOptionActive: (option: ISelectionOption) => void
  onOptionClick: (option: ISelectionOption) => void
}

const AskOptionChildList = (props: IAskOptionChildListProps) => {
  const {
    label,
    list = [],
    activeOption,
    onOptionActive,
    onOptionClick
  } = props
  // const [activeIndex, setActiveIndex] = useState(0)
  const [darkMode] = useStorage({
    key: ConstEnum.DARK_MODE,
    instance: storage
  })

  const { t } = useLang()

  return (
    <div className="p-5 pt-0 pb-0 text-xs">
      <h1 className="mt-3 mb-4 text-xs font-semibold text-gray-500">
        {t(label)}
      </h1>
      <div
        className={classNames(
          "-mx-2 text-sm",
          darkMode ? "text-gray-300" : "text-gray-700"
        )}>
        {list.map((item, index) => {
          const active = activeOption?.value === item.value
          return (
            <div
              className="relative w-full dropdown dropdown-hover"
              key={item.value}>
              <div
                // value={item}
                tabIndex={0}
                onMouseEnter={(e) => {
                  e.stopPropagation()
                  onOptionActive(item)
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  !item.options?.length && onOptionClick(item)
                }}
                className={classNames(
                  "flex cursor-default select-none items-center rounded-md p-1.5",
                  active && "bg-gray-100 text-gray-900"
                )}>
                <>
                  {item.icon ? (
                    <item.icon className="flex-none w-4 h-4 rounded-full text-violet-300" />
                  ) : (
                    <PencilIcon
                      className={classNames(
                        "h-4 w-4 flex-none text-violet-300 text-opacity-100",
                        active && "text-opacity-100"
                      )}
                      aria-hidden="true"
                    />
                  )}
                  <span className="flex-auto ml-3 text-xs leading-5 truncate">
                    {t(item.label)}
                  </span>
                  {active && !item.options?.length && (
                    <ArrowUturnLeftIcon
                      className="flex-none w-4 h-4 ml-3 text-gray-400"
                      aria-hidden="true"
                    />
                  )}
                  {item.options?.length && (
                    <ChevronRightIcon
                      className="flex-none w-4 h-4 ml-3 text-gray-400"
                      aria-hidden="true"
                    />
                  )}
                </>
              </div>
              {item.options?.length && (
                <div
                  tabIndex={0}
                  className="right-0 p-1 shadow dropdown-content menu bg-base-100 rounded-box w-52 ">
                  {item.options?.map((option) => {
                    const active = activeOption?.value === option.value
                    return (
                      <div
                        key={option.value}
                        onMouseEnter={(e) => {
                          e.stopPropagation()
                          onOptionActive(option)
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          onOptionClick(option)
                        }}
                        tabIndex={0}
                        className={classNames(
                          "flex cursor-default select-none items-center rounded-md p-1",
                          active && "bg-gray-100 text-gray-900"
                        )}>
                        <>
                          <span className="flex-auto ml-3 text-xs leading-5 truncate">
                            {t(option.label)}
                          </span>
                          {active && (
                            <ArrowUturnLeftIcon
                              className="flex-none w-4 h-4 ml-3 text-gray-400"
                              aria-hidden="true"
                            />
                          )}
                        </>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface IAskMenuListProps {
  list: ISelectionOptionMap[]
  onOptionClick: (option: ISelectionOption) => void
}

export const AskMenuList = (props: IAskMenuListProps) => {
  const { list = [], onOptionClick } = props
  const [activeOption, setActiveOption] = useState<ISelectionOption>()

  return (
    <>
      {list.map((item) => (
        <AskOptionChildList
          key={item.label}
          {...item}
          activeOption={activeOption}
          onOptionActive={setActiveOption}
          onOptionClick={onOptionClick}
        />
      ))}
    </>
  )
}
