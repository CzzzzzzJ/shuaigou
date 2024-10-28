'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import ReactMarkdown from 'react-markdown'

export function TextInputDisplayComponent() {
  const [inputText, setInputText] = useState('')
  const [displayText, setDisplayText] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value)
  }

  const handleButtonClick = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('https://api.coze.cn/v1/workflow/stream_run', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer pat_T4KjokUbkD0ptMdny8QRyzCJGLSsUrIKZUb0qkvIIay3XmwKs9ngh6e9cwOdXW6d',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflow_id: "7430651988936196148",
          parameters: {
            user_id: "12345",
            BOT_USER_INPUT: inputText
          }
        })
      })

      if (!response.ok) {
        throw new Error('API request failed')
      }

      const reader = response.body?.getReader()
      let result = ''

      while (true) {
        const { done, value } = await reader?.read() || {}
        if (done) break
        result += new TextDecoder().decode(value)
      }

      const matches = result.match(/data: (.+)/)
      if (matches && matches[1]) {
        const jsonData = JSON.parse(matches[1])
        const content = JSON.parse(jsonData.content)
        setDisplayText(content.output)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Error:', error)
      setDisplayText('获取数据时出错，请稍后再试。')
    } finally {
      setIsLoading(false)
    }
  }

  const renderContent = (content: string) => {
    const lines = content.split('\n')
    const title = lines[0].replace(/^\*\*标题：\*\* /, '')
    const body = lines.slice(1).join('\n').replace(/^\*\*正文：\*\*\n/, '')

    return (
      <>
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <ReactMarkdown className="prose max-w-none">{body}</ReactMarkdown>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-3xl font-bold text-primary">帅狗抖音文案提取</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              placeholder="请输入抖音视频链接或关键词"
              className="flex-grow"
            />
            <button
              onClick={handleButtonClick}
              disabled={isLoading}
              className="group relative flex items-center justify-center px-4 py-2 bg-pink-300 text-black font-semibold cursor-pointer shadow-[2px_2px_0px_black] border-2 border-black rounded-xl overflow-hidden z-10 transition-all duration-200 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_black] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
            >
              <span className="relative z-20">
                {isLoading ? '提取中...' : '提取'}
              </span>
              <div className="absolute inset-0 bg-yellow-300 -z-10 transform scale-x-0 transition-transform duration-200 origin-left group-hover:scale-x-100"></div>
            </button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-inner min-h-[200px] max-h-[400px] overflow-auto border border-gray-200">
            {displayText ? (
              renderContent(displayText)
            ) : (
              <p className="text-gray-500 text-center">文案将在这里显示</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}