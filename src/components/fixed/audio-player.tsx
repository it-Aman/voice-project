"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { IAudio, ISegment } from "@/models/audio.model"

interface AudioPlayerProps {
  url: string,
  startTime: number,
  endTime: number
}

function formatTime(timeInSeconds: number) {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  const paddedSeconds = String(seconds).padStart(2, '0');
  return `${minutes}:${paddedSeconds}`;
}

export default function AudioPlayer({
  url,
  startTime,
  endTime
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [value, setValue] = React.useState(0);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  
  const duration = endTime - startTime
  React.useEffect(()=>{
    console.log('value changed', value)
  }, [value]);

  React.useEffect(() => {
    // Initialize the audio element here
    audioRef.current = new Audio(url);
    audioRef.current.currentTime = startTime;

    // Add event listeners or other initialization code here if needed

    return () => {
      // Clean up the audio element if the component is unmounted
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Play or pause the audio when isPlaying changes
  React.useEffect(() => {
    if (isPlaying) {
      if(Number(audioRef.current?.currentTime || startTime)  < endTime) {
        audioRef?.current?.play();
      }
    } else {
      audioRef?.current?.pause();
    }
  }, [isPlaying]);

  // Update slider value based on audio time
  React.useEffect(() => {
  const interval = setInterval(() => {
    if (audioRef.current) {
      const currentTime = audioRef.current.currentTime - startTime;
      const newDuration = endTime - startTime;

      if(currentTime >= newDuration) {
        setIsPlaying(false);
      }

      // Ensure the value is calculated based on the current segment's duration
      if (newDuration > 0) {
        const newValue = currentTime / newDuration;
        setValue(newValue);
      }
    }
  }, 1000);

  return () => clearInterval(interval);
}, [startTime, endTime]);

  const handleSliderChange = (values: number[]) => {
    let newValue = values[0];

    setValue(newValue);

    const newTime = duration * newValue;
    if (audioRef?.current?.currentTime) {
      audioRef.current.currentTime = startTime + newTime;
    }
  };

  return (
    <div className="grid gap-2 pt-2">
      <div className="grid gap-4">
        <div className="grid gap-3">
          <Slider
            id="audio-slider"
            max={1}
            value={[value]}
            step={0.01}
            onValueChange={handleSliderChange}
            className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
            aria-label="Audio Progress"
          />
          <Button onClick={() => setIsPlaying(!isPlaying)} type="button">
            {isPlaying ? "Pause" : "Play"}
          </Button>
        </div>
        
      </div>
    </div>
  );
}
