import { Link } from "@tanstack/react-router";
import { FaFootball, FaUser } from "react-icons/fa6";
import { IoStatsChart } from "react-icons/io5";

import { animations, AnimationWrapper } from "../animations";

export const NavbarBottom = () => (
  <div className="flex fixed bottom-0 z-40 max-w-md items-center py-4 m-2 w-[95%] h-fit bg-slate-800 rounded-md shadow-2xl">
    <div className="flex flex-row justify-around w-full">
      <Link to="/statistics">
        <AnimationWrapper variants={animations.smallScale} key="nb-home-icon">
          {/* <FaNoteSticky className="cursor-not-allowed icon-fill opacity-60" /> */}
          <IoStatsChart className="icon-fill" />
        </AnimationWrapper>
      </Link>
      <Link to="/">
        <AnimationWrapper variants={animations.smallScale} key="nb-chart-icon">
          {/* <MdOutlineSportsMartialArts className="cursor-pointer size-10 fill-slate-700 hover:fill-slate-800" /> */}
          <FaFootball className="icon-fill" />
        </AnimationWrapper>
      </Link>
      <Link to="/profile" disabled>
        <AnimationWrapper variants={animations.smallScale} key="nb-chart-icon">
          <FaUser className="cursor-not-allowed icon-fill opacity-60" />
        </AnimationWrapper>
      </Link>
    </div>
  </div>
);
