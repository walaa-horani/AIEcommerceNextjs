"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Loader2, X, MessageCircle } from "lucide-react";
import { DefaultChatTransport } from "ai";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";

export function Chat() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    const { messages, sendMessage, status } = useChat({
        transport: new DefaultChatTransport({
            api: "/api/chat",
        }),
    });

    const isLoading = status === "submitted" || status === "streaming";

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        sendMessage({
            text: input,
        });
        setInput("");
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {!isOpen ? (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="h-14 w-14 rounded-full shadow-2xl bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-110"
                >
                    <MessageCircle className="h-6 w-6 text-white" />
                </Button>
            ) : (
                <div className="flex flex-col w-[380px] h-[550px] bg-background border border-border rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 animate-in slide-in-from-bottom-5">
                    {/* Header */}
                    <div className="p-4 bg-primary text-primary-foreground flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                            <h3 className="font-semibold tracking-tight">AI Order Support</h3>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsOpen(false)}
                            className="hover:bg-primary-foreground/10 text-primary-foreground h-8 w-8"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Messages */}
                    <ScrollArea ref={scrollRef} className="flex-1 p-4">
                        <div className="space-y-4">
                            {messages.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-60 px-6 py-12">
                                    <Bot className="h-10 w-10 mb-2" />
                                    <p className="text-sm">Hello! I'm your order assistant. Ask me about your purchases!</p>
                                    <div className="text-xs text-muted-foreground space-y-1 pt-2">
                                        <p>Try:</p>
                                        <p>"Show my orders"</p>
                                        <p>"Order status?"</p>
                                    </div>
                                </div>
                            )}

                            {messages.map((m) => (
                                <div
                                    key={m.id}
                                    className={cn(
                                        "flex items-start gap-2",
                                        m.role === "user" ? "flex-row-reverse" : "flex-row"
                                    )}
                                >
                                    <div className={cn(
                                        "p-1.5 rounded-lg shrink-0",
                                        m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted shadow-sm"
                                    )}>
                                        {m.role === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                                    </div>
                                    <div className={cn(
                                        "max-w-[80%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap",
                                        m.role === "user"
                                            ? "bg-primary text-primary-foreground rounded-tr-none"
                                            : "bg-muted border border-border rounded-tl-none"
                                    )}>
                                        {m.parts.map((part, i) => {
                                            if (part.type === "text") {
                                                return <span key={i}>{part.text}</span>;
                                            }
                                            return null;
                                        })}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    <span className="text-xs">Checking orders...</span>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Input */}
                    <form
                        onSubmit={handleSubmit}
                        className="p-4 border-t border-border flex gap-2 bg-background"
                    >
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about orders..."
                            className="flex-1 bg-background border-border/50 focus:border-primary transition-all text-sm h-9"
                            disabled={isLoading}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={isLoading || !input?.trim()}
                            className="h-9 w-9"
                        >
                            <Send className="h-3.5 w-3.5" />
                        </Button>
                    </form>
                </div>
            )}
        </div>
    );
}