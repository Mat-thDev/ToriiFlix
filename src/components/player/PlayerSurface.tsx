import { Suspense, useState } from "react";
import { BufferingIndicator, Container, ErrorDialog, StatusAnnouncer } from "@videojs/react";
import { Video, VideoPlayer } from "@videojs/react/video";
import clsx from "clsx";


const PlayerSurface = ({ src, backgroundImage, autoPlay, muted, subtitles, className, children }: Player.PlayerSurfaceProps) => {

    const [isPlaying, setIsPlaying] = useState(false);

    return (
        <VideoPlayer>
            <Container
                className={clsx(
                    "overflow-hidden bg-base-300 [&>video]:size-full [&>video]:object-contain [&>video]:bg-black",
                    className,
                )}
            >
                {!isPlaying && backgroundImage && (
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${backgroundImage})` }}
                    >
                        <div className="absolute inset-0 bg-black/20" />
                    </div>
                )}

                <Suspense fallback={null}>
                    <Video
                        src={src}
                        autoPlay={autoPlay}
                        muted={muted}
                        playsInline
                        onPlay={() => setIsPlaying(true)}
                    >
                        {subtitles && subtitles.map((sub, index) => (
                            <track
                                key={sub.id || index}
                                kind="captions"
                                src={sub.url}
                                srcLang={sub.lang}
                                label={sub.name}
                            />
                        ))}
                    </Video>
                </Suspense>

                <div
                    className="pointer-events-none absolute right-6 bottom-6 z-1 text-xs font-bold tracking-[0.2em] text-base-content/20 uppercase"
                    aria-hidden
                >
                    ToriiFlix
                </div>

                <BufferingIndicator
                    className="pointer-events-none absolute inset-0 z-3 flex items-center justify-center"
                    render={(props, state) => (
                        <div {...props}>
                            <div
                                className="hidden size-14 animate-spin rounded-full border-4 border-base-content/25 border-t-primary data-visible:block"
                                data-visible={state.visible || undefined}
                            />
                        </div>
                    )}
                />
                <StatusAnnouncer />
                {children}
                <ErrorDialog.Root>
                    <ErrorDialog.Backdrop className="absolute inset-0 z-6 bg-base-300/60" />
                    <ErrorDialog.Popup className="absolute top-1/2 left-1/2 z-7 flex w-[min(24rem,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col gap-3 rounded-(--radius-box) border border-base-content/10 bg-base-200 p-5 text-base-content">
                        <ErrorDialog.Title />
                        <ErrorDialog.Description />
                        <ErrorDialog.Close className="flex items-center justify-center rounded-(--radius-field) p-2 text-base-content transition-colors hover:bg-base-content/10 hover:text-primary">
                            Fechar
                        </ErrorDialog.Close>
                    </ErrorDialog.Popup>
                </ErrorDialog.Root>
            </Container>
        </VideoPlayer>
    )
}


export default PlayerSurface;