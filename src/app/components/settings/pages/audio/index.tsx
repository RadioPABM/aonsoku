import { LyricsSettings } from './lyrics'
import { PlaybackSettings } from './playback'
import { ReplayGainConfig } from './replay-gain'

export function Audio() {
  return (
    <div className="space-y-4">
      <PlaybackSettings />
      <ReplayGainConfig />
      <LyricsSettings />
    </div>
  )
}
