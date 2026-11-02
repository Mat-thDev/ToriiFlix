import { type CSSProperties } from "react";
import { TimeSlider } from "@videojs/react";
import Timestamp from "./Timestamp";

const SeekBar = () => {

  return (
    <div className="relative flex w-full flex-col justify-center">
      <div className="flex w-full items-center gap-2">
        <Timestamp type="current" />

        <TimeSlider.Root
          className="group relative flex h-6 w-full items-center pointer-events-auto"
          disabled={false}
        >
          <div
            className="absolute inset-0 flex items-center [clip-path:inset(0_calc(100%-var(--media-slider-chapter-end))_0_var(--media-slider-chapter-start))]"
            style={
              {
                "--media-slider-chapter-start": "0%",
                "--media-slider-chapter-end": "100%",
              } as CSSProperties
            }
          >
            <TimeSlider.Track className="absolute inset-x-0 h-[0.3rem] overflow-hidden rounded-full bg-base-content/25 transition-[height] group-data-highlighted:h-2.5">
              <TimeSlider.Buffer className="absolute inset-y-0 left-0 w-(--media-slider-buffer) bg-base-content/35" />
              <TimeSlider.Fill className="absolute inset-y-0 left-0 w-(--media-slider-fill) bg-primary" />
            </TimeSlider.Track>
          </div>

          <TimeSlider.Thumb className="absolute top-1/2 left-(--media-slider-fill) size-3.5 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full border-2 border-primary bg-base-content transition-transform group-data-interactive:scale-100 group-data-dragging:left-(--media-slider-pointer) group-data-dragging:scale-110" />

          <TimeSlider.Preview className="pointer-events-none absolute bottom-full left-(--media-slider-pointer) mb-2 -translate-x-1/2 rounded-(--radius-field) border border-base-content/10 bg-base-200/90 px-2 py-1 text-xs font-bold tracking-wider whitespace-nowrap text-base-content opacity-0 backdrop-blur-sm transition-opacity group-data-pointing:opacity-100 group-focus-visible:opacity-100">
            <TimeSlider.Value type="pointer" />
          </TimeSlider.Preview>
        </TimeSlider.Root>

        <Timestamp type="duration" />
      </div>
    </div>
  );
};

export default SeekBar;
