import * as yup from "yup";

const CreateExercise = yup
  .object()
  .shape({
    exercise: yup.string().nullable().optional(),
    sets: yup.number().optional().min(1).default(0),
    reps: yup.number().min(1).default(0),
    duration: yup.number().nullable().optional().min(1),
    rest: yup.number().min(0).default(0),
    order: yup.number().nullable().optional().min(0),
  })
  .test("reps-duration", "Either reps or duration can be set", function (value) {
    const { reps, duration } = value;
    if (reps && duration) {
      return this.createError({
        message: "Either reps or duration can be set",
        path: "reps",
      });
    }
    return true;
  });
const CreateWorkout = yup.object().shape({
  name: yup.string().nullable().required("Name is required"),
  averageCompletionTime: yup.number().nullable().min(0),
  image: yup.string().nullable(),
  sequentialSets: yup.boolean().nullable().default(true),
  exercises: yup.array().of(CreateExercise).default([]).required("Exercises are required"),
});

export type CreateWorkoutFormValues = yup.InferType<typeof CreateWorkout>;
export type Workout = yup.InferType<typeof CreateWorkout> & { id: string; duration: number };
export type ExerciseFormValues = yup.InferType<typeof CreateExercise>;
export type Exercise = yup.InferType<typeof CreateExercise> & { id: string };

export const YupSchemas = { CreateWorkout, CreateExercise };
