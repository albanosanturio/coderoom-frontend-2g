import { RoomClient } from '@/components/room/room-client'

export default async function RoomPage({ params }) {
  const { code } = await params
  return <RoomClient code={String(code).toUpperCase()} />
}
