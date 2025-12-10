'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface StoryModalProps {
  isOpen: boolean
  onComplete: () => void
  story: StoryContent
}

interface StoryContent {
  title: string
  subtitle?: string
  bossName: string
  bossEmoji: string
  panels: StoryPanel[]
  victoryText?: string
}

interface StoryPanel {
  text: string
  emoji?: string
  speaker?: 'narrator' | 'pockets' | 'boss'
  delay?: number
}

export const BOSS_STORIES: Record<string, StoryContent> = {
  gingerbread_golem_intro: {
    title: 'Cookie Forest',
    subtitle: 'Boss Battle',
    bossName: 'The Gingerbread Golem',
    bossEmoji: '🧑‍🍳',
    panels: [
      { 
        text: "Deep in Cookie Forest, where sugar plum trees grow tall...",
        emoji: "🌲",
        speaker: 'narrator'
      },
      {
        text: "...stands a creature of ancient dough and bitter frosting.",
        emoji: "🍪",
        speaker: 'narrator'
      },
      {
        text: "Pockets! You dare enter MY forest?",
        emoji: "😤",
        speaker: 'boss'
      },
      {
        text: "The Christmas Witch baked me to PROTECT these treats!",
        emoji: "🧙‍♀️",
        speaker: 'boss'
      },
      {
        text: "But centuries of loneliness... they changed me.",
        emoji: "😢",
        speaker: 'boss'
      },
      {
        text: "Now NO ONE shall taste the cookies of this forest!",
        emoji: "😈",
        speaker: 'boss'
      },
      {
        text: "*gulp* Okay big guy, let's dance!",
        emoji: "😅",
        speaker: 'pockets'
      },
      {
        text: "Match candies to break his armor! Different colors damage different pieces!",
        emoji: "💡",
        speaker: 'narrator'
      },
    ]
  },
  gingerbread_golem_victory: {
    title: 'Victory!',
    bossName: 'The Gingerbread Golem',
    bossEmoji: '🧑‍🍳',
    panels: [
      {
        text: "The Golem crumbles, his frosting armor shattering...",
        emoji: "💥",
        speaker: 'narrator'
      },
      {
        text: "Wait... I remember now...",
        emoji: "😮",
        speaker: 'boss'
      },
      {
        text: "The Witch... she didn't make me to hoard. She made me to SHARE.",
        emoji: "💭",
        speaker: 'boss'
      },
      {
        text: "Thank you, little raccoon. You've freed me from my bitter shell.",
        emoji: "🥹",
        speaker: 'boss'
      },
      {
        text: "Take these cookies to those who need them. The path to Candy Mountains is open.",
        emoji: "🗺️",
        speaker: 'boss'
      },
      {
        text: "Pockets gained: Gingerbread Guardian Badge! 🏅",
        emoji: "✨",
        speaker: 'narrator'
      },
      {
        text: "Yay! More treats to liberate!",
        emoji: "🦝",
        speaker: 'pockets'
      },
    ],
    victoryText: "Cookie Forest Complete! Candy Mountains Unlocked!"
  },
  queen_carmella_intro: {
    title: 'Candy Mountains',
    subtitle: 'Boss Battle',
    bossName: 'Queen Carmella',
    bossEmoji: '👸',
    panels: [
      {
        text: "Atop the highest peak of Candy Mountains...",
        emoji: "⛰️",
        speaker: 'narrator'
      },
      {
        text: "...rules a queen with a heart of pure rock candy.",
        emoji: "💎",
        speaker: 'narrator'
      },
      {
        text: "So, the little thief who defeated my Golem approaches.",
        emoji: "😏",
        speaker: 'boss'
      },
      {
        text: "I am Queen Carmella, and these sweets are MINE.",
        emoji: "👑",
        speaker: 'boss'
      },
      {
        text: "Your matching tricks won't work here, rodent.",
        emoji: "🍬",
        speaker: 'boss'
      },
      {
        text: "I'll stick you in place with my caramel!",
        emoji: "🍯",
        speaker: 'boss'
      },
      {
        text: "Push her back! Don't let her overwhelm you!",
        emoji: "💪",
        speaker: 'narrator'
      },
    ]
  },
  baron_von_cocoa_intro: {
    title: 'Cocoa Castle',
    subtitle: 'Final Boss',
    bossName: 'Baron Von Cocoa',
    bossEmoji: '🎩',
    panels: [
      {
        text: "The castle gates creak open, revealing rivers of molten chocolate...",
        emoji: "🏰",
        speaker: 'narrator'
      },
      {
        text: "At last, we meet. The infamous treat thief.",
        emoji: "🍫",
        speaker: 'boss'
      },
      {
        text: "I am Baron Von Cocoa. I've been expecting you.",
        emoji: "☕",
        speaker: 'boss'
      },
      {
        text: "For centuries, I've prepared this moment.",
        emoji: "⏰",
        speaker: 'boss'
      },
      {
        text: "Tonight, chocolate reigns supreme. Tonight... THE FLOOD RISES.",
        emoji: "🌊",
        speaker: 'boss'
      },
      {
        text: "Survive his rising cocoa flood! Match chocolate to push it back!",
        emoji: "⚠️",
        speaker: 'narrator'
      },
    ]
  },
  queen_carmella_victory: {
    title: 'Victory!',
    bossName: 'Queen Carmella',
    bossEmoji: '👸',
    panels: [
      {
        text: "Queen Carmella stumbles back, her candy crown cracking...",
        emoji: "💔",
        speaker: 'narrator'
      },
      {
        text: "Impossible! No one has ever pushed ME back!",
        emoji: "😱",
        speaker: 'boss'
      },
      {
        text: "Perhaps... perhaps I've held on too tightly.",
        emoji: "😔",
        speaker: 'boss'
      },
      {
        text: "These sweets were meant to bring joy, not to be hoarded.",
        emoji: "🍬",
        speaker: 'boss'
      },
      {
        text: "Go, little raccoon. The path to Cocoa Castle awaits.",
        emoji: "🗺️",
        speaker: 'boss'
      },
      {
        text: "But beware the Baron... he is not as easily swayed as I.",
        emoji: "⚠️",
        speaker: 'boss'
      },
      {
        text: "Pockets gained: Sugar Crown Fragment! 👑",
        emoji: "✨",
        speaker: 'narrator'
      },
    ],
    victoryText: "Candy Mountains Complete! Cocoa Castle Unlocked!"
  },
  baron_von_cocoa_victory: {
    title: 'FINAL VICTORY!',
    bossName: 'Baron Von Cocoa',
    bossEmoji: '🎩',
    panels: [
      {
        text: "The cocoa flood recedes... the Baron falls to his knees.",
        emoji: "🌊",
        speaker: 'narrator'
      },
      {
        text: "My flood... my beautiful, perfect flood...",
        emoji: "😭",
        speaker: 'boss'
      },
      {
        text: "For a hundred years I brewed it. For a hundred years I waited.",
        emoji: "⏳",
        speaker: 'boss'
      },
      {
        text: "And a RACCOON ruins everything!",
        emoji: "😤",
        speaker: 'boss'
      },
      {
        text: "Hey, I'm just here for the snacks, dude.",
        emoji: "😅",
        speaker: 'pockets'
      },
      {
        text: "*sigh* Perhaps... chocolate is better shared than flooded.",
        emoji: "🤔",
        speaker: 'boss'
      },
      {
        text: "The Christmas Witch's creations are free once more!",
        emoji: "🎄",
        speaker: 'narrator'
      },
      {
        text: "But something stirs in the shadows... a fourth world awaits.",
        emoji: "👁️",
        speaker: 'narrator'
      },
      {
        text: "Pockets gained: Baron's Monocle! 🧐",
        emoji: "🏆",
        speaker: 'narrator'
      },
    ],
    victoryText: "🎉 ALL WORLDS COMPLETE! You are the Ultimate Treat Thief! 🎉"
  }
}

export function StoryModal({ isOpen, onComplete, story }: StoryModalProps) {
  const [currentPanel, setCurrentPanel] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(true)

  const panel = story.panels[currentPanel]

  // Typewriter effect
  useEffect(() => {
    if (!isOpen) return
    
    setDisplayedText('')
    setIsTyping(true)
    
    let index = 0
    const text = panel.text
    
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.substring(0, index + 1))
        index++
      } else {
        setIsTyping(false)
        clearInterval(timer)
      }
    }, 30)

    return () => clearInterval(timer)
  }, [currentPanel, isOpen, panel.text])

  const handleNext = () => {
    if (isTyping) {
      // Skip to end of text
      setDisplayedText(panel.text)
      setIsTyping(false)
      return
    }

    if (currentPanel < story.panels.length - 1) {
      setCurrentPanel(prev => prev + 1)
    } else {
      setCurrentPanel(0)
      onComplete()
    }
  }

  const getSpeakerStyle = (speaker?: string) => {
    switch (speaker) {
      case 'pockets':
        return 'bg-blue-600 border-blue-400'
      case 'boss':
        return 'bg-red-700 border-red-500'
      default:
        return 'bg-purple-900/80 border-purple-500'
    }
  }

  const getSpeakerName = (speaker?: string) => {
    switch (speaker) {
      case 'pockets':
        return '🦝 Pockets'
      case 'boss':
        return `${story.bossEmoji} ${story.bossName}`
      default:
        return '📖 Narrator'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={handleNext}
        >
          <motion.div
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            className="max-w-lg w-full"
          >
            {/* Title */}
            <div className="text-center mb-6">
              <motion.h1
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-4xl font-black text-white drop-shadow-lg"
              >
                {story.title}
              </motion.h1>
              {story.subtitle && (
                <p className="text-yellow-300 font-bold mt-1">{story.subtitle}</p>
              )}
            </div>

            {/* Boss/Character Image */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="text-center mb-6"
            >
              <span className="text-8xl">{panel.emoji || story.bossEmoji}</span>
            </motion.div>

            {/* Dialog Box */}
            <motion.div
              className={`rounded-2xl p-6 border-4 ${getSpeakerStyle(panel.speaker)}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {/* Speaker name */}
              <div className="text-sm font-bold text-white/70 mb-2">
                {getSpeakerName(panel.speaker)}
              </div>

              {/* Text */}
              <p className="text-white text-xl font-medium leading-relaxed min-h-[60px]">
                {displayedText}
                {isTyping && <span className="animate-pulse">▌</span>}
              </p>

              {/* Progress */}
              <div className="flex justify-between items-center mt-4">
                <div className="flex gap-1">
                  {story.panels.map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i === currentPanel ? 'bg-yellow-400' : 
                        i < currentPanel ? 'bg-white/50' : 'bg-white/20'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-white/60 text-sm">
                  {isTyping ? 'Tap to skip' : 'Tap to continue'}
                </span>
              </div>
            </motion.div>

            {/* Victory text if present */}
            {story.victoryText && currentPanel === story.panels.length - 1 && !isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6 text-center"
              >
                <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white px-6 py-3 rounded-full font-black text-lg inline-block">
                  {story.victoryText}
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}