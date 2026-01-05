import React from "react"

import Link from "next/link"

import { Button } from "@repo/shared/components/button"
import { PulseBadge } from "@repo/shared/src/components/pulse-badge"
import { TextTypeMotion } from "@repo/shared/src/components/text-type-motion"

import { ArrowRight } from "lucide-react"

export const LandingHero = () => {
  return (
    <section className="relative flex min-h-screen flex-col justify-center overflow-hidden pb-20 pt-32">
      {/* Background Decor */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30"></div>
      <div className="bg-brand-primary/20 pointer-events-none absolute left-1/2 top-20 h-[400px] w-[800px] -translate-x-1/2 rounded-full blur-[120px]"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="mb-16 flex flex-col items-center text-center">
          <h1 className="mb-6 text-5xl font-black leading-[1.1] tracking-tight md:text-7xl">
            검증된 실력의 멘토와 <br />
            <span className="bg-gradient-to-r from-purple-600 via-purple-400 to-purple-300 bg-clip-text text-transparent">
              실시간 1:1 코딩 멘토링
            </span>
          </h1>

          <p className="mb-10 max-w-2xl text-base font-medium leading-relaxed text-zinc-400 md:text-xl">
            실시간 코드 에디터와 음성 통화로 성장을 위한 1:1 멘토링을 받아보세요.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Link href="/auth/signup">
              <Button variant={"auth-special"} size="lg" className="h-14 rounded-xl px-8 text-base font-bold">
                <span className="relative z-10 flex items-center gap-2">
                  CotePT 시작하기
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </Button>
            </Link>
            {/* <Button
              variant="outline"
              size="lg"
              className="flex h-14 items-center gap-2 rounded-xl border-white/10 bg-white/5 px-8 text-base font-bold text-white hover:bg-white/10">
              <PlayCircle className="h-5 w-5" />
              데모 보기
            </Button> */}
          </div>
        </div>

        {/* IDE Preview Component */}
        <div className="animate-float mx-auto max-w-5xl">
          <div className="relative rounded-2xl border border-white/5 bg-[#1e1629] p-4 shadow-2xl">
            {/* IDE 헤더 */}
            <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500/50"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500/50"></div>
                <div className="h-3 w-3 rounded-full bg-green-500/50"></div>
              </div>
              <PulseBadge variant={"default"}>세션 녹화 중</PulseBadge>
            </div>

            <div className="flex flex-col gap-6 md:flex-row">
              {/* Sidebar */}
              <div className="hidden w-48 flex-col gap-4 border-r border-white/5 pr-4 md:flex">
                <div className="h-4 w-full rounded bg-white/5"></div>
                <div className="h-4 w-3/4 rounded bg-white/5"></div>
                <div className="h-4 w-1/2 rounded bg-white/5"></div>
              </div>
              {/* Code Editor */}
              <div className="relative flex-grow overflow-hidden rounded-xl bg-[#0d0915] p-6 font-mono text-sm leading-relaxed">
                <div className="text-zinc-400">
                  <span className="text-purple-400">function</span>{" "}
                  <span className="text-yellow-300">binarySearch</span>(arr, x) {"{"}
                  <br />
                  &nbsp;&nbsp;<span className="text-purple-400">let</span> l = 0;
                  <br />
                  &nbsp;&nbsp;<span className="text-purple-400">let</span> r = arr.length - 1;
                  <br />
                  &nbsp;&nbsp;<span className="text-purple-400">let</span> mid;
                  <br />
                  &nbsp;&nbsp;
                  <div className="inline-flex items-center">
                    <TextTypeMotion
                      text={["// 중간값 계산"]}
                      typingSpeed={100}
                      loop={true}
                      showCursor={true}
                      cursorCharacter="|"
                      className="text-zinc-600"
                      cursorClassName="text-green-500 bg-green-500"
                    />
                    {/* Mentor Cursor */}
                    <div className="flex items-end transition-all duration-300 ease-out"></div>
                  </div>
                  <br />
                  &nbsp;&nbsp;<span className="text-purple-400">while</span> (r &gt;= l) {"{"}
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;mid = l + Math.
                  <span className="text-blue-400">floor</span>
                  <div className="inline-flex items-center">
                    <TextTypeMotion
                      text={["((r - l) / 2);"]}
                      typingSpeed={100}
                      loop={true}
                      showCursor={true}
                      cursorCharacter="|"
                      className="text-zinc-600"
                      cursorClassName="text-blue-500 bg-blue-500"
                    />
                    {/* Mentee Cursor */}
                    <div className="flex items-end transition-all duration-300 ease-out"></div>
                  </div>
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">if</span> (arr[mid] == x)
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  <span className="text-purple-400">return</span> mid;
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">if</span> (arr[mid] &gt; x)
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;r = mid - 1;
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">else</span>
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;l = mid + 1;
                  <br />
                  &nbsp;&nbsp;{"}"}
                  <br />
                  &nbsp;&nbsp;<span className="text-purple-400">return</span> -1;
                  <br />
                  {"}"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
