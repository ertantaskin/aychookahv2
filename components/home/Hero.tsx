"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  mobileImage?: string | null;
  ctaText: string;
  ctaLink: string;
  position: 'left' | 'center' | 'right';
  showContent?: boolean;
  showOverlay?: boolean;
}

interface HeroSlideData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  mobileImage?: string | null;
  ctaText: string;
  ctaLink: string;
  position: string;
  order: number;
  isActive: boolean;
  showContent?: boolean;
  showOverlay?: boolean;
}

interface HeroProps {
  slides?: HeroSlideData[];
}

const Hero: React.FC<HeroProps> = ({ slides: initialSlides }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Default slides (fallback)
  const defaultSlides: Slide[] = [
    {
      id: 1,
      title: "Lüks Nargile",
      subtitle: "Sanatının Zirvesi",
      description: "El işçiliği ile üretilmiş özel tasarım nargile takımları ve orijinal Rus nargile ekipmanları. Geleneksel zanaat, modern tasarımla buluşuyor.",
      image: "/images/hero/slide-2.jpg",
      ctaText: "Ürünleri Keşfet",
      ctaLink: "/urunler",
      position: "left"
    },
    {
      id: 2,
      title: "Rus Koleksiyonu",
      subtitle: "Orijinal İthalat",
      description: "Doğrudan Rusya'dan ithal edilen orijinal nargile takımları. Yüzyıllık geleneğin modern yorumu.",
      image: "/images/hero/slide-2.jpg",
      ctaText: "Koleksiyonu İncele",
      ctaLink: "/urunler",
      position: "center"
    },
    {
      id: 3,
      title: "El İşçiliği",
      subtitle: "Ustaların Eseri",
      description: "Her bir ürün, ustalarımızın yılların deneyimiyle şekillenen titiz çalışmasının ürünüdür.",
      image: "/images/hero/slide-3.jpg",
      ctaText: "Hikayemizi Keşfet",
      ctaLink: "/hakkimizda",
      position: "right"
    }
  ];

  // Use initial slides from props or default
  const [slides, setSlides] = useState<Slide[]>(
    initialSlides && initialSlides.length > 0
      ? initialSlides
          .filter((slide) => slide.isActive)
          .sort((a, b) => a.order - b.order)
          .map((slide, index) => ({
            id: index + 1,
            title: slide.title,
            subtitle: slide.subtitle,
            description: slide.description,
            image: slide.image,
            mobileImage: slide.mobileImage,
            ctaText: slide.ctaText,
            ctaLink: slide.ctaLink,
            position: slide.position as "left" | "center" | "right",
            showContent: slide.showContent ?? true,
            showOverlay: slide.showOverlay ?? true,
          }))
      : defaultSlides
  );

  // Load slides from database if not provided via props (fallback)
  useEffect(() => {
    if (initialSlides && initialSlides.length > 0) {
      // Already have slides from props, no need to fetch
      return;
    }

    const loadSlides = async () => {
      try {
        const response = await fetch("/api/hero", { cache: "no-store" });
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            const formattedSlides: Slide[] = data
              .filter((slide: any) => slide.isActive)
              .sort((a: any, b: any) => a.order - b.order)
              .map((slide: any, index: number) => ({
                id: index + 1,
                title: slide.title,
                subtitle: slide.subtitle,
                description: slide.description,
                image: slide.image,
                mobileImage: slide.mobileImage,
                ctaText: slide.ctaText,
                ctaLink: slide.ctaLink,
                position: slide.position as "left" | "center" | "right",
                showContent: slide.showContent ?? true,
                showOverlay: slide.showOverlay ?? true,
              }));
            if (formattedSlides.length > 0) {
              setSlides(formattedSlides);
            }
          }
        }
      } catch (error) {
        console.error("Error loading hero slides:", error);
        // Keep default slides on error
      }
    };

    loadSlides();
  }, [initialSlides]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section className="relative overflow-hidden bg-luxury-black -mt-20 pt-20">
      {/* Slider Container */}
      <div className="relative h-[70vh]">
        {/* Slides */}
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide
                ? 'opacity-100 translate-x-0'
                : index < currentSlide
                ? 'opacity-0 -translate-x-full'
                : 'opacity-0 translate-x-full'
            }`}
          >
            {/* Background Image with Optional Overlay */}
            <div className="absolute inset-0">
              {/* Desktop Image */}
              <div 
                className="hidden md:block w-full h-full bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: slide.showOverlay !== false
                    ? `linear-gradient(rgba(10, 10, 10, 0.7), rgba(26, 26, 26, 0.5)), url(${slide.image})`
                    : `url(${slide.image})`
                }}
              />
              {/* Mobile Image */}
              <div 
                className="md:hidden w-full h-full bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: slide.showOverlay !== false
                    ? `linear-gradient(rgba(10, 10, 10, 0.7), rgba(26, 26, 26, 0.5)), url(${slide.mobileImage || slide.image})`
                    : `url(${slide.mobileImage || slide.image})`
                }}
              />
            </div>

            {/* Animated Background Elements - Only if overlay is enabled */}
            {slide.showOverlay !== false && (
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(212,175,55,0.08),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(212,175,55,0.04),transparent_50%)]" />
              </div>
            )}

            {/* Content - Only if showContent is true */}
            {slide.showContent !== false && (
              <div className={`relative z-10 h-full flex items-center ${
                slide.position === 'left' ? 'justify-start' :
                slide.position === 'right' ? 'justify-end' :
                'justify-center'
              }`}>
                <div className={`px-8 sm:px-12 lg:px-16 py-12 max-w-2xl ${
                  slide.position === 'center' ? 'text-center' : 'text-left'
                }`}>
                  {/* Description */}
                  <p 
                    className={`font-sans text-lg sm:text-xl md:text-2xl text-white font-light mb-8 leading-relaxed transition-all duration-1000 ${
                      isVisible && index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}
                  >
                    {slide.description}
                  </p>

                  {/* CTA Button */}
                  {slide.ctaText && slide.ctaLink && (
                    <div 
                      className={`transition-all duration-1000 delay-200 ${
                        isVisible && index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                      }`}
                    >
                      <Link 
                        href={slide.ctaLink}
                        className="group relative inline-flex items-center gap-3 px-8 py-4 bg-luxury-goldLight text-luxury-black font-semibold rounded-full overflow-hidden transition-all duration-300 uppercase tracking-wider text-sm shadow-2xl hover:shadow-luxury-goldLight/50 hover:scale-105"
                      >
                        <span className="relative z-10">{slide.ctaText}</span>
                        <svg className="relative z-10 w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                        <div className="absolute inset-0 bg-gradient-to-r from-luxury-gold to-luxury-goldLight opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-8 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 bg-luxury-black/50 backdrop-blur-sm border border-luxury-goldLight/30 rounded-full flex items-center justify-center text-luxury-goldLight hover:bg-luxury-goldLight hover:text-luxury-black transition-all duration-300 hover:scale-110"
          aria-label="Önceki slide"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-8 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 bg-luxury-black/50 backdrop-blur-sm border border-luxury-goldLight/30 rounded-full flex items-center justify-center text-luxury-goldLight hover:bg-luxury-goldLight hover:text-luxury-black transition-all duration-300 hover:scale-110"
          aria-label="Sonraki slide"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-luxury-goldLight scale-125'
                  : 'bg-luxury-lightGray/50 hover:bg-luxury-goldLight/70'
              }`}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-luxury-black/30">
          <div 
            className="h-full bg-luxury-goldLight transition-all duration-100 ease-linear"
            style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;