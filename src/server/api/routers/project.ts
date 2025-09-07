import z from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { pollCommits } from "@/lib/github";
import { indexGithubRepo } from "@/lib/github-loader";
import { id } from "date-fns/locale";

async function processProject(
  projectId: string,
  githubUrl: string,
  githubToken?: string,
) {
  try {
    console.log(`Starting background processing for project: ${projectId}`);
    await indexGithubRepo(projectId, githubUrl, githubToken);
    await pollCommits(projectId);
    console.log(`Finished background processing for project: ${projectId}`);
  } catch (error) {
    console.error(`Failed to process project: ${projectId}`, error);
  }
}

export const projectRouter = createTRPCRouter({
  createProject: protectedProcedure
    .input(
      z.object({
        projectName: z.string().min(1).max(100),
        githubUrl: z.string(),
        githubToken: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.create({
        data: {
          githubUrl: input.githubUrl,
          name: input.projectName,
          userToProjects: {
            create: { userId: ctx.user.userId! },
          },
        },
      });
      void processProject(project.id, input.githubUrl, input.githubToken);
      return project;
    }),
  getProjects: protectedProcedure
    .input(z.object({}).optional())
    .query(async ({ ctx }) => {
      return await ctx.db.project.findMany({
        where: {
          userToProjects: { some: { userId: ctx.user.userId! } },
          deletedAt: null,
        },
      });
    }),
  getCommits: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      // pollCommits(input.projectId).then().catch(console.error);
      return await ctx.db.commit.findMany({
        where: {
          projectId: input.projectId,
        },
      });
    }),
});
