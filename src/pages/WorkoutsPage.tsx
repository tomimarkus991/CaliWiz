import { Link } from "@tanstack/react-router";
import { FiPlusCircle } from "react-icons/fi";

import { NavbarBottom, RealButton, WorkoutCard } from "../components";
import { useGetWorkouts, useUser } from "../hooks";

type WorkoutStatistics = {
  completion_time: number | null;
  created_at: string;
};

const calculateAverageWorkoutCompletionTime = (workoutStatistics: WorkoutStatistics[]) => {
  const workoutStatisticsToUse = workoutStatistics.slice(
    workoutStatistics.length - 3,
    workoutStatistics.length,
  );

  if (!Array.isArray(workoutStatistics) || workoutStatistics.length === 0) {
    return "";
  }

  const totalCompletionTime = workoutStatisticsToUse.reduce(
    (accumulator, currentStatistic) => accumulator + (currentStatistic.completion_time || 0),
    0,
  );

  const averageCompletionTimeInSeconds = totalCompletionTime / workoutStatisticsToUse.length;
  const averageCompletionTimeInMinutes = averageCompletionTimeInSeconds / 60;

  if (Math.floor(averageCompletionTimeInMinutes) < 10) {
    return `${Math.floor(averageCompletionTimeInMinutes)}:${Math.round(
      averageCompletionTimeInSeconds % 60,
    )
      .toString()
      .padStart(2, "0")}`;
  }
  return `${Math.floor(averageCompletionTimeInMinutes)}m`;
};

export const WorkoutsPage = () => {
  const { data: user } = useUser();
  const { data: workouts, isLoading } = useGetWorkouts();

  if (!workouts && isLoading) {
    return <p></p>;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center mt-40">
        <p className="mb-6 text-5xl font-bold">CaliWiz</p>
        <Link to="/login">
          <RealButton variant="blue1">Login</RealButton>
        </Link>
        <Link to="/register">
          <RealButton className="mt-4" variant="blue2">
            Register
          </RealButton>
        </Link>
      </div>
    );
  }
  if (!workouts || workouts.length === 0) {
    return (
      <div className="flex items-center justify-center mt-40">
        <Link to="/create-workout">
          <FiPlusCircle className="cursor-pointer icon size-20" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md m-auto mt-1 mb-24">
      <div className="mx-4">
        {workouts?.map(workout => (
          <WorkoutCard
            key={workout.id}
            id={workout.id}
            name={workout.workout_name}
            image={workout.image}
            averageCompletionTime={calculateAverageWorkoutCompletionTime(workout.workout_statistic)}
          />
        ))}
        <Link to="/create-workout">
          <FiPlusCircle className="mx-auto mt-2 cursor-pointer icon size-20" />
        </Link>
      </div>

      <NavbarBottom />
    </div>
  );
};
