import supabase from "../../utils/supabase";
import { GetServerSideProps } from "next/types";
import { SimpleLayout } from "~/components/layout";
import dynamic from "next/dynamic";
import Head from "next/head";
import ArtistPage from "~/components/ArtistPage";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "@server/_app";
import prisma from "@utils/prisma";
import { getUser } from "@utils/firebaseAdmin";
import type { NextApiRequest } from "next/types";

export type ArtistSubmission = {
  name: string;
  description: string;
  bio: string;
  ArtistSubmissionsSocials: {
    imageUrl: string | null;
    spotifyUrl: string | null;
    twitterUrl: string | null;
    instagramUrl: string | null;
    geniusUrl: string | null;
  };
};

interface HomeProps {
  artistSubmission: ArtistSubmission;
  tracks: any[];
}

const Home = ({ artistSubmission, tracks }: HomeProps) => {
  const absoluteImageUrl = artistSubmission?.ArtistSubmissionsSocials?.imageUrl 
    ? new URL(artistSubmission.ArtistSubmissionsSocials.imageUrl, process.env.NEXT_PUBLIC_SITE_URL).toString()
    : `${process.env.NEXT_PUBLIC_SITE_URL}/default-profile.jpg`;

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
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_SITE_URL}/${artistSubmission?.name}`} />
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
        <link rel="canonical" href={`${process.env.NEXT_PUBLIC_SITE_URL}/${artistSubmission?.name}`} />
      </Head>

      <ArtistPage 
        artistSubmission={artistSubmission} 
        tracks={tracks} 
        absoluteImageUrl={absoluteImageUrl} 
      />
    </>
  );
};

export default Home;

Home.getLayout = (page: React.ReactNode) => <SimpleLayout artist>{page}</SimpleLayout>;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { query, req } = context;
  const artist = query.artist as string;

  if (!artist) {
    return {
      notFound: true
    };
  }

  try {
    // Get user authentication status
    const user = await getUser(req as NextApiRequest);

    // Initialize tRPC helpers
    const ssg = createServerSideHelpers({
      router: appRouter,
      ctx: {
        user,
        prisma,
        session: user ? "authenticated" : "unauthenticated",
      },
    });

    // Get artist data
    const { data: artistData, error: artistError } = await supabase
      .from("ArtistSubmissions")
      .select("*")
      .eq("uid", artist)
      .single();

    if (artistError) {
      return {
        notFound: true
      };
    }

    // Get tracks
    const { data: tracksData } = await supabase
      .from("Track")
      .select("*")
      .eq("artistSubmissionId", artist);

    // Get socials
    const { data: socialsData } = await supabase
      .from("ArtistSubmissionsSocials")
      .select("*")
      .eq("artistSubmissionId", artist)
      .single();

    if (socialsData) {
      artistData.ArtistSubmissionsSocials = socialsData;
    }

    return {
      props: {
        trpcState: ssg.dehydrate(),
        artistSubmission: artistData || null,
        tracks: tracksData || [],
        initialUser: user || null,
      }
    };
  } catch (error) {
    console.error("Server-side error:", error);
    return {
      props: {
        trpcState: {},
        artistSubmission: null,
        tracks: [],
        initialUser: null,
      }
    };
  }
};
