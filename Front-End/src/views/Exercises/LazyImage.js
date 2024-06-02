import React, { useRef, useEffect, useState } from 'react';

const LazyImage = ({ src, alt }) => {
  const imgRef = useRef();
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    const img = imgRef.current;

    const handleIntersection = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setImageSrc(src);
          observer.unobserve(img);
          console.log("Lazy load slike:", src);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection);

    if (img) {
      observer.observe(img);
    }

    return () => {
      if (img) {
        observer.unobserve(img);
      }
    };
  }, [src]);

  return <img ref={imgRef} src={imageSrc} alt={alt} />;
};

export default LazyImage;
