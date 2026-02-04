import { NoticeList } from "@/features/support/components/NoticeList"
import { NOTICES_DATA } from "@/features/support/model/notices.data"

export function NoticesContainer() {
  return <NoticeList notices={NOTICES_DATA} />
}
