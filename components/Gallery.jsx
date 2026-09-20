"use client";
import React, { useState } from "react";
import Image from "next/image";

const Gallery = ({ images, alt }) => {
  const list = images.filter(Boolean);
  const [main, setMain] = useState(0);
  if (!list.length) return null;

  return (
    <div>
      <div className="rounded-4xl overflow-hidden bg-white border border-black/10 shadow-card aspect-square">
        <Image
          key={main}
          src={list[main]}
          alt={alt}
          className="w-full h-full object-cover"
          width={900}
          height={900}
          priority
        />
      </div>
      {list.length > 1 && (
        <div className="grid grid-cols-4 gap-3 mt-3">
          {list.map((src, i) => (
            <button
              key={i}
              onClick={() => setMain(i)}
              className={`rounded-2xl overflow-hidden aspect-square border-2 transition ${
                i === main ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={src} alt={`${alt} - фото ${i + 1}`} className="w-full h-full object-cover" width={200} height={200} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Gallery;
