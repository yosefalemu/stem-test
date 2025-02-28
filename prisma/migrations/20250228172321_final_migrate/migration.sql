-- DropForeignKey
ALTER TABLE "Track" DROP CONSTRAINT "Track_raceId_fkey";

-- AlterTable
ALTER TABLE "Race" ADD COLUMN     "isExpired" BOOLEAN;

-- AlterTable
ALTER TABLE "Track" ADD COLUMN     "artistSubmissionId" TEXT,
ADD COLUMN     "isDemo" BOOLEAN,
ADD COLUMN     "isWinning" BOOLEAN,
ADD COLUMN     "playedTime" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "raceId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "UserLikes" ADD COLUMN     "artistSubmissionId" TEXT,
ADD COLUMN     "hidden" BOOLEAN,
ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "ArtistSubmissions" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "bio" TEXT,

    CONSTRAINT "ArtistSubmissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collaborator" (
    "id" SERIAL NOT NULL,
    "trackId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,

    CONSTRAINT "Collaborator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserShares" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "trackId" TEXT NOT NULL,

    CONSTRAINT "UserShares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPlayTime" (
    "id" SERIAL NOT NULL,
    "userId" TEXT,
    "trackId" TEXT NOT NULL,
    "playTime" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserPlayTime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RaceResults" (
    "id" SERIAL NOT NULL,
    "NftImageUrl" TEXT,
    "streamUrl" TEXT,
    "soundUrl" TEXT,
    "openSeaUrl" TEXT,
    "trackId" TEXT,
    "raceId" TEXT NOT NULL,

    CONSTRAINT "RaceResults_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArtistSubmissionsSocials" (
    "id" SERIAL NOT NULL,
    "imageUrl" TEXT,
    "spotifyUrl" TEXT,
    "twitterUrl" TEXT,
    "instagramUrl" TEXT,
    "geniusUrl" TEXT,
    "artistSubmissionId" TEXT NOT NULL,

    CONSTRAINT "ArtistSubmissionsSocials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Claim" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "raceId" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eligible" BOOLEAN NOT NULL,
    "claimed" BOOLEAN NOT NULL DEFAULT false,
    "tx" TEXT,
    "openseaUrl" TEXT,
    "tokenNumber" INTEGER,
    "etherscanUrl" TEXT,
    "soundUrl" TEXT,

    CONSTRAINT "Claim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokenTracker" (
    "id" SERIAL NOT NULL,
    "raceId" TEXT NOT NULL,
    "number" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TokenTracker_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ArtistSubmissions_uid_key" ON "ArtistSubmissions"("uid");

-- CreateIndex
CREATE INDEX "ArtistSubmissions_uid_idx" ON "ArtistSubmissions"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "UserShares_userId_trackId_key" ON "UserShares"("userId", "trackId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPlayTime_userId_trackId_key" ON "UserPlayTime"("userId", "trackId");

-- CreateIndex
CREATE UNIQUE INDEX "RaceResults_trackId_key" ON "RaceResults"("trackId");

-- CreateIndex
CREATE UNIQUE INDEX "RaceResults_raceId_key" ON "RaceResults"("raceId");

-- CreateIndex
CREATE UNIQUE INDEX "ArtistSubmissionsSocials_artistSubmissionId_key" ON "ArtistSubmissionsSocials"("artistSubmissionId");

-- CreateIndex
CREATE UNIQUE INDEX "Claim_uid_key" ON "Claim"("uid");

-- CreateIndex
CREATE INDEX "Claim_uid_idx" ON "Claim"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "TokenTracker_raceId_key" ON "TokenTracker"("raceId");

-- AddForeignKey
ALTER TABLE "ArtistSubmissions" ADD CONSTRAINT "ArtistSubmissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("auth_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_artistSubmissionId_fkey" FOREIGN KEY ("artistSubmissionId") REFERENCES "ArtistSubmissions"("uid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "Race"("uid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collaborator" ADD CONSTRAINT "Collaborator_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("auth_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLikes" ADD CONSTRAINT "UserLikes_artistSubmissionId_fkey" FOREIGN KEY ("artistSubmissionId") REFERENCES "ArtistSubmissions"("uid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserShares" ADD CONSTRAINT "UserShares_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserShares" ADD CONSTRAINT "UserShares_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("auth_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPlayTime" ADD CONSTRAINT "UserPlayTime_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPlayTime" ADD CONSTRAINT "UserPlayTime_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("auth_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaceResults" ADD CONSTRAINT "RaceResults_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("uid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaceResults" ADD CONSTRAINT "RaceResults_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "Race"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtistSubmissionsSocials" ADD CONSTRAINT "ArtistSubmissionsSocials_artistSubmissionId_fkey" FOREIGN KEY ("artistSubmissionId") REFERENCES "ArtistSubmissions"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "Race"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("auth_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenTracker" ADD CONSTRAINT "TokenTracker_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "Race"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;
