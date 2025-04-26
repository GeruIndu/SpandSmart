"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import Image from "next/image";
import { useEffect, useRef } from "react";


const HeroSection = () => {

    const imageRef = useRef();

    useEffect(() => {
        const imageElement = imageRef.current;

        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            const scrollThreshold = 100;

            if (scrollPosition > scrollThreshold) {
                imageElement.classList.add("scrolled");
            }
            else
                imageElement.classList.remove("scrolled");
        }

        window.addEventListener('scroll', handleScroll);

        return () => window.addEventListener("scroll", handleScroll);
    }, [])

    return (
        <div className="pb-20 px-4">
            <div className="container mx-auto text-center">
                <h1 className="text-4xl md:text-8xl lg:text-[80px] pb-6 gradient-title">
                    Intelligent Insights for <br /> Smarter Spending
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                    Your money deserves better. With real-time analytics and intelligent tracking, we're giving you the tools to understand, grow, and master your finances like never before.
                </p>

                <div className="flex justify-center space-x-4">
                    <Link href={'/dashboard'}>
                        <Button size={'lg'} className={'px-8'}>Get Started</Button>
                    </Link>
                    <Link href={'https://www.youtube.com/'}>
                        <Button size={'lg'} variant={'outline'} className={'px-8'}>Watch Demo</Button>
                    </Link>
                </div>
                <div className="hero-image-wrapper">
                    <div ref={imageRef} className="hero-image">
                        <Image
                            src={'/banner.jpeg'}
                            width={1280}
                            height={720}
                            alt="dashboard preview"
                            className="w-4/5 rounded-md shadow-2xl border mx-auto"
                            priority
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HeroSection