import { prisma } from "@/lib/prisma"
import { OpenAI } from "openai"
import { z } from "zod"
import { zodResponseFormat } from "openai/helpers/zod"

export async function trackInteraction(
    input: string,
    output: string,
    eventName: string,
    model: string,
    urls: Array<any>,
    conversationIdentifier: string,
    projectId: string,
    organizationId: string
) {
    try {

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        })

        const topics = await prisma.topic.findMany({
            where: {
                projectId: projectId,
                organizationId: organizationId
            }
        });

        const usecases = await prisma.useCase.findMany({
            where: {
                projectId: projectId,
                organizationId: organizationId
            }
        });

        const issues = await prisma.issue.findMany({
            where: {
                projectId: projectId,
                organizationId: organizationId
            }
        });

        const topicsText = topics.map(topic => `
            Topic: ${topic.id}\n
            ${topic.name}: ${topic.description}\n
            ---
        `).join('\n');

        const usecasesText = usecases.map(usecase => `
            UseCase: ${usecase.id}\n
            ${usecase.name}: ${usecase.description}\n
            ---
        `).join('\n');

        const issuesText = issues.map(issue => `
            Issue: ${issue.id}\n
            ${issue.name}: ${issue.description}\n
            ---
        `).join('\n');

        let previousInteractions = ""
        let conversationId = ""


        if (conversationIdentifier) {
            let conversation = await prisma.conversation.findFirst({
                where: {
                    identifier: conversationIdentifier,
                    projectId: projectId,
                    organizationId: organizationId
                }
            });

            if (!conversation) {
                conversation = await prisma.conversation.create({
                    data: {
                        identifier: conversationIdentifier,
                        projectId: projectId,
                        organizationId: organizationId
                    }
                });
            }

            const interactions = await prisma.interaction.findMany({
                where: {
                    conversationId: conversation.id,
                    organizationId: organizationId,
                    projectId: projectId
                }
            })

            previousInteractions = interactions.map(interaction => `
                Interaction: ${interaction.id}\n
                ${interaction.input}\n
                ${interaction.output}\n
                ---
            `).join('\n')

            conversationId = conversation.id
        }

        const prompt = `
            ${conversationId &&
            `Previous Interactions:\n
            ----------------------\n
            ${previousInteractions}\n`}
            
            Current Input:\n
            ----------------------\n
            ${input}\n
            
            Current Output:\n
            ----------------------\n
            ${output}\n
            
            Topics:\n
            ----------------------\n
            ${topicsText}\n
            
            UseCases:\n
            ----------------------\n
            ${usecasesText}\n
            
            Issues:\n
            ----------------------\n
            ${issuesText}\n

            Based on the previous interactions, topics, use cases and issues, please provide a detailed analysis of the interaction.\n
            Matching Topics (Array of topics [ID])\n
            Matching UseCases (Array of use cases [ID])\n   
            Matching Issues (Array of issues [ID])\n

            New topics (Array of topics [Name, Description])\n
            New use cases (Array of use cases [Name, Description])\n
            New issues (Array of issues [Name, Description])\n

            Give detailed explanation for the analysis
        `

        const llmout = await openai.beta.chat.completions.parse({
            model: model,
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that analyzes interactions and provides detailed analysis."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            response_format: zodResponseFormat(z.object({
                topics: z.array(z.string()).describe("Array of topics [ID]"),
                useCases: z.array(z.string()).describe("Array of use cases [ID]"),
                issues: z.array(z.string()).describe("Array of issues [ID]"),
                newTopics: z.array(z.object({
                    name: z.string().describe("Name of the topic"),
                    description: z.string().describe("Description of the topic")
                })).describe("Array of topics [Name, Description]"),
                newUseCases: z.array(z.object({
                    name: z.string().describe("Name of the use case"),
                    description: z.string().describe("Description of the use case")
                })).describe("Array of use cases [Name, Description]"),
                newIssues: z.array(z.object({
                    name: z.string().describe("Name of the issue"),
                    description: z.string().describe("Description of the issue")
                })).describe("Array of issues [Name, Description]"),
                explanation: z.string().describe("Detailed explanation for the analysis")
            }), "analysis")
        })

        const result = llmout.choices[0].message.parsed

        if (!result) {
            throw new Error("Failed to parse the output")
        }


        let event = await prisma.event.findFirst({
            where: {
                name: eventName,
                projectId: projectId,
                organizationId: organizationId
            }
        })

        if (!event) {
            event = await prisma.event.create({
                data: {
                    name: eventName,
                    projectId: projectId,
                    organizationId: organizationId
                }
            })
        }


        // Add the Interaction
        const interaction = await prisma.interaction.create({
            data: {
                input: input,
                output: output,
                eventId: event.id,
                model: model,
                prompt: prompt,
                projectId: projectId,
                organizationId: organizationId,
                urls: urls
            }
        })

        for (let newTopic of result.newTopics) {
            const topic = await prisma.topic.create({
                data: {
                    name: newTopic.name,
                    description: newTopic.description,
                    projectId: projectId,
                    organizationId: organizationId
                }
            })

            await prisma.interactionTopic.create({
                data: {
                    interactionId: interaction.id,
                    topicId: topic.id
                }
            })
        }

        for (let newUseCase of result.newUseCases) {
            const useCase = await prisma.useCase.create({
                data: {
                    name: newUseCase.name,
                    description: newUseCase.description,
                    projectId: projectId,
                    organizationId: organizationId
                }
            })

            await prisma.interactionUseCase.create({
                data: {
                    interactionId: interaction.id,
                    useCaseId: useCase.id
                }
            })
        }

        for (let newIssue of result.newIssues) {
            const issue = await prisma.issue.create({
                data: {
                    name: newIssue.name,
                    description: newIssue.description,
                    projectId: projectId,
                    organizationId: organizationId
                }
            })

            await prisma.interactionIssue.create({
                data: {
                    interactionId: interaction.id,
                    issueId: issue.id
                }
            })
        }

        for (let topicId of result.topics) {

            const topic = await prisma.topic.findFirst({
                where: {
                    id: topicId,
                    projectId: projectId,
                    organizationId: organizationId
                }
            })

            if (!topic) {
                continue
            }

            await prisma.interactionTopic.create({
                data: {
                    interactionId: interaction.id,
                    topicId: topic.id
                }
            })
        }

        for (let useCaseId of result.useCases) {
            const useCase = await prisma.useCase.findFirst({
                where: {
                    id: useCaseId,
                    projectId: projectId,
                    organizationId: organizationId
                }
            })

            if (!useCase) {
                continue
            }

            await prisma.interactionUseCase.create({
                data: {
                    interactionId: interaction.id,
                    useCaseId: useCase.id
                }
            })
        }

        for (let issueId of result.issues) {
            const issue = await prisma.issue.findFirst({
                where: {
                    id: issueId,
                    projectId: projectId,
                    organizationId: organizationId
                }
            })

            if (!issue) {
                continue
            }

            await prisma.interactionIssue.create({
                data: {
                    interactionId: interaction.id,
                    issueId: issue.id
                }
            })
        }


    } catch (error) {
        console.error('Tracker Error:', error);
        throw new Error(`Failed to track interaction: ${error}`);
    }
}
