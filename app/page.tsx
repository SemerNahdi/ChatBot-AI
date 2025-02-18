"use client";
import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  X,
  MessageCircle,
  Send,
  Loader2,
  ArrowDownCircleIcon,
  Copy,
  Check,
} from "lucide-react";
import LandingSections from "@/components/LandingSections";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "@ai-sdk/react";

const MessageBubble = ({
  role,
  content,
}: {
  role: string;
  content: string;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`mb-4 ${role === "user" ? "text-right" : "text-left"}`}
    >
     <div
  className={`relative inline-block max-w-[85%] p-4 rounded-lg group ${
    role === "user"
      ? "bg-primary text-primary-foreground"
      : "bg-muted border border-gray-200"
  } transition-all duration-200 hover:shadow-md`}
>
  <ReactMarkdown
    children={content}
    remarkPlugins={[remarkGfm]}
    components={{
      code({ node, inline, className, children, ...props }) {
        return inline ? (
          <code
            {...props}
            className={`px-1 rounded ${
              role === "user" ? "bg-primary-foreground/20" : "bg-gray-200"
            }`}
          >
            {children}
          </code>
        ) : (
          <pre
            {...props}
            className={`p-2 rounded overflow-x-auto ${
              role === "user" ? "bg-primary-foreground/20" : "bg-gray-100"
            }`}
          >
            <code>{children}</code>
          </pre>
        );
      },
      ul: ({ children }) => <ul className="list-disc ml-4">{children}</ul>,
      ol: ({ children }) => <ol className="list-decimal ml-4">{children}</ol>,
    }}
  />
  
  {/* Copy button - Hidden by default, appears on hover */}
  <button
  onClick={handleCopy}
  className={`absolute top-2 ${
    role === "user" ? "-left-8" : "-right-8"
  } p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
>
  {copied ? (
    <Check className="h-4 w-6 text-green-600" />
  ) : (
    <Copy className="h-4 w-6 text-gray-600" />
  )}
</button>

</div>

    </motion.div>
  );
};

export default function Chat() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [shownChatIcon, setShowChatIcon] = useState(false);
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop,
    reload,
    error,
  } = useChat({
    api: "/api/gemini",
    initialMessages: [
      {
        id: "1",
        role: "assistant",
        content: "Hi there! 👋 How can I assist you today?",
      },
      // {
      //   id: "2",
      //   role: "assistant",
      //   content: "Feel free to ask me anything. I'm here to help!",
      // },
    ],
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setShowChatIcon(window.scrollY > 150);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col min-h-screen">
      <LandingSections />

      <AnimatePresence>
        {shownChatIcon && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <Button
              onClick={() => setIsChatOpen(!isChatOpen)}
              size="icon"
              className="rounded-full h-14 w-14 shadow-lg bg-blue-600 hover:bg-blue-700"
            >
              {isChatOpen ? (
                <ArrowDownCircleIcon className="h-6 w-6" />
              ) : (
                <MessageCircle className="h-6 w-6" />
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-20 right-4 z-50 w-[95%] md:w-[500px]"
          >
            <Card className="border-2 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
                <CardTitle className="text-lg font-semibold">
                  Chat with Noteworthy
                </CardTitle>
                <Button
                  onClick={() => setIsChatOpen(false)}
                  variant="ghost"
                  size="sm"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>

              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  {messages.length === 0 && (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      Start a conversation...
                    </div>
                  )}

                  {messages.map((message, index) => (
                    <MessageBubble
                      key={index}
                      role={message.role}
                      content={message.content}
                    />
                  ))}

                  {isLoading && (
                    <div className="flex items-center justify-center gap-3 p-4">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      <Button
                        variant="link"
                        onClick={stop}
                        className="text-destructive"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}

                  {error && (
                    <div className="flex items-center justify-center gap-3 p-4 text-destructive">
                      <span>An error occurred</span>
                      <Button variant="link" onClick={reload}>
                        Retry
                      </Button>
                    </div>
                  )}
                  <div ref={scrollRef} />
                </ScrollArea>
              </CardContent>

              <CardFooter>
                <form onSubmit={handleSubmit} className="flex w-full gap-4">
                  <Input
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    className="flex-1 p-4 h-12 text-lg"
                  />
                  <Button type="submit" size="icon" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
