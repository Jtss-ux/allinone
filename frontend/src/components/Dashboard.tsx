'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ImageGenerator from './tools/ImageGenerator';
import VideoGenerator from './tools/VideoGenerator';
import AudioGenerator from './tools/AudioGenerator';
import ImageEditor from './tools/ImageEditor';
import ImageUpscaler from './tools/ImageUpscaler';
import ImageExtender from './tools/ImageExtender';
import BackgroundRemover from './tools/BackgroundRemover';
import SkinEnhancer from './tools/SkinEnhancer';
import SketchToImage from './tools/SketchToImage';
import IconGenerator from './tools/IconGenerator';
import SoundEffects from './tools/SoundEffects';
import MusicGenerator from './tools/MusicGenerator';
import DesignEditor from './tools/DesignEditor';
import ChangeCamera from './tools/ChangeCamera';
import MockupGenerator from './tools/MockupGenerator';
import SystemStatus from './tools/SystemStatus';
import Spaces from './tools/Spaces';
import VideoEditor from './tools/VideoEditor';
import ClipEditor from './tools/ClipEditor';
import VideoUpscaler from './tools/VideoUpscaler';
import LipSync from './tools/LipSync';
import DefaultTool from './tools/DefaultTool';
import PhotoEffects from './tools/PhotoEffects';
import PhotoEditor from './tools/PhotoEditor';
import MemeGenerator from './tools/MemeGenerator';
import IPTVPlayer from './tools/IPTVPlayer';
import ImageTool from './tools/ImageTool';
import FileConverter from './tools/FileConverter';
import TextToHandwriting from './tools/TextToHandwriting';
import QRCodeGenerator from './tools/QRCodeGenerator';
import DeveloperTools from './tools/DeveloperTools';
import Calculator from './tools/Calculator';
import UnitConverter from './tools/UnitConverter';
import ColorTools from './tools/ColorTools';
import PomodoroTimer from './tools/PomodoroTimer';
import PDFTools from './tools/PDFTools';
import Whiteboard from './tools/Whiteboard';
import WorldClock from './tools/WorldClock';
import GamesHub from './tools/GamesHub';
import SnakeGame from './tools/games/SnakeGame';
import TetrisGame from './tools/games/TetrisGame';
import ChessGame from './tools/games/ChessGame';
import JarvisAI from './tools/JarvisAI';
import Game2048 from './tools/Game2048';
import Notes from './tools/Notes';
import Calendar from './tools/Calendar';
import PasswordGenerator from './tools/PasswordGenerator';
import LoremIpsumGenerator from './tools/LoremIpsumGenerator';
import RegexTester from './tools/RegexTester';
import CodeGenerator from './tools/CodeGenerator';
import Translator from './tools/Translator';
import MarkdownEditor from './tools/MarkdownEditor';
import PPTGenerator from './tools/PPTGenerator';
import AIWriter from './tools/AIWriter';
import EmailWriter from './tools/EmailWriter';
import HashtagGenerator from './tools/HashtagGenerator';
import CSSGradientGenerator from './tools/CSSGradientGenerator';
import TypingSpeedTest from './tools/TypingSpeedTest';
import MediaExplorer from './tools/MediaExplorer';
import CyberChef from './tools/CyberChef';
import TextDiff from './tools/TextDiff';
import SpeedTest from './tools/SpeedTest';
import EXIFViewer from './tools/EXIFViewer';
import ImageCompressor from './tools/ImageCompressor';
import Pastebin from './tools/Pastebin';
import BreachChecker from './tools/BreachChecker';
import WaybackMachine from './tools/WaybackMachine';
import SelfHostingHub from './tools/SelfHostingHub';
import MediaHub from './tools/MediaHub';
import GamingDirectory from './tools/GamingDirectory';
import PrivacyHub from './tools/PrivacyHub';
import BusinessHub from './tools/BusinessHub';
import ConverterHub from './tools/ConverterHub';
import AIToolsDirectory from './tools/AIToolsDirectory';
import AwesomeLLMApps from './tools/AwesomeLLMApps';
import LogoGenerator from './tools/LogoGenerator';
import StoryWriter from './tools/StoryWriter';
import SEOGenerator from './tools/SEOGenerator';
import SocialPostGenerator from './tools/SocialPostGenerator';
import ResumeBuilder from './tools/ResumeBuilder';
import ImageAnalyzer from './tools/ImageAnalyzer';
import YouTubeSummarizer from './tools/YouTubeSummarizer';
import WebResearch from './tools/WebResearch';

interface DashboardProps {
  section: string;
  backendStatus: boolean;
  onSectionChange: (section: string) => void;
}

export default function Dashboard({ section, backendStatus, onSectionChange }: DashboardProps) {
  const renderTool = () => {
    switch (section) {
      // Main Hub
      case 'photo-effects':
        return <PhotoEffects />;
      case 'web-research':
        return <WebResearch />;
      case 'photo-editor':
        return <PhotoEditor />;
      case 'meme-generator':
        return <MemeGenerator />;
      case 'iptv-player':
        return <IPTVPlayer />;
      case 'image-tool':
        return <ImageTool />;
      case 'file-converter':
        return <FileConverter />;
      case 'text-handwriting':
        return <TextToHandwriting />;
      case 'qr-code':
        return <QRCodeGenerator />;
      case 'developer-tools':
        return <DeveloperTools />;
      case 'calculator':
        return <Calculator />;
      case 'unit-converter':
        return <UnitConverter />;
      case 'color-tools':
        return <ColorTools />;
      case 'pomodoro':
        return <PomodoroTimer />;
      case 'pdf-tools':
        return <PDFTools />;
      case 'whiteboard':
        return <Whiteboard />;
      case 'world-clock':
        return <WorldClock />;
      case 'games-hub':
        return <GamesHub />;
      case 'snake':
        return <SnakeGame />;
      case 'tetris':
        return <TetrisGame />;
      case 'chess':
        return <ChessGame />;
      case 'jarvis':
        return <JarvisAI />;
      case 'game-2048':
        return <Game2048 />;
      case 'notes':
        return <Notes />;
      case 'calendar':
        return <Calendar />;
      case 'password-generator':
        return <PasswordGenerator />;
      case 'lorem-ipsum':
        return <LoremIpsumGenerator />;
      case 'regex-tester':
        return <RegexTester />;
      case 'code-generator':
        return <CodeGenerator />;
      case 'translator':
        return <Translator />;
      case 'markdown-editor':
        return <MarkdownEditor />;
      case 'ppt-generator':
        return <PPTGenerator />;
      case 'ai-writer':
        return <AIWriter />;
      case 'email-writer':
        return <EmailWriter />;
      case 'hashtag-generator':
        return <HashtagGenerator />;
      case 'css-gradient':
        return <CSSGradientGenerator />;
      case 'typing-test':
        return <TypingSpeedTest />;
      case 'media-explorer':
        return <MediaExplorer />;
      case 'cyberchef':
        return <CyberChef />;
      case 'text-diff':
        return <TextDiff />;
      case 'speed-test':
        return <SpeedTest />;
      case 'exif-viewer':
        return <EXIFViewer />;
      case 'image-compressor':
        return <ImageCompressor />;
      case 'pastebin':
        return <Pastebin />;
      case 'breach-checker':
        return <BreachChecker />;
      case 'wayback-machine':
        return <WaybackMachine />;
      case 'self-hosting-hub':
        return <SelfHostingHub />;
      case 'media-hub':
        return <MediaHub />;
      case 'gaming-directory':
        return <GamingDirectory />;
      case 'privacy-hub':
        return <PrivacyHub />;
      case 'business-hub':
        return <BusinessHub />;
      case 'converter-hub':
        return <ConverterHub />;
      case 'ai-tools-directory':
        return <AIToolsDirectory />;
      case 'awesome-llm-apps':
        return <AwesomeLLMApps />;
      case 'logo-generator':
        return <LogoGenerator />;
      case 'story-writer':
        return <StoryWriter />;
      case 'seo-generator':
        return <SEOGenerator />;
      case 'social-post':
        return <SocialPostGenerator />;
      case 'resume-builder':
        return <ResumeBuilder />;
      case 'image-analyzer':
        return <ImageAnalyzer />;
      case 'youtube-summarizer':
        return <YouTubeSummarizer />;

      // Image tools
      case 'image-generator':
        return <ImageGenerator />;
      case 'image-editor':
        return <ImageEditor />;
      case 'image-upscaler':
        return <ImageUpscaler />;
      case 'image-extender':
        return <ImageExtender />;
      case 'bg-remover':
        return <BackgroundRemover />;
      case 'skin-enhancer':
        return <SkinEnhancer />;
      case 'sketch-to-image':
        return <SketchToImage />;
      case 'icon-generator':
        return <IconGenerator />;
      case 'variations':
        return <ImageEditor />;

      // Video tools
      case 'video-generator':
        return <VideoGenerator />;
      case 'video-editor':
        return <VideoEditor />;
      case 'clip-editor':
        return <ClipEditor />;
      case 'video-upscaler':
        return <VideoUpscaler />;
      case 'lip-sync':
        return <LipSync />;

      // Audio tools
      case 'voice-generator':
        return <AudioGenerator />;
      case 'sound-effects':
        return <SoundEffects />;
      case 'music-generator':
        return <MusicGenerator />;

      // Other tools
      case 'spaces':
        return <Spaces />;
      case 'design-editor':
        return <DesignEditor />;
      case 'mockup-generator':
        return <MockupGenerator />;
      case 'change-camera':
        return <ChangeCamera />;
      case 'system-status':
        return <SystemStatus />;

      default:
        return <DefaultTool toolName={section} />;
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-gray-950 border-b border-gray-800 p-4 xs:p-6 sm:p-8 tv:p-12 flex flex-col sm:flex-row justify-between items-start gap-6">
        <div>
          <h2 className="text-2xl xs:text-3xl sm:text-4xl tv:text-6xl font-black text-white capitalize tracking-tight">{section.replace(/-/g, ' ')}</h2>
          <p className="text-gray-400 mt-1 text-sm xs:text-base tv:text-2xl">
            {backendStatus ? '✅ Systems Protocol: Online' : '❌ Target Unreachable: Offline'}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-[10px] xs:text-xs tv:text-lg font-mono w-full sm:w-auto">
          <div className="bg-gray-900/50 backdrop-blur border border-gray-800 px-3 py-2 tv:px-6 tv:py-4 rounded-xl flex flex-col gap-1 min-w-[130px] tv:min-w-[220px]">
            <div className="flex justify-between gap-2">
              <span className="text-gray-500 uppercase tracking-tighter">AI Node:</span>
              <span className="text-green-500 font-bold">● Active</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-gray-500 uppercase tracking-tighter">Core:</span>
              <span className={backendStatus ? "text-green-500 font-bold" : "text-red-500 font-bold"}>
                ● {backendStatus ? 'Synced' : 'Error'}
              </span>
            </div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur border border-gray-800 px-3 py-2 tv:px-6 tv:py-4 rounded-xl flex flex-col gap-1 min-w-[130px] tv:min-w-[220px]">
            <div className="flex justify-between gap-2">
              <span className="text-gray-500 uppercase tracking-tighter">Mode:</span>
              <span className="text-blue-500 font-bold">Standard</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-gray-500 uppercase tracking-tighter">Assets:</span>
              <span className="text-purple-500 font-bold">Cached</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 xs:p-6 sm:p-8 lg:p-12 tv:p-24 bg-gray-900">
        <div className="max-w-[1400px] tv:max-w-[2400px] mx-auto h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={section}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {renderTool()}
          </motion.div>
        </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
