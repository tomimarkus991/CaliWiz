/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */

import { Link, useParams } from "@tanstack/react-router";
import { HiArrowLeft } from "react-icons/hi";
import Skeleton from "react-loading-skeleton";

import { useGetWorkout } from "../../../hooks";
import { AnimationWrapper, animations } from "../../animations";
import { RealButton } from "../../button";
import { ExerciseCard } from "../../cards";

interface Props {
  isWorkingOut: boolean;
  setIsWorkingOut: (isWorkingOut: boolean) => void;
  setWorkoutSpeed: (workoutSpeed: number) => void;
}

export const WorkoutInfo = ({ isWorkingOut, setIsWorkingOut, setWorkoutSpeed }: Props) => {
  const { id } = useParams({ strict: false });

  const { data: workout, isLoading } = useGetWorkout(id);

  return (
    <div className="flex flex-col max-w-md min-h-screen p-4 m-auto">
      <div className="flex flex-row items-center my-4 mx-7">
        <div className="mr-4">
          <AnimationWrapper variants={animations.smallScale}>
            <Link
              to="/update-workout/$id"
              params={{
                id,
              }}
            >
              <p className="text-2xl font-semibold underline">{workout?.workout_name}</p>
            </Link>
          </AnimationWrapper>
        </div>
        <Link className="ml-auto" to="/">
          <HiArrowLeft className="icon" />
        </Link>
      </div>
      {isLoading ? (
        <Skeleton className="h-40" />
      ) : (
        <img
          src={`/workout/${workout?.image}`}
          className="object-cover w-full h-40 aspect-auto rounded-xl"
          alt="workout-img"
        />
      )}

      <div className="mx-auto mt-auto">
        <RealButton
          className="mt-4"
          variant="blue"
          size="lg"
          onClick={() => setIsWorkingOut(!isWorkingOut)}
        >
          Start workout
        </RealButton>
      </div>

      <div className="mx-auto mt-auto">
        <RealButton
          className="mt-4 mr-3"
          variant="blue"
          size="lg"
          onClick={() => {
            setIsWorkingOut(!isWorkingOut);
            setWorkoutSpeed(2);
          }}
        >
          2x
        </RealButton>
        <RealButton
          className="mt-4 mr-3"
          variant="blue"
          size="lg"
          onClick={() => {
            setIsWorkingOut(!isWorkingOut);
            setWorkoutSpeed(3);
          }}
        >
          3x
        </RealButton>
        <RealButton
          className="mt-4"
          variant="blue"
          size="lg"
          onClick={() => {
            setIsWorkingOut(!isWorkingOut);
            setWorkoutSpeed(4);
          }}
        >
          4x
        </RealButton>
      </div>

      <div>
        <p className="mt-6 mb-3 text-2xl font-semibold">Exercises</p>
        {isLoading ? (
          <Skeleton className="h-12" />
        ) : (
          <div className="space-y-2">
            {workout?.exercise.map(exercise => {
              return (
                <ExerciseCard
                  key={exercise.id}
                  duration={exercise.duration}
                  sets={exercise.sets}
                  reps={exercise.reps}
                  rest={exercise.rest}
                  name={exercise.exercise_name}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
