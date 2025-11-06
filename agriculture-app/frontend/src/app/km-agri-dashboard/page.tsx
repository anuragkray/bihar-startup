import Carousel from "../../components/dashboard/dashboard-carousel/Carousel";
import ShopContainer from "../../components/dashboard/shops/ShopContainer";
import Slogan from "../../components/dashboard/slogan/Slogan";
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
