/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { add, format, setHours } from "date-fns";
import { useEffect, useState } from "react";
import { HiX, HiOutlineVolumeUp, HiOutlineVolumeOff } from "react-icons/hi";

import { RealButton } from "@/components";
import { useGetWorkout } from "@/hooks";

export const WorkoutPage = () => {
  const { id } = useParams({ strict: false });

  const { data: workout, isLoading, error } = useGetWorkout(id);

  const navigate = useNavigate();

  const formatTime = (totalSeconds: number, desiredFormat = "mm:ss") => {
    if (totalSeconds <= 0) {
      return "00:00";
    }

    const baseDate = setHours(new Date(), 0).setMinutes(0, 0, 0);
    const date = add(baseDate, { seconds: totalSeconds });
    return format(date, desiredFormat);
  };

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [isWorkoutFinished, setIsWorkoutFinished] = useState(false);

  // this counts down rest periods
  const [restCountdown, setRestCountdown] = useState(0);
  const [durationCountdown, setDurationCountdown] = useState(0);

  const [totalWorkoutTime, setTotalWorkoutTime] = useState(0);
  const [totalWorkoutTimerActive, setTotalWorkoutTimerActive] = useState(false);

  const currentExercise = workout?.exercise[currentExerciseIndex]!;
  const nextExercise = workout?.exercise[currentExerciseIndex + 1];

  useEffect(() => {
    let restTimeout: any;
    if (isResting && restCountdown === 0) {
      restTimeout = setTimeout(() => {
        setIsResting(false);
        if (currentSet < currentExercise?.sets) {
          setCurrentSet(currentSet + 1);
        } else {
          // eslint-disable-next-line no-use-before-define
          handleCompleteExercise();
        }
      }, 1000);
    }

    return () => clearTimeout(restTimeout);
  }, [isResting, restCountdown, currentSet, currentExercise?.sets]);

  useEffect(() => {
    let interval: any;

    if (isResting) {
      setRestCountdown(currentExercise.rest);
      interval = setInterval(() => {
        setRestCountdown(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isResting]);

  useEffect(() => {
    let interval: any;

    if (currentExercise?.duration !== 0 && !isResting) {
      setDurationCountdown(currentExercise?.duration || 0);
      interval = setInterval(() => {
        setDurationCountdown(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [currentExercise?.duration, isResting]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (totalWorkoutTimerActive) {
      interval = setInterval(() => {
        setTotalWorkoutTime(prev => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [totalWorkoutTimerActive]);

  // Start the total timer when the workout begins
  useEffect(() => {
    setTotalWorkoutTimerActive(true);
    return () => setTotalWorkoutTimerActive(false); // Stop the timer when the component unmounts
  }, []);

  if (error?.message) {
    navigate({ to: "/" });
  }

  const handleCompleteExercise = () => {
    if (currentSet < currentExercise.sets) {
      setCurrentSet(currentSet + 1);

      setRestCountdown(currentExercise?.rest || 0);
      setIsResting(true);

      // else (when the last set ends): go to next exercise
    } else {
      const nextIndex = currentExerciseIndex + 1;
      if (nextIndex < workout!.exercise.length) {
        setCurrentExerciseIndex(nextIndex);
        setCurrentSet(1);
      }
    }
  };

  if (isLoading && !workout && !currentExercise) {
    return <p>Loading...</p>;
  }

  if (isWorkoutFinished) {
    return (
      <div className="mt-40 text-center">
        <p className="text-2xl">Workout Complete</p>
        <p className="text-2xl">Time: {formatTime(totalWorkoutTime, "HH:mm:ss")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex items-center justify-between p-4">
        <Link to="/">
          <HiX className="icon" />
        </Link>
        <p className="mx-auto text-xl font-semibold font-number">
          {formatTime(totalWorkoutTime, "HH:mm:ss")}
        </p>
        <div className="flex items-center space-x-2">
          {true ? <HiOutlineVolumeUp className="icon" /> : <HiOutlineVolumeOff className="icon" />}
        </div>
      </div>

      <div className="p-4">
        <div className="relative text-center">
          {!isResting && (
            <img
              alt="Exercise"
              className="w-full h-[200px] relative"
              src="/general/placeholder.svg"
              style={{
                aspectRatio: "355/200",
                objectFit: "cover",
              }}
            />
          )}

          {isResting && (
            <p className="mt-32 text-5xl font-bold font-number">{formatTime(restCountdown)}</p>
          )}
          {currentExercise.duration !== 0 && !isResting && (
            <p className="z-10 mt-6 text-3xl font-bold font-number">
              {formatTime(durationCountdown)}
            </p>
          )}
        </div>

        {!isResting && (
          <div className="mt-4 mb-2 text-center">
            {currentExercise.reps !== 0 && (
              <p className="text-2xl font-bold">{currentExercise.reps} reps</p>
            )}
            <p className="text-2xl font-semibold">{currentExercise.exercise_name}</p>
            <p className="mt-5 text-3xl font-semibold">
              Set {currentSet + currentExercise.sets - currentExercise.sets}
            </p>
          </div>
        )}
      </div>

      {!nextExercise && currentExercise.sets === currentSet ? (
        <>
          <div className="p-4 mt-auto bg-slate-800">
            <p className="text-2xl font-semibold text-center">Last set</p>

            <RealButton
              className="w-full mt-6 mb-4"
              variant="blue"
              onClick={() => {
                setTotalWorkoutTimerActive(false);
                setIsWorkoutFinished(true);
              }}
            >
              Complete workout
            </RealButton>
          </div>
        </>
      ) : (
        <div className="p-4 mt-auto bg-slate-800">
          <p className="tracking-wide uppercase text-slate-100">next up</p>
          {currentSet < currentExercise.sets ? (
            <div className="flex items-center p-3">
              <img
                alt="Exercise"
                className="size-14"
                src="/general/placeholder.svg"
                style={{
                  objectFit: "cover",
                }}
              />
              <div className="ml-4">
                <p className="text-lg font-semibold">{currentExercise.exercise_name}</p>
                <p className="text-sm text-gray-600">
                  {isResting
                    ? `Next up set ${currentSet}`
                    : `After this ${currentExercise.sets - currentSet} sets left`}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center p-3">
              <img
                alt="Exercise"
                className="size-14"
                src="/general/placeholder.svg"
                style={{
                  objectFit: "cover",
                }}
              />
              <div className="ml-4">
                {isResting ? (
                  <>
                    <p className="text-lg font-semibold">{currentExercise?.exercise_name}</p>
                    <p className="text-sm text-gray-600">Last set</p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-semibold">{nextExercise?.exercise_name}</p>
                    <p className="text-sm text-gray-600">{nextExercise?.sets} sets</p>
                  </>
                )}
              </div>
            </div>
          )}

          {isResting ? (
            <div className="flex flex-row justify-between mt-4">
              <RealButton
                className="px-2 w-14"
                variant="blue"
                onClick={() => setRestCountdown(prev => Math.max(prev - 10, 0))}
              >
                -10
              </RealButton>
              <RealButton variant="blue" onClick={() => setIsResting(false)}>
                Skip rest
              </RealButton>
              <RealButton
                className="px-2 w-14"
                variant="blue"
                onClick={() => setRestCountdown(prev => prev + 10)}
              >
                +10
              </RealButton>
            </div>
          ) : (
            <RealButton className="w-full mt-4" variant="blue" onClick={handleCompleteExercise}>
              {currentSet < currentExercise.sets ? "Complete set" : "Complete exercise"}
            </RealButton>
          )}
        </div>
      )}
    </div>
  );
};
// useEffect(() => {
//   // when sequentialSets do nothing

//   if (workout.sequentialSets === false) {
//     // destructure the array based on sets
//     // so if pullups 3, pushups 2, squats 3, plank 1
//     // then array should be [pullups,pushups,squats,plank, pullups pushups,squats, pulluups,squats, pullups, squats]

//     // for (const exercise of workout.exercises) {
//     // }
//     // count exercise sets
//     // const maxSets = Math.max(...workout.exercises.map(e => e.sets));

//     let totalSets = 0;
//     for (const exercise of workout.exercises) {
//       totalSets += exercise.sets;
//     }
//     totalSets = 9;

//     console.log("totalsets", totalSets);

//     for (let i = 0; i < totalSets; i++) {
//       workout.exercises.forEach(exercise => {
//         let currentExerciseIndex = 0;
//         if (workout.exercises[currentExerciseIndex].sets > 0) {
//           workout.exercises[currentExerciseIndex].sets--;
//           setExerciseState(prev => [...prev, { ...exercise, sets: 1, order: prev.length + 1 }]);
//         } else {
//           currentExerciseIndex++;
//         }
//         currentExerciseIndex++;
//       });
//     }
//   }
// }, []);
