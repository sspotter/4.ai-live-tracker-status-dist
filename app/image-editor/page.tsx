'use client';

import React, { useState, useRef } from 'react';
import {
  Rocket,
  LayoutDashboard,
  Rss,
  BarChart,
  Settings,
  Image as ImageIcon,
  Upload,
  Wand2,
  Loader2,
  Download,
  ArrowLeft
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { GoogleGenAI } from '@google/genai';

export default function ImageEditor() {
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMimeType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResultImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!image || !prompt) return;
    setIsGenerating(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
      // Extract base64 data
      const base64Data = image.split(',')[1];
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          const imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${base64EncodeString}`;
          setResultImage(imageUrl);
          break;
        }
      }
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to edit image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#111318] text-slate-300 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1A1D24] border-r border-[#2A2E39] flex flex-col flex-shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <Rocket className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-white font-semibold text-lg leading-tight">AI Radar</h1>
            <p className="text-[11px] text-slate-400">Intelligence Dashboard</p>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          <NavItem icon={<LayoutDashboard className="w-4 h-4" />} label="Dashboard" href="/" />
          
          <div className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Tools
          </div>
          <NavItem icon={<ImageIcon className="w-4 h-4" />} label="Nano Banana App" active />
          <NavItem icon={<Rss className="w-4 h-4" />} label="Signal Feed" />
          <NavItem icon={<BarChart className="w-4 h-4" />} label="Analytics" />
          <NavItem icon={<Settings className="w-4 h-4" />} label="Settings" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <header>
            <h2 className="text-3xl font-semibold text-white tracking-tight flex items-center gap-3">
              <ImageIcon className="w-8 h-8 text-blue-500" />
              Nano Banana App
            </h2>
            <p className="text-slate-400 mt-1.5 text-sm">
              Use text prompts to edit images using Gemini 2.5 Flash Image.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Input */}
            <div className="space-y-6">
              <div className="bg-[#1A1D24] border border-[#2A2E39] rounded-xl p-6">
                <h3 className="text-lg font-medium text-white mb-4">1. Upload Image</h3>
                
                {!image ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#2A2E39] rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-[#2A2E39]/30 transition-colors"
                  >
                    <Upload className="w-8 h-8 text-slate-500 mb-3" />
                    <p className="text-sm text-slate-400">Click to upload an image</p>
                    <p className="text-xs text-slate-500 mt-1">JPEG, PNG, WEBP</p>
                  </div>
                ) : (
                  <div className="relative rounded-xl overflow-hidden bg-black/50 aspect-square flex items-center justify-center">
                    <Image src={image} alt="Original" fill className="object-contain" />
                    <button 
                      onClick={() => { setImage(null); setResultImage(null); }}
                      className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-lg backdrop-blur-sm transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>

              <div className="bg-[#1A1D24] border border-[#2A2E39] rounded-xl p-6">
                <h3 className="text-lg font-medium text-white mb-4">2. Edit Prompt</h3>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., Add a retro filter, Remove the person in the background..."
                  className="w-full bg-[#111318] border border-[#2A2E39] rounded-lg p-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 min-h-[120px] resize-none"
                />
                <button
                  onClick={handleGenerate}
                  disabled={!image || !prompt || isGenerating}
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-[#2A2E39] disabled:text-slate-500 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      Apply Edit
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column: Output */}
            <div className="bg-[#1A1D24] border border-[#2A2E39] rounded-xl p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">Result</h3>
                {resultImage && (
                  <a 
                    href={resultImage} 
                    download="edited-image.png"
                    className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                )}
              </div>
              
              <div className="flex-1 border border-[#2A2E39] rounded-xl bg-[#111318] flex items-center justify-center overflow-hidden relative min-h-[400px]">
                {isGenerating ? (
                  <div className="flex flex-col items-center gap-4 text-blue-500">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <p className="text-sm font-medium animate-pulse">AI is working its magic...</p>
                  </div>
                ) : resultImage ? (
                  <div className="relative w-full h-full">
                    <Image src={resultImage} alt="Edited" fill className="object-contain" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-slate-500">
                    <ImageIcon className="w-12 h-12 opacity-20" />
                    <p className="text-sm">Your edited image will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, badge, href }: { icon: React.ReactNode, label: string, active?: boolean, badge?: string, href?: string }) {
  const content = (
    <>
      <div className="flex items-center gap-3">
        {icon}
        {label}
      </div>
      {badge && (
        <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
          {badge}
        </span>
      )}
    </>
  );

  const className = `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-[#2A2E39] hover:text-white'}`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <div className={className}>
      {content}
    </div>
  );
}
