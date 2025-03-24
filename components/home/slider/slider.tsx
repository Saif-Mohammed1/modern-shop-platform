"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import "./styles.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";

export default function Slider() {
  const images = [
    "/slider/shop_1.jpg",
    "/slider/shop_2.jpg",
    "/slider/shop_3.jpg",
    "/slider/shop_4.jpg",
    "/slider/shop_5.jpg",
    "/slider/shop_6.jpg",
  ];
  return (
    <>
      <Swiper
        // pagination={{
        //   dynamicBullets: true,
        // }}
        // autoplay={{
        //   delay: 4000,
        // }}
        spaceBetween={50}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000 }}
        modules={[Pagination, Autoplay, Navigation]}
        className="h-[40dvh] lg:h-[60dvh]  rounded-3xl"
      >
        {images.map((image, index) => (
          <SwiperSlide key={uuidv4()}>
            <Image
              src={image}
              alt={"Slide " + index + 1}
              width={600}
              height={600}
              priority
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
}
