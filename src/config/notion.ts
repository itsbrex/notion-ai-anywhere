// initialize notion sdk
// initialize notion sdk
import { Client } from "@notionhq/client"
import { Storage } from "@plasmohq/storage"

const getNotion = async () => {
  const storage = new Storage({
    area: "session",
    // secretKeysList: ["token"]
  })
  const token = await storage.get("token")
  const notion = new Client({
    auth: token ?? ""
  })
  return notion
}

export default getNotion
