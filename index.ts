import { serve, env } from "bun";
import { CronJob } from "cron";
import { HumanMessage, initChatModel, SystemMessage } from "langchain";
import { agent } from "./agent";
import { db } from "./db";
import { jobs, steps, stepTypesEnum } from "./db/schema";
import { sql } from "drizzle-orm";

const job = new CronJob("* * * * *", async() => {
  
  const queuedJobs = await db.select().from(jobs).where(sql`next_run_at <= ${Math.floor(Date.now() / 1000)}`)
  
  console.log("queued jobs", queuedJobs)
  
  for (const job of queuedJobs) {
    const jobSteps = await db.select().from(steps).where(sql`job_id = ${job.id}`)
    
    for (const step of jobSteps) {
      console.log("step", step)
      if (step.type === stepTypesEnum[0]) {
        
        const config: { url: string; method: string }= JSON.parse(step.config as string)
        const res = await fetch(config.url, {
          method: config.method
        })
        
        console.log(await res.json())
      }
      
      
      
      // if (step.type === stepTypesEnum[1]) {
        
      //   step.config.
      // }
      
    }
  }
})

job.start()

const response = await agent.invoke({
  messages: [
    new SystemMessage(`Only include steps explicitly required by the user.
    
    Do NOT add:
    - email steps
    - condition steps
    - webhooks
    
    unless the user explicitly asks for them.`),
    new HumanMessage(
      `Every weekday every 1 minutes, get top 5 youtube channels`,
    ),
  ],
});

console.log(response.messages[response.messages.length - 1]?.content);

serve({
  port: env.PORT || 5000,

  routes: {
    "/upload": async (req) => {
        
        return new Response(JSON.stringify({done: "done"}), {
          headers: {
            "Content-Type": "application/json",
          }
        });
    
    },
  },
});

console.log("Listening on port", env.PORT || 5000);
