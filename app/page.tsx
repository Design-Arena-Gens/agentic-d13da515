'use client'

import { useState } from 'react'

interface Scene {
  id: number
  title: string
  prompt: string
  imageUrl?: string
  status: 'pending' | 'generating' | 'completed' | 'error'
}

const predefinedScenes: Omit<Scene, 'id' | 'status'>[] = [
  {
    title: 'Scene 1: Spaceship Approaching Earth',
    prompt: 'Cinematic shot of a massive alien spaceship emerging from deep space, approaching Earth. The spacecraft has bioluminescent lights, organic metallic design. Earth visible in background with stars. Photorealistic, 8K, dramatic lighting, sci-fi movie style.'
  },
  {
    title: 'Scene 2: Entering Earth\'s Atmosphere',
    prompt: 'Epic aerial view of alien spacecraft entering Earth\'s atmosphere, creating glowing plasma trails. Clouds parting, sunset lighting, golden hour. The ship is sleek and mysterious. Cinematic, IMAX quality, volumetric lighting.'
  },
  {
    title: 'Scene 3: Landing in Desert',
    prompt: 'Dramatic landing scene of alien spaceship touching down in vast desert landscape. Dust clouds rising, sand swirling. The craft hovers just above ground with anti-gravity effects. Orange desert sunset, cinematic composition, epic scale.'
  },
  {
    title: 'Scene 4: Alien Emergence',
    prompt: 'Mysterious alien beings emerging from the spacecraft. Tall, elegant humanoid figures with bioluminescent features, advanced technology. Cinematic lighting with backlight creating silhouettes. Photorealistic, otherworldly, peaceful encounter.'
  },
  {
    title: 'Scene 5: First Contact',
    prompt: 'Cinematic wide shot showing humans and aliens meeting for first time. Desert landscape at dusk, dramatic lighting. Sense of wonder and historic moment. Both species approaching with curiosity. Movie-quality cinematography, emotional lighting.'
  }
]

export default function Home() {
  const [scenes, setScenes] = useState<Scene[]>(
    predefinedScenes.map((scene, index) => ({
      ...scene,
      id: index + 1,
      status: 'pending' as const
    }))
  )
  const [currentScene, setCurrentScene] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)

  const generateImage = async (sceneId: number) => {
    const scene = scenes.find(s => s.id === sceneId)
    if (!scene) return

    setScenes(prev => prev.map(s =>
      s.id === sceneId ? { ...s, status: 'generating' as const } : s
    ))

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: scene.prompt })
      })

      if (!response.ok) {
        throw new Error('Failed to generate image')
      }

      const data = await response.json()

      setScenes(prev => prev.map(s =>
        s.id === sceneId
          ? { ...s, status: 'completed' as const, imageUrl: data.imageUrl }
          : s
      ))
    } catch (error) {
      console.error('Error generating image:', error)
      setScenes(prev => prev.map(s =>
        s.id === sceneId ? { ...s, status: 'error' as const } : s
      ))
    }
  }

  const generateAllScenes = async () => {
    setIsGenerating(true)
    for (let i = 0; i < scenes.length; i++) {
      setCurrentScene(i)
      await generateImage(scenes[i].id)
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    setIsGenerating(false)
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-transparent bg-clip-text">
            👽 Alien Earth Arrival
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            AI-Generated Cinematic Story
          </p>
          <p className="text-sm text-gray-400">
            Using advanced AI to visualize aliens arriving on Earth
          </p>
        </div>

        {/* Generate All Button */}
        <div className="text-center mb-8">
          <button
            onClick={generateAllScenes}
            disabled={isGenerating}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-4 rounded-lg font-semibold text-lg glow transition-all"
          >
            {isGenerating ? (
              <span className="flex items-center gap-3">
                <div className="loading-spinner"></div>
                Generating Scene {currentScene + 1}/{scenes.length}...
              </span>
            ) : (
              '🎬 Generate Complete Story'
            )}
          </button>
        </div>

        {/* Scenes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {scenes.map((scene) => (
            <div key={scene.id} className="scene-card p-6 rounded-xl">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-indigo-300">
                  {scene.title}
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  scene.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                  scene.status === 'generating' ? 'bg-yellow-500/20 text-yellow-300' :
                  scene.status === 'error' ? 'bg-red-500/20 text-red-300' :
                  'bg-gray-500/20 text-gray-300'
                }`}>
                  {scene.status === 'completed' ? '✓ Done' :
                   scene.status === 'generating' ? '⏳ Generating' :
                   scene.status === 'error' ? '✗ Error' :
                   '○ Pending'}
                </span>
              </div>

              <p className="text-sm text-gray-400 mb-4 line-clamp-3">
                {scene.prompt}
              </p>

              <div className="video-container mb-4">
                {scene.status === 'generating' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="loading-spinner"></div>
                  </div>
                )}
                {scene.imageUrl && scene.status === 'completed' && (
                  <img src={scene.imageUrl} alt={scene.title} />
                )}
                {scene.status === 'pending' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <span className="text-gray-500">Not generated yet</span>
                  </div>
                )}
                {scene.status === 'error' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-900/20">
                    <span className="text-red-400">Generation failed</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => generateImage(scene.id)}
                disabled={scene.status === 'generating' || isGenerating}
                className="w-full bg-indigo-600/50 hover:bg-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-medium transition-all"
              >
                {scene.status === 'generating' ? 'Generating...' : 'Generate This Scene'}
              </button>
            </div>
          ))}
        </div>

        {/* Info Footer */}
        <div className="mt-12 text-center text-gray-400 text-sm">
          <p className="mb-2">
            🎥 This app creates a cinematic story of aliens arriving on Earth
          </p>
          <p>
            Powered by AI image generation • Each scene takes ~10-30 seconds
          </p>
        </div>
      </div>
    </main>
  )
}
