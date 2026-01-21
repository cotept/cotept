import React from "react"

import { PulseBadge } from "@repo/shared/src/components/pulse-badge"
import { TextTypeMotion } from "@repo/shared/src/components/text-type-motion"

/**
 * LandingIDEPreview - 랜딩 페이지 IDE 미리보기 컴포넌트
 *
 * 이진 탐색 코드와 함께 IDE 느낌의 UI를 보여주는 컴포넌트
 * TextTypeMotion을 활용한 타이핑 애니메이션 포함
 */
export const LandingIDEPreview = () => {
  return (
    <div className="animate-float dark mx-auto max-w-5xl">
      <div className="border-static-editor-border bg-static-editor-bg relative rounded-2xl border p-4 shadow-2xl">
        {/* IDE 헤더 */}
        <div className="border-static-editor-border mb-4 flex items-center justify-between border-b pb-4">
          <div className="flex gap-2">
            <div className="bg-destructive h-3 w-3 rounded-full"></div>
            <div className="bg-warning h-3 w-3 rounded-full"></div>
            <div className="bg-success h-3 w-3 rounded-full"></div>
          </div>
          <PulseBadge variant={"success"}>세션 녹화 중</PulseBadge>
        </div>

        <div className="flex flex-col gap-6 md:flex-row">
          {/* Sidebar */}
          <div className="border-static-editor-border hidden w-48 flex-col gap-4 border-r pr-4 md:flex">
            <div className="bg-static-white/5 h-4 w-full rounded"></div>
            <div className="bg-static-white/5 h-4 w-3/4 rounded"></div>
            <div className="bg-static-white/5 h-4 w-1/2 rounded"></div>
          </div>

          {/* Code Editor with Line Numbers */}
          <div className="bg-static-editor-code-bg border-static-editor-border relative grow overflow-hidden rounded-xl border font-mono text-sm leading-relaxed">
            <div className="flex gap-4 p-6">
              {/* Line Numbers Column */}
              <div className="select-none text-right text-gray-600" aria-hidden="true">
                <div>01</div>
                <div>02</div>
                <div>03</div>
                <div>04</div>
                <div>05</div>
                <div>06</div>
                <div>07</div>
                <div>08</div>
                <div>09</div>
                <div>10</div>
                <div>11</div>
                <div>12</div>
                <div>13</div>
                <div>14</div>
                <div>15</div>
                <div>16</div>
                <div>17</div>
              </div>

              {/* Code Content */}
              <div className="flex-1 text-[#dbd7ca]">
                <span className="text-[#cb7676]">function</span> <span className="text-[#d4976c]">binarySearch</span>
                (arr, x) {"{"}
                <br />
                &nbsp;&nbsp;<span className="text-[#cb7676]">let</span> l = <span className="text-[#4c9a91]">0</span>;
                <br />
                &nbsp;&nbsp;<span className="text-[#cb7676]">let</span> r = arr.length -{" "}
                <span className="text-[#4c9a91]">1</span>;
                <br />
                &nbsp;&nbsp;<span className="text-[#cb7676]">let</span> mid;
                <br />
                &nbsp;&nbsp;
                <div className="inline-flex items-center">
                  <TextTypeMotion
                    text={["// 중간값 계산"]}
                    typingSpeed={100}
                    loop={true}
                    showCursor={true}
                    cursorCharacter="|"
                    className="text-[#758575]"
                    cursorClassName="text-[#758575] bg-[#758575]"
                  />
                </div>
                <br />
                &nbsp;&nbsp;<span className="text-[#cb7676]">while</span> (r &gt;= l) {"{"}
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;mid = l + Math.
                <span className="text-[#80a665]">floor</span>
                <div className="inline-flex items-center">
                  <TextTypeMotion
                    text={["((r - l) / 2);"]}
                    typingSpeed={100}
                    loop={true}
                    showCursor={true}
                    cursorCharacter="|"
                    className="text-[#dbd7ca]"
                    cursorClassName="text-[#dbd7ca] bg-[#dbd7ca]"
                  />
                </div>
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#cb7676]">if</span> (arr[mid] == x)
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span className="text-[#cb7676]">return</span> mid;
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#cb7676]">if</span> (arr[mid] &gt; x)
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;r = mid - <span className="text-[#4c9a91]">1</span>;
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#cb7676]">else</span>
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;l = mid + <span className="text-[#4c9a91]">1</span>;
                <br />
                &nbsp;&nbsp;{"}"}
                <br />
                &nbsp;&nbsp;<span className="text-[#cb7676]">return</span> -<span className="text-[#4c9a91]">1</span>;
                <br />
                {"}"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
