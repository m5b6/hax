"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface Slide {
    id: string;
    component: React.ReactNode;
}

interface SlidePresentationProps {
    slides: Slide[];
    onComplete?: () => void;
    showControls?: boolean;
}

export function SlidePresentation({
    slides,
    onComplete,
    showControls = true
}: SlidePresentationProps) {
    const [currentSlide, setCurrentSlide] = useState(0);

    const goToNextSlide = useCallback(() => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(prev => prev + 1);
        } else if (onComplete) {
            onComplete();
        }
    }, [currentSlide, slides.length, onComplete]);

    const goToPrevSlide = useCallback(() => {
        if (currentSlide > 0) {
            setCurrentSlide(prev => prev - 1);
        }
    }, [currentSlide]);

    const goToSlide = useCallback((index: number) => {
        if (index >= 0 && index < slides.length) {
            setCurrentSlide(index);
        }
    }, [slides.length]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") {
                e.preventDefault();
                goToNextSlide();
            } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                goToPrevSlide();
            } else if (e.key >= "0" && e.key <= "9") {
                const slideNum = parseInt(e.key);
                if (slideNum <= slides.length) {
                    goToSlide(slideNum === 0 ? 9 : slideNum - 1);
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [goToNextSlide, goToPrevSlide, goToSlide, slides.length]);

    return (
        <div className="slide-presentation">
            <AnimatePresence mode="wait">
                <motion.div
                    key={slides[currentSlide].id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="slide-content"
                    onClick={goToNextSlide}
                >
                    {slides[currentSlide].component}
                </motion.div>
            </AnimatePresence>

            {showControls && (
                <>
                    {/* Slide indicators */}
                    <div className="slide-indicators">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                className={`slide-indicator ${index === currentSlide ? "active" : ""}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    goToSlide(index);
                                }}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>

                    {/* Navigation arrows */}
                    {currentSlide > 0 && (
                        <button
                            className="slide-nav slide-nav-prev"
                            onClick={(e) => {
                                e.stopPropagation();
                                goToPrevSlide();
                            }}
                            aria-label="Previous slide"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M15 18l-6-6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    )}

                    <button
                        className="slide-nav slide-nav-next"
                        onClick={(e) => {
                            e.stopPropagation();
                            goToNextSlide();
                        }}
                        aria-label={"Next slide"}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M9 18l6-6-6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </>
            )}

            <style jsx>{`
                .slide-presentation {
                    position: fixed;
                    inset: 0;
                    background: #000;
                    overflow: hidden;
                    z-index: 9999;
                }

                .slide-content {
                    width: 100%;
                    height: 100%;
                    cursor: pointer;
                }

                .slide-indicators {
                    position: fixed;
                    bottom: 40px;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    gap: 12px;
                    z-index: 10000;
                }

                .slide-indicator {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.3);
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    padding: 0;
                }

                .slide-indicator:hover {
                    background: rgba(255, 255, 255, 0.6);
                    transform: scale(1.2);
                }

                .slide-indicator.active {
                    background: #fff;
                    width: 24px;
                    border-radius: 4px;
                }

                .slide-nav {
                    position: fixed;
                    top: 50%;
                    transform: translateY(-50%);
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 50%;
                    width: 48px;
                    height: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    z-index: 10000;
                    padding: 0;
                }

                .slide-nav:hover {
                    background: rgba(255, 255, 255, 0.2);
                    transform: translateY(-50%) scale(1.1);
                }

                .slide-nav-prev {
                    left: 40px;
                }

                .slide-nav-next {
                    right: 40px;
                }

                .start-demo-text {
                    font-size: 14px;
                    font-weight: 600;
                    white-space: nowrap;
                    padding: 0 16px;
                }

                .slide-nav:has(.start-demo-text) {
                    width: auto;
                    border-radius: 24px;
                    padding: 0 24px;
                }

                @media (max-width: 768px) {
                    .slide-nav {
                        width: 40px;
                        height: 40px;
                    }

                    .slide-nav-prev {
                        left: 20px;
                    }

                    .slide-nav-next {
                        right: 20px;
                    }

                    .slide-indicators {
                        bottom: 20px;
                    }
                }
            `}</style>
        </div>
    );
}
