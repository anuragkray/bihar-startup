"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./Carousel.module.css";

// Define Type for Image Data
interface ImageData {
  image_id: string;
  alt: string;
  path: string;
  slogan: string;
}

// Define Props Type
interface CarouselProps {
  images: ImageData[];
}

const CarouselClient: React.FC<CarouselProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slogan, setSlogan] = useState("");

  useEffect(() => {
    let charIndex = 0;
    let typingTimeout: NodeJS.Timeout;
    let switchInterval: NodeJS.Timeout;

    // Reset slogan before typing starts
    setSlogan(""); // Clear the previous slogan before starting new typing

    // Function to type out the slogan
    const typeSlogan = () => {
      if (charIndex < images[currentIndex].slogan.length) {
        setSlogan(
          (prev) => prev + images[currentIndex].slogan.charAt(charIndex)
        );
        charIndex++;
        typingTimeout = setTimeout(typeSlogan, 200); // Typing speed
      } else {
        // Delay before switching image to allow full slogan display
        switchInterval = setTimeout(() => {
          setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 2000);
      }
    };

    // Ensure first character is included by starting the typing function without delay
    typeSlogan();

    return () => {
      clearTimeout(typingTimeout);
      clearTimeout(switchInterval);
    };
  }, [currentIndex]);

  return (
    <div className={styles.carousel}>
      <div className={styles.imageContainer}>
        {images.map((img, index) => (
          <Image
            key={img.image_id}
            src={img.path}
            alt={img.alt}
            fill
            className={`${styles.image} ${
              index === currentIndex ? styles.imageActive : ""
            }`}
            sizes="100vw"
          />
        ))}
      </div>

      {/* Slogan Typing Effect */}
      <div className={styles.sloganContainer}>
        <span className={styles.slogan}>{slogan}</span>
      </div>
    </div>
  );
};

export default CarouselClient;
