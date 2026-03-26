import { tool } from "langchain";
import z from "zod";
import { db } from "./db";
import { jobs, steps, stepTypesEnum } from "./db/schema";
import { parseCronExpression } from 'cron-schedule';
import { id } from "zod/v4/locales";

const getCurrentDateTime = tool(
  ({ location }) => {
    return `The current date and time is ${new Date(Date.now())}`;
  },
  {
    name: "get_current_date_and_time",
    description: "Get current date and time details",
    schema: z.object({
      location: z
        .string()
        .describe("Location of the request")
        .default("Africa/Lagos"),
    }),
  },
);

const createJobSteps = tool(
  async({ steps: s, schedule, name }) => {
    console.log("steps", schedule, name);
    
    const cron = parseCronExpression(schedule);
    
    console.log("cron here ", cron.getNextDate())
    
    const job = await db.insert(jobs).values({
      name,
      schedule,
      nextRunAt: cron.getNextDate(),
      createdAt: new Date(),
    }).returning({ id: jobs.id });
    
    await db.insert(steps).values(s.map((step) => ({
      name: step.id,
      type: step.type,
      config: JSON.stringify(step.config),
      createdAt: new Date(),
      jobId: job[0]!.id,
    })));
    
    return "Job created successfully";
  },
  {
    name: "create_job_steps",
    description: "Create steps for cron jobs. Each step has a type and a config object. For http_request steps, provide method and url in config. For condition steps, provide expression, if_true, and if_false in config. For send_mail steps, provide to, subject, and body in config.",
    schema: z.object({
      name: z.string().describe("Name of the job"),
      schedule: z.string().describe("Cron schedule for the job"),
      steps: z.array(
        z.discriminatedUnion("type", [
          z.object({
            id: z.string().describe("Unique step id"),
            type: z.literal(stepTypesEnum[0]).describe("The type of step"),
            config: z.object({
              method: z.enum(["GET", "POST"]).describe("HTTP method (for http_request)").optional(),
              url: z.string().describe("URL to request (for http_request)").optional(),
            }),
          }),
          z.object({
            id: z.string().describe("Unique step id"),
            type: z.literal(stepTypesEnum[1]).describe("The type of step"),
            config: z.object({
              expression: z.string().describe("Boolean expression referencing previous steps (for condition)").optional(),
              if_true: z.enum(["continue", "stop"]).describe("Action if condition is true (for condition)").optional(),
              if_false: z.enum(["continue", "stop"]).describe("Action if condition is false (for condition)").optional(),
            }),
          }),
          z.object({
            id: z.string().describe("Unique step id"),
            type: z.literal(stepTypesEnum[2]).describe("The type of step"),
            config: z.object({
              to: z.string().describe("Email address (for send_mail)").optional(),
              subject: z.string().describe("Email subject (for send_mail)").optional(),
              body: z.string().describe("Email body (for send_mail)").optional(),
            }),
          }),
        ])
      ).describe("Array of job steps"),
    }),
  }
);

export { getCurrentDateTime, createJobSteps };
