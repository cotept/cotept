import { Button } from "@repo/shared/components/button"

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">HOME</h1>
      <Button variant={"destructive"}>코테피티 화이팅</Button>
    </div>
  )
}
