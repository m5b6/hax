"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export function Slide01Adsombroso() {
    return (
        <div className="slide-01-adsombroso">
            <div className="slide-container">
                {/* Left side - Image */}
                <motion.div
                    className="image-section"
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                >
                    <div className="image-wrapper">
                        <Image
                            src="/slides/slide-1-adsombroso.png"
                            alt="Frustrated people with Meta ads"
                            fill
                            className="slide-image"
                            priority
                        />
                    </div>
                </motion.div>

                {/* Right side - Text */}
                <motion.div
                    className="content-section"
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                >
                    <div className="content-wrapper">
                        <motion.h1
                            className="title"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                        >
                            ADSOMBROSO!
                        </motion.h1>
                        <motion.p
                            className="subtitle"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.7 }}
                        >
                            Hacemos que las campañas
                            <br />
                            trabajen por ti y no tú por ellas
                        </motion.p>

                        <motion.div
                            className="logo"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.6, delay: 1.2, ease: "backOut" }}
                        >
                            <div className="logo-circle">
                                <span className="logo-text">Ao.</span>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>

            <style jsx>{`
                .slide-01-adsombroso {
                    width: 100%;
                    height: 100%;
                    background: #000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 60px;
                }

                .slide-container {
                    width: 100%;
                    max-width: 1400px;
                    height: 100%;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 80px;
                    align-items: center;
                }

                .image-section {
                    position: relative;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .image-wrapper {
                    position: relative;
                    width: 100%;
                    aspect-ratio: 1;
                    max-width: 600px;
                    border-radius: 24px;
                    overflow: hidden;
                    box-shadow: 
                        0 20px 60px rgba(0, 0, 0, 0.5),
                        0 0 100px rgba(147, 51, 234, 0.3);
                }

                .slide-image {
                    object-fit: cover;
                }

                .content-section {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: flex-start;
                    height: 100%;
                }

                .content-wrapper {
                    max-width: 600px;
                }

                .title {
                    font-size: 96px;
                    font-weight: 900;
                    color: #fff;
                    line-height: 1;
                    margin: 0 0 40px 0;
                    letter-spacing: -0.03em;
                    background: linear-gradient(135deg, #fff 0%, #a855f7 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .subtitle {
                    font-size: 36px;
                    font-weight: 400;
                    color: rgba(255, 255, 255, 0.9);
                    line-height: 1.4;
                    margin: 0 0 80px 0;
                    letter-spacing: -0.01em;
                }

                .logo {
                    display: flex;
                    align-items: center;
                }

                .logo-circle {
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #9333ea 0%, #ec4899 50%, #f59e0b 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 
                        0 0 60px rgba(147, 51, 234, 0.6),
                        0 0 100px rgba(236, 72, 153, 0.4);
                }

                .logo-text {
                    font-size: 48px;
                    font-weight: 700;
                    color: #fff;
                    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
                }

                /* Responsive */
                @media (max-width: 1200px) {
                    .slide-01-adsombroso {
                        padding: 40px;
                    }

                    .slide-container {
                        gap: 60px;
                    }

                    .title {
                        font-size: 72px;
                    }

                    .subtitle {
                        font-size: 28px;
                    }
                }

                @media (max-width: 968px) {
                    .slide-01-adsombroso {
                        padding: 30px;
                    }

                    .slide-container {
                        grid-template-columns: 1fr;
                        grid-template-rows: auto auto;
                        gap: 40px;
                    }

                    .image-wrapper {
                        max-width: 400px;
                    }

                    .title {
                        font-size: 56px;
                    }

                    .subtitle {
                        font-size: 24px;
                        margin-bottom: 40px;
                    }

                    .logo-circle {
                        width: 100px;
                        height: 100px;
                    }

                    .logo-text {
                        font-size: 40px;
                    }
                }

                @media (max-width: 640px) {
                    .slide-01-adsombroso {
                        padding: 20px;
                    }

                    .slide-container {
                        gap: 30px;
                    }

                    .image-wrapper {
                        max-width: 300px;
                    }

                    .title {
                        font-size: 40px;
                        margin-bottom: 20px;
                    }

                    .subtitle {
                        font-size: 18px;
                        margin-bottom: 30px;
                    }

                    .logo-circle {
                        width: 80px;
                        height: 80px;
                    }

                    .logo-text {
                        font-size: 32px;
                    }
                }
            `}</style>
        </div>
    );
}
