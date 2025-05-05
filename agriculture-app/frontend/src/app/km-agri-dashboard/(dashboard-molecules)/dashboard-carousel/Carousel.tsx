import CarouselClient from "./client/CarouselClient";

const CarouselWrapper = () => {
  const images = [
    {
      image_id: "Carousel_Image_Ladies",
      alt: "Images with ladies working in agriculture field",
      path: "/images/Carousel_Image_Ladies.jpg",
      slogan: "   KM Agri – Your Trusted Partner in Agriculture.",
    },
    {
      image_id: "Carousel_Image_Man",
      alt: "Images with man working in agriculture field",
      path: "/images/Carousel_Image_Man.jpg",
      slogan: " Growing Together with Nature",
    },
    {
      image_id: "Carousel_Image_Ox",
      alt: "Images with ox working in agriculture field",
      path: "/images/Carousel_Image_Ox.jpg",
      slogan: " We are farmer friends",
    },
  ];

  return <CarouselClient images={images} />;
};

export default CarouselWrapper;
