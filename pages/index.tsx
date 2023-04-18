import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRef, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import DropDown, { VibeType } from "../components/DropDown";
import Footer from "../components/Footer";
import Github from "../components/GitHub";
import Header from "../components/Header";
import LoadingDots from "../components/LoadingDots";
import Turnstile from "react-turnstile";


const Home: NextPage = () => {
  const [loading, setLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [token, setToken] = useState("");
  const [bio, setBio] = useState("");
  const [vibe, setVibe] = useState<VibeType>("Happy");
  const [generatedBios, setGeneratedBios] = useState<String>("");

  const bioRef = useRef<null | HTMLDivElement>(null);

  const scrollToBios = () => {
    if (bioRef.current !== null) {
      bioRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };


  const prompt = `You are an AI-powered music recommender to analyze moods and suggest 3 personalized songs which does exist in real life for enhanced listening experiences. You give short answers.Each suggestion is in the form "(Band) - (Song Name)". Each suggestion starts with a *. User is feeling like :"${bio}" and the vibe is:"${vibe}"`;

  const generateBio = async (e: any) => {
    if (bio.length === 0) {
      toast.error("Please enter a bio");
      return;
    }

    if(bio.length > 100) {
      setBio(bio.slice(0, 100));
    }
    

    e.preventDefault();
    setGeneratedBios("");
    setLoading(true);

    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-turnstile-token": token,
      },
      body: JSON.stringify({
        prompt,
      }),
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }

    // This data is a ReadableStream
    const data = response.body;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      setGeneratedBios((prev) => prev + chunkValue);
    }
    scrollToBios();
    setIsDone(true);
    setLoading(false);
  };

  return (
    <div className="flex max-w-5xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
      <Head>
        <title>yourMelody</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 mt-12 sm:mt-20">
        
        <h1 className="sm:text-6xl text-4xl max-w-[708px] font-bold text-slate-900">
          Your Mood, Your Melody
        </h1>
        <p className="text-slate-500 mt-5">AI Suggested melodies</p>
        <p className="text-slate-500 mt-5">124 melodies found so far.</p>
        <div className="max-w-xl w-full">
          <div className="flex mt-10 items-center space-x-3">
            <Image
              src="/1-black.png"
              width={30}
              height={30}
              alt="1 icon"
              className="mb-5 sm:mb-0"
            />
            <p className="text-left font-medium">
              How do you feel?{" "}
              <span className="text-slate-500">
                (write a few sentences about how you feel)
              </span>
              .
            </p>
          </div>
          <textarea
            value={bio}
            onChange={(e) => {
              if (e.target.value.length > 100) {
                // crop bio
                setBio(e.target.value.slice(0, 100));
              }
              else{
                setBio(e.target.value)
              }
            }}
            rows={4}
            maxLength={100}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black my-5"
            placeholder={
              "e.g. Going through a tough breakup and need some comfort."
            }
          />
          <div className="flex mb-5 items-center space-x-3">
            <Image src="/2-black.png" width={30} height={30} alt="1 icon" />
            <p className="text-left font-medium">Select your vibe.</p>
          </div>
          <div className="block">
            <DropDown vibe={vibe} setVibe={(newVibe) => setVibe(newVibe)} />
          </div>
          <div className="grid place-items-center mt-5">
          <Turnstile
                sitekey={process.env.TURNSTILE_SITE_KEY ?? ""}
                onVerify={(token) => {
                  setToken( token);
                }}
            />
          </div>
          
          {!loading && !isDone && (
            <button
              className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-5 mt-4 hover:bg-black/80 w-full"
              onClick={(e) => generateBio(e)}
            >
              Find your melody &rarr;
            </button>
          )}

          {!loading && isDone && (
            <button
              className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-5 mt-4 hover:bg-black/80 w-full"
              onClick={(e) => {window.location.reload();}}
            >
              Find another melody &rarr;
            </button>
          )}
          {loading && (
            <button
              className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full"
              disabled
            >
              <LoadingDots color="white" style="large" />
            </button>
          )}

          


        </div>
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{ duration: 2000 }}
        />
        <hr className="h-px bg-gray-700 border-1 dark:bg-gray-700" />
        <div className="space-y-10 my-10">
          {generatedBios && (
            <>
              <div>
                <h2
                  className="sm:text-4xl text-3xl font-bold text-slate-900 mx-auto"
                  ref={bioRef}
                >
                  Your generated melodies
                </h2>
              </div>
              <div className="space-y-8 flex flex-col items-center justify-center max-w-xl mx-auto">
                {generatedBios
                  .substring(generatedBios.indexOf("*") + 1)
                  .split("*")
                  .map((generatedBio) => {
                    return (
                      <div
                        className="bg-white rounded-xl shadow-md p-4 hover:bg-gray-100 transition cursor-copy border"
                        onClick={() => {
                          navigator.clipboard.writeText(generatedBio);
                          toast("Melody copied to clipboard", {
                            icon: "✂️",
                          });
                        }}
                        key={generatedBio}
                      >
                        <p>{generatedBio}</p>
                      </div>
                    );
                  })}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
