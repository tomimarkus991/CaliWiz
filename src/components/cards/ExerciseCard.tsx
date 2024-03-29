/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable @typescript-eslint/no-unused-vars */
import clsx from "clsx";
import { intervalToDuration, secondsToMinutes } from "date-fns";
import type { Identifier } from "dnd-core";
import { useField } from "formik";
import update from "immutability-helper";
import { useCallback, useRef } from "react";
import { useDrop, useDrag, XYCoord } from "react-dnd";
import { HiX } from "react-icons/hi";

import { useDeleteAllWorkoutExercises } from "../../hooks/mutations/useDeleteAllWorkoutExercises";
import { useDeleteExercise } from "../../hooks/mutations/useDeleteExercise";

interface Props {
  sets: number;
  reps: number | string;
  rest: number;
  duration: number;
  name: string;
  setIsEditingExercise?: (isEditingExercise: boolean) => void;
  exerciseId?: string;
  workoutId?: string;
  creator?: boolean;
  index?: number;
  setWasSomethingDeletedOrMoved?: (wasSomethingDeletedOrMoved: boolean) => void;
}

export const ExerciseCard = ({ duration, reps, rest, sets, name }: Props) => {
  const { minutes, seconds } = intervalToDuration({
    start: 0,
    end: rest * 1000,
  });

  return (
    <div className="p-2 border border-blue-600 rounded-lg whitespace-nowrap">
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center">
          <p>{sets}x</p>
          <p>
            {(reps === 0 || reps === "") && duration > 0
              ? `${duration}s`
              : `${reps === 999 ? "Max" : reps} reps`}
          </p>
          <p className="ml-3 mr-2 whitespace-normal">{name}</p>
        </div>
        <div className="flex flex-row items-center justify-center">
          {rest <= 60 ? (
            <p>{rest}s rest</p>
          ) : (
            <p>
              {minutes}m {String(seconds).padStart(2, "0")}s rest
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

interface DragItem {
  index: number;
  id: string;
  type: string;
}

export const FormikExerciseCard = ({
  name,
  sets,
  reps,
  rest,
  duration,
  setIsEditingExercise,
  exerciseId,
  workoutId,
  creator = false,
  index,
  setWasSomethingDeletedOrMoved,
}: Props) => {
  // @ts-ignore
  const [field, _, { setValue }] = useField("exercises");

  const [__, ___, { setValue: setExerciseValue }] = useField("exercise");
  const [____, _____, { setValue: setSetsValue }] = useField("sets");
  const [______, _______, { setValue: setRepsValue }] = useField("reps");
  const [________, _________, { setValue: setRestValue }] = useField("rest");
  const [__________, ___________, { setValue: setDurationValue }] = useField("duration");
  const [____________, _____________, { setValue: setExerciseId }] = useField("exerciseId");

  const { mutate: deleteAllWorkoutExercises } = useDeleteAllWorkoutExercises();
  const { mutate: deleteExercise } = useDeleteExercise();

  const handleCardClick = () => {
    setExerciseValue(name);
    setSetsValue(sets);
    setRepsValue(reps);
    setRestValue(rest);
    setDurationValue(duration);
    setExerciseId(exerciseId);

    setIsEditingExercise && setIsEditingExercise(true);
  };

  const handleExerciseMove = useCallback((dragIndex: number, hoverIndex: number) => {
    setWasSomethingDeletedOrMoved && setWasSomethingDeletedOrMoved(true);
    setValue(
      update(field.value, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, field.value[dragIndex] as any],
        ],
      }),
    );
  }, []);

  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: Identifier | null }>({
    accept: "EXERCISE_CARD",
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      // console.log(hoverMiddleY, clientOffset, hoverClientY);

      if (!hoverIndex) {
        return;
      }

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      handleExerciseMove(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: "EXERCISE_CARD",
    item: () => {
      return { exerciseId, index };
    },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      data-handler-id={handlerId}
      key={exerciseId}
      className={clsx(
        "flex flex-row border border-blue-600 rounded-lg whitespace-nowrap",
        isDragging && "opacity-50 scale-75",
      )}
    >
      <div className="flex flex-row items-center justify-between w-full" onClick={handleCardClick}>
        <div className="flex flex-row items-center p-2">
          <p>{sets}x</p>
          <p>
            {(reps === 0 || reps === "") && duration > 0
              ? `${duration}s`
              : `${reps === 999 ? "Max" : reps} reps`}
          </p>
          <p className="ml-3 mr-2 whitespace-normal">{name}</p>
        </div>
        <div className="flex flex-row items-center justify-center">
          {rest < 60 ? <p>{rest}s rest</p> : <p>{secondsToMinutes(rest)}m rest</p>}
        </div>
      </div>

      <div className="flex items-center justify-center">
        <HiX
          className="ml-2 mr-1 size-8 icon"
          onClick={() => {
            setWasSomethingDeletedOrMoved && setWasSomethingDeletedOrMoved(true);
            if (field.value.length === 1) {
              setValue([]);

              workoutId && deleteAllWorkoutExercises({ id: workoutId });
            } else {
              setValue([
                ...field.value.filter(
                  (exercise: { exerciseId: string }) => exercise.exerciseId !== exerciseId,
                ),
              ]);
              if (exerciseId && !creator) {
                deleteExercise({ id: exerciseId });
              }
            }
          }}
        />
      </div>
    </div>
  );
};
