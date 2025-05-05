import Carousel from "./(dashboard-molecules)/dashboard-carousel/Carousel";
import ShopContainer from "./(dashboard-molecules)/shops/ShopContainer";
import Slogan from "./(dashboard-molecules)/slogan/Slogan";
import { redirect } from "next/navigation";

const KMAgriDashboard = () => {
  return (
    <>
      <Carousel />
      <Slogan />
      <ShopContainer />
    </>
  );
};
export default KMAgriDashboard;
