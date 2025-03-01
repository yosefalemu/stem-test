"use client";

import { PlayCircleIcon, PauseCircleIcon } from "@heroicons/react/20/solid";
import useWindowSize from "@hooks/use-window-size";
import * as Progress from "@radix-ui/react-progress";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { useFirebaseAuth } from "@utils/firebase";
import truncate from "lodash/truncate";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  MusicPlayerProvider,
  SortBy,
  SortDirection,
  useMusicPlayer,
} from "providers/MusicPlayerProvider";
import { useEffect, useState } from "react";
import Marquee from "react-fast-marquee";
import {
  BsXCircle,
  BsArrowUpCircle,
  BsThreeDots,
  BsTriangleFill,
} from "react-icons/bs";
import { OfferPopup } from "./OfferPopup";
import TestPlayerNew from "./TestPlayerNew";
import Header from "./soundRace/Header";
import HoverCardDemo from "./shared/HoverCard";
import { CopyLink, WebShare } from "./shared/share";
import type { ArtistSubmission } from "~/pages/[artist]";

function fmtMSS(s: number) {
  return (s - (s %= 60)) / 60 + (9 < s ? ":" : ":0") + s;
}

function getDuration(src: string): Promise<number> {
  return new Promise(function (resolve) {
    const audioEl = new Audio();
    audioEl.src = src;

    const preloadDuration = () => {
      if (window.trackDurations) {
        window.trackDurations[src] = Math.floor(audioEl.duration);
      }
      audioEl.removeEventListener("loadedmetadata", preloadDuration);
      resolve(Math.floor(audioEl.duration));
    };

    audioEl.addEventListener("loadedmetadata", preloadDuration);
  });
}

const Banner = ({ artistName }: { artistName?: string }) => {
  return (
    <div
      style={{
        background: "linear-gradient(129.85deg, #927FF5 14.55%, #6587FD 93.91%)",
        padding: "0.3rem",
        zIndex: 0,
      }}
      className="mb-2 font-bold text-lg flex items-center justify-center text-white relative rounded-md"
    >
      <Marquee gradient={false} speed={40}>
        <div className="flex gap-16">
          <div className="ml-16">
            Send a beat directly to {artistName || "the artist"}!
          </div>
          <div>Send a beat directly to {artistName || "the artist"}!</div>
          <div>Send a beat directly to {artistName || "the artist"}!</div>
          <div>Send a beat directly to {artistName || "the artist"}!</div>
          <div>Send a beat directly to {artistName || "the artist"}!</div>
        </div>
      </Marquee>
    </div>
  );
};

type TrackProps = {
  trackId: string;
  title: string;
  liked: boolean;
  audioSrc: string;
  artist?: string;
};

const Track = ({ trackId, title, liked, audioSrc, artist }: TrackProps) => {
  const [duration, setDuration] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const {
    getCurrentTrack,
    isPlaying,
    playPause,
    setTrack,
    toggleLike,
    play,
    shareTrack,
  } = useMusicPlayer();
  const { user } = useFirebaseAuth();
  const { isMobile } = useWindowSize();
  const router = useRouter();
  const trackIdFromLink = router.query?.trackid;

  useEffect(() => {
    if (audioSrc && window.trackDurations) {
      if (!window.trackDurations[audioSrc]) {
        getDuration(audioSrc).then((duration) => {
          setDuration(Number(duration));
        });
      } else {
        setDuration(window.trackDurations[audioSrc]);
      }
      if (trackIdFromLink === trackId) {
        setTrack(trackId);
        play();
      }
    }
  }, [duration, audioSrc]);

  return (
    <div className="border-b-2 border-gray-800/80 cursor-pointer">
      <div
        className="flex items-center px-2 py-2 w-full rounded-md hover:bg-vibrant/10"
        style={{
          background:
            trackId === getCurrentTrack()?.id
              ? "linear-gradient(129.85deg, #927FF5 14.55%, #6587FD 93.91%)"
              : "",
          animation:
            trackId === getCurrentTrack()?.id && isPlaying()
              ? "gradient 10s ease infinite"
              : "",
        }}
        onClick={() => setTrack(trackId)}
      >
        <div className="flex items-center w-full">
          <button
            className="cursor-pointer rounded-full md:hover:opacity-80"
            onClick={(e) => {
              e.stopPropagation();
              playPause(trackId);
            }}
          >
            {isPlaying() && trackId === getCurrentTrack()?.id ? (
              <PauseCircleIcon className="w-12 h-12 md:w-10 md:h-10" />
            ) : (
              <PlayCircleIcon className="w-12 h-12 md:w-10 md:h-10" />
            )}
          </button>
          <div className="ml-2 md:ml-4">
            <p className="text-lg md:text-sm select-none">
              {truncate(title, { length: isMobile ? 20 : 40 })}
            </p>
            <small className="text-xs">{artist}</small>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4">
          <div className="opacity-60 select-none text-xs md:text-sm">
            {fmtMSS(duration)}
          </div>
          <button
            className="md:hover:opacity-80"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(true);
              toggleLike(trackId);
            }}
          >
            {!liked || !user ? (
              <BsArrowUpCircle size={20} />
            ) : (
              <BsXCircle size={20} />
            )}
          </button>

          <HoverCardDemo
            message="options"
            body={
              <div className="flex gap-2">
                <OfferPopup trackId={trackId} shareTrack={shareTrack} />
                {isMobile ? (
                  <WebShare size={20} trackId={trackId} />
                ) : (
                  <div
                    onClick={() => shareTrack(trackId)}
                    className="flex items-center justify-center"
                  >
                    <CopyLink trackId={trackId} />
                  </div>
                )}
              </div>
            }
          >
            <div>
              <BsThreeDots />
            </div>
          </HoverCardDemo>
        </div>
      </div>
    </div>
  );
};

const Tracks = ({ tracks }: { tracks: any[] }) => {
  const [sortBy, setSortBy] = useState({
    base: SortBy.points,
    direction: SortDirection.desc,
  });
  const [isDemo, setIsDemo] = useState(false);

  const sortTracks = (tracksToSort: any[], base: string, direction: string) => {
    return [...tracksToSort].sort((a, b) => {
      if (direction === SortDirection.asc) {
        return a[base] - b[base];
      } else {
        return b[base] - a[base];
      }
    });
  };

  const getLikedTracks = () => {
    return sortTracks(
      tracks.filter((track) => track.liked && !track.isInspiration),
      sortBy.base,
      sortBy.direction
    );
  };

  const getUnInteractedTracks = () => {
    return sortTracks(
      tracks.filter(
        (track) => !track.liked && !track.isInspiration && !track.isDemo
      ),
      sortBy.base,
      sortBy.direction
    );
  };

  const getDemoTracks = () => {
    return tracks.filter((track) => track.isDemo && !track.isInspiration);
  };

  return (
    <div className="px-1 py-2 w-full my-2 pb-28 md:pb-16">
      <div className="flex flex-row justify-between flex-wrap">
        <TabsPrimitive.Root defaultValue={"submissions"}>
          <TabsPrimitive.List aria-label="filters" className="font-bold">
            <TabsPrimitive.Trigger
              value="submissions"
              className="px-2 mb-2 tab md:hover:opacity-80 text-gray-400"
              onClick={() => setIsDemo(false)}
            >
              Submissions
            </TabsPrimitive.Trigger>
          </TabsPrimitive.List>
        </TabsPrimitive.Root>

        <div className="flex flex-row items-center justify-center gap-4">
          {sortBy.base != SortBy.points ||
          sortBy.direction == SortDirection.desc ? (
            <span
              className={
                sortBy.base == SortBy.points
                  ? "text-xs cursor-pointer text-primary"
                  : "text-xs cursor-pointer"
              }
              onClick={() => {
                if (sortBy.base == SortBy.points)
                  setSortBy({
                    base: SortBy.points,
                    direction: SortDirection.asc,
                  });
                else
                  setSortBy({
                    base: SortBy.points,
                    direction: SortDirection.desc,
                  });
              }}
            >
              Most Popular
            </span>
          ) : (
            <span
              className={"text-xs cursor-pointer text-primary"}
              onClick={() =>
                setSortBy({
                  base: SortBy.points,
                  direction: SortDirection.desc,
                })
              }
            >
              Least Popular
            </span>
          )}

          {sortBy.base != SortBy.uploaded_at ||
          sortBy.direction == SortDirection.desc ? (
            <span
              className={
                sortBy.base == SortBy.uploaded_at
                  ? "text-xs cursor-pointer text-primary"
                  : "text-xs cursor-pointer"
              }
              onClick={() => {
                if (sortBy.base == SortBy.uploaded_at)
                  setSortBy({
                    base: SortBy.uploaded_at,
                    direction: SortDirection.asc,
                  });
                else
                  setSortBy({
                    base: SortBy.uploaded_at,
                    direction: SortDirection.desc,
                  });
              }}
            >
              Newest First
            </span>
          ) : (
            <span
              className={"text-xs cursor-pointer text-primary"}
              onClick={() =>
                setSortBy({
                  base: SortBy.uploaded_at,
                  direction: SortDirection.desc,
                })
              }
            >
              Oldest First
            </span>
          )}

          <span>
            {sortBy.direction == SortDirection.asc ? (
              <BsTriangleFill
                className="cursor-pointer"
                size={12}
                onClick={() =>
                  setSortBy({
                    base: sortBy.base,
                    direction: SortDirection.desc,
                  })
                }
              />
            ) : (
              <BsTriangleFill
                size={12}
                className="rotate-180 cursor-pointer"
                onClick={() =>
                  setSortBy({ base: sortBy.base, direction: SortDirection.asc })
                }
              />
            )}
          </span>
        </div>
      </div>
      {isDemo ? (
        <>
          {getDemoTracks()?.map((track) => (
            <Track
              audioSrc={track.url}
              liked={track.liked}
              title={track.name}
              trackId={track.id}
              artist={track.artist}
              key={`track-${track.id}`}
            />
          ))}
        </>
      ) : (
        <>
          {getLikedTracks()?.map((track) => (
            <Track
              audioSrc={track.url}
              liked={track.liked}
              title={track.name}
              trackId={track.id}
              artist={track.artist}
              key={`track-${track.id}`}
            />
          ))}
          {getUnInteractedTracks()?.map((track) => (
            <Track
              audioSrc={track.url}
              liked={track.liked}
              title={track.name}
              trackId={track.id}
              artist={track.artist}
              key={`track-${track.id}`}
            />
          ))}
        </>
      )}
    </div>
  );
};

interface ArtistPageProps {
  artistSubmission: ArtistSubmission;
  tracks: any[];
  absoluteImageUrl: string;
}

const ArtistPage = ({ artistSubmission, tracks, absoluteImageUrl }: ArtistPageProps) => {
  const router = useRouter();
  const { artist } = router.query;
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    window.tracks = {};
    window.trackPeaks = {};
    window.trackDurations = {};
    setRendered(true);
  }, []);

  return (
    <>
      <Head>
        <title>{artistSubmission?.name || "Artist"} on Stems</title>
        
        {/* Essential Meta Tags */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#927FF5" />
        
        {/* Primary Meta Tags */}
        <meta name="title" content={`${artistSubmission?.name || "Artist"} on Stems`} />
        <meta name="description" content={artistSubmission?.description || artistSubmission?.bio || `Send beats directly to ${artistSubmission?.name || 'the artist'} on Stems`} />
        
        {/* Open Graph / Facebook / WhatsApp */}
        <meta property="og:type" content="profile" />
        <meta property="og:site_name" content="Stems" />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_SITE_URL}/${artist}`} />
        <meta property="og:title" content={`${artistSubmission?.name || "Artist"} on Stems`} />
        <meta property="og:description" content={artistSubmission?.description || artistSubmission?.bio || `Send beats directly to ${artistSubmission?.name || 'the artist'} on Stems`} />
        <meta property="og:image" content={absoluteImageUrl} />
        <meta property="og:image:width" content="600" />
        <meta property="og:image:height" content="400" />
        <meta property="og:image:alt" content={`${artistSubmission?.name || "Artist"}'s profile on Stems`} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:locale" content="en_US" />
        
        {/* Profile specific */}
        <meta property="profile:username" content={artistSubmission?.name} />
        <meta property="profile:first_name" content={artistSubmission?.name?.split(" ")[0]} />
        <meta property="profile:last_name" content={artistSubmission?.name?.split(" ")[1]} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@stems" />
        <meta name="twitter:creator" content="@stems" />
        <meta name="twitter:title" content={`${artistSubmission?.name || "Artist"} on Stems`} />
        <meta name="twitter:description" content={artistSubmission?.description || artistSubmission?.bio || `Send beats directly to ${artistSubmission?.name || 'the artist'} on Stems`} />
        <meta name="twitter:image" content={absoluteImageUrl} />
        
        {/* SEO */}
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <link rel="canonical" href={`${process.env.NEXT_PUBLIC_SITE_URL}/${artist}`} />
      </Head>
      
      {rendered && artistSubmission && (
        <MusicPlayerProvider
          id={artist as string}
          isArtistSubmissions
          tracks={tracks || []}
        >
          <>
            <Banner artistName={artistSubmission.name} />
            <Header
              id={artist as string}
              name={artistSubmission.name}
              description={artistSubmission.description}
              socials={{
                imageUrl: artistSubmission.ArtistSubmissionsSocials?.imageUrl || null,
                spotifyUrl: artistSubmission.ArtistSubmissionsSocials?.spotifyUrl || null,
                twitterUrl: artistSubmission.ArtistSubmissionsSocials?.twitterUrl || null,
                instagramUrl: artistSubmission.ArtistSubmissionsSocials?.instagramUrl || null,
                geniusUrl: artistSubmission.ArtistSubmissionsSocials?.geniusUrl || null,
              }}
              bio={artistSubmission.bio}
            />
            <Tracks tracks={tracks || []} />
            <TestPlayerNew />
          </>
        </MusicPlayerProvider>
      )}
    </>
  );
};

export default ArtistPage; 