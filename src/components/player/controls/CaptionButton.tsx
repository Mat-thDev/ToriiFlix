import { Menu, useCaptionsOptions } from "@videojs/react";
import { usePlayer } from "@videojs/react/video";
import { Check, Subtitles } from "lucide-react";
import { getSubtitleBlobUrl } from "../../../services/stremio/SubtitleService";

const CaptionButton = () => {
    const captions = useCaptionsOptions();
    const playerStore = usePlayer();

    if (captions?.state.availability !== "available") return null;

    const handleValueChange = async (value: string) => {
        if (value === "off") {
            captions.setValue(value);
            return;
        }
        ;
        if (!playerStore.target) {
            captions.setValue(value);
            return;
        }

        const textTracks = playerStore.textTrackList;
        const element = playerStore.target.media as HTMLVideoElement;
        const trackElements = element.querySelectorAll("track");

        for (let i = 0; i < textTracks.length; i++) {
            const textTrack = textTracks[i];

            const matchesValue =
                `track:${i}:${textTrack.kind}:${textTrack.language}:${textTrack.label}` === value ||
                textTrack.id === value ||
                textTrack.language === captions.options.find(opt => opt.value === value)?.value;

            if (matchesValue) {
                const trackElement = trackElements[i];
                if (trackElement) {
                    const originalSrc = trackElement.getAttribute("src");

                    if (originalSrc && !originalSrc.startsWith("blob:")) {
                        const blobUrl = await getSubtitleBlobUrl(originalSrc);

                        trackElement.setAttribute("src", blobUrl);
                    }
                }
                break;
            }
        }

        captions.setValue(value);
    };

    return (
        <Menu.Root side="top" align="center">
            <Menu.Trigger
                render={(props) => (
                    <button
                        {...props}
                        type="button"
                        className="flex size-11 items-center justify-center rounded-(--radius-field) p-0 text-base-content transition-colors hover:bg-base-content/10 hover:text-primary data-open:bg-base-content/10 data-open:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        aria-label={captions.label ?? "Legendas"}
                    >
                        <Subtitles className="size-7" />
                    </button>
                )}
            />

            <Menu.Popup className="z-50 mb-2 max-h-64 min-w-52 overflow-y-auto overflow-x-hidden rounded-(--radius-box) border border-base-content/10 bg-base-200/95 p-1.5 text-base-content shadow-2xl backdrop-blur-md transition-all animate-in fade-in zoom-in-95">
                <Menu.Content>
                    <Menu.RadioGroup
                        value={captions.value}
                        onValueChange={handleValueChange}
                        aria-label={captions.label}
                        className="flex flex-col gap-0.5"
                    >
                        {captions.options.map((option) => (
                            <Menu.RadioItem
                                key={option.value}
                                value={option.value}
                                disabled={option.disabled}
                                className="flex cursor-pointer items-center justify-between gap-3 rounded-(--radius-field) px-3 py-2 text-xs font-medium transition-colors hover:bg-base-content/10 data-disabled:pointer-events-none data-disabled:opacity-40 data-[state=checked]:font-bold data-[state=checked]:text-primary"
                            >
                                <span className="max-w-xs truncate">{option.label}</span>
                                {captions.value === option.value && (
                                    <Check className="size-4 shrink-0 text-primary" />
                                )}
                            </Menu.RadioItem>
                        ))}
                    </Menu.RadioGroup>
                </Menu.Content>
            </Menu.Popup>
        </Menu.Root>
    );
};

export default CaptionButton;