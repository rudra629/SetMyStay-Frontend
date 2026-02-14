"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from 'lucide-react';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactName: string | null;
}

interface Message {
    text: string;
    sender: 'user' | 'contact';
}

export function ChatModal({ isOpen, onClose, contactName }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === '') return;

    const userMessage: Message = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Simulate a reply
    setTimeout(() => {
        const reply: Message = { text: `Thanks for your message! I'll get back to you soon.`, sender: 'contact' };
        setMessages(prev => [...prev, reply]);
    }, 1000);
  };
  
  // Reset chat when the modal opens for a new contact
  useEffect(() => {
    if (isOpen) {
        setMessages([{ text: `You are now chatting with ${contactName}.`, sender: 'contact' }]);
    }
  }, [isOpen, contactName]);


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg flex flex-col h-[70vh]">
        <DialogHeader>
          <DialogTitle>Chat with {contactName || 'Contact'}</DialogTitle>
        </DialogHeader>
        <div className="flex-grow bg-muted/50 rounded-lg p-4 overflow-y-auto space-y-4">
            {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-4 py-2 rounded-lg ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
                        {msg.text}
                    </div>
                </div>
            ))}
        </div>
        <form onSubmit={handleSend} className="flex gap-2 items-center">
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
          />
          <Button type="submit" size="icon">
            <Send className="w-4 h-4"/>
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
